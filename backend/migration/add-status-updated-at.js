import db from '../database/dlibrarydb.js';

const migration = async () => {
  try {
    // Add status_updated_at column to borrow_records
    await db.query(`
      ALTER TABLE borrow_records 
      ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);

    // Add status_updated_at column to users
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);

    // Update existing records to have status_updated_at = created_at
    await db.query(`
      UPDATE borrow_records 
      SET status_updated_at = created_at 
      WHERE status_updated_at IS NULL;
    `);

    await db.query(`
      UPDATE users 
      SET status_updated_at = created_at 
      WHERE status_updated_at IS NULL;
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

migration().catch(console.error); 