import db from '../database/dlibrarydb.js';

const checkAdmin = async () => {
  try {
    const result = await db.query(
      `SELECT id, "firstName", "lastName", email, role, status, password
       FROM users 
       WHERE email = $1`,
      ['ZDamyanov@bfu.bg']
    );

    if (result.rows.length === 0) {
      console.log('User does not exist in the database');
    } else {
      const user = result.rows[0];
      console.log('User found:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password
      });
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
};

// Run the check
checkAdmin().catch(console.error); 