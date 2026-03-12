import db from '../database/dlibrarydb.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const restoreAdmin = async () => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['ZDamyanov@bfu.bg']
    );

    if (existingUser.rows.length > 0) {
      console.log('User already exists');
      await client.query('ROLLBACK');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

    // Create the admin user
    const result = await client.query(
      `INSERT INTO users (
        "firstName",
        "lastName",
        email,
        password,
        role,
        status,
        status_updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, "firstName", "lastName", email, role, status`,
      ['Zlatko', 'Damyanov', 'ZDamyanov@bfu.bg', hashedPassword, 'ADMIN', 'APPROVED']
    );

    await client.query('COMMIT');
    
    console.log('Admin user restored successfully:', result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error restoring admin user:', error);
  } finally {
    client.release();
  }
};

// Run the restoration
restoreAdmin().catch(console.error); 