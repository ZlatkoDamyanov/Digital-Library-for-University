import db from '../database/dlibrarydb.js';

const migration = async () => {
  try {
    // First, remove the default value constraint
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Convert status to text
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status TYPE TEXT;
    `);

    // Drop the existing enum type
    await db.query(`
      DROP TYPE IF EXISTS borrow_status;
    `);

    // Create the new enum type
    await db.query(`
      CREATE TYPE borrow_status AS ENUM ('PENDING', 'BORROWED', 'RETURNED', 'OVERDUE');
    `);

    // Update existing statuses to match new values
    await db.query(`
      UPDATE borrow_records 
      SET status = 'PENDING' 
      WHERE status IS NULL OR status = '';
    `);

    await db.query(`
      UPDATE borrow_records 
      SET status = 'BORROWED' 
      WHERE status = 'ACTIVE';
    `);

    await db.query(`
      UPDATE borrow_records 
      SET status = 'OVERDUE' 
      WHERE status = 'LATE RETURN';
    `);

    // Convert column to use new enum
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status TYPE borrow_status USING status::borrow_status;
    `);

    // Set default value
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status SET DEFAULT 'PENDING';
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

migration().catch(console.error); 