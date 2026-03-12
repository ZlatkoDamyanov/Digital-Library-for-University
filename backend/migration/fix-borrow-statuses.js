import db from '../database/dlibrarydb.js';

const migration = async () => {
  try {
    // Add due_date column if it doesn't exist
    await db.query(`
      ALTER TABLE borrow_records 
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);

    // First, convert status to text to handle the updates
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status TYPE TEXT;
    `);

    // Update empty or null statuses to PENDING
    await db.query(`
      UPDATE borrow_records 
      SET status = 'PENDING' 
      WHERE status IS NULL OR status = '';
    `);

    // Update ACTIVE to BORROWED
    await db.query(`
      UPDATE borrow_records 
      SET status = 'BORROWED' 
      WHERE status = 'ACTIVE';
    `);

    // Set due_date for borrowed books
    await db.query(`
      UPDATE borrow_records 
      SET due_date = borrow_date + INTERVAL '14 days' 
      WHERE due_date IS NULL AND borrow_date IS NOT NULL;
    `);

    // Update overdue books
    await db.query(`
      UPDATE borrow_records 
      SET status = 'OVERDUE' 
      WHERE status = 'BORROWED' AND due_date < CURRENT_DATE;
    `);

    // Now convert back to enum
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