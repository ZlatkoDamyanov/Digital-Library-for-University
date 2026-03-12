import db from '../database/dlibrarydb.js';

const migration = async () => {
  try {
    // Add due_date column if it doesn't exist
    await db.query(`
      ALTER TABLE borrow_records 
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);

    // Drop the existing enum type if it exists
    await db.query(`
      DO $$ 
      BEGIN 
        ALTER TABLE borrow_records ALTER COLUMN status TYPE TEXT;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'borrow_status') THEN
          DROP TYPE borrow_status;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END $$;
    `);

    // Create the new enum type
    await db.query(`
      CREATE TYPE borrow_status AS ENUM ('PENDING', 'BORROWED', 'RETURNED', 'OVERDUE');
    `);

    // Update existing statuses
    await db.query(`
      UPDATE borrow_records 
      SET status = CASE 
        WHEN status IS NULL OR status = '' THEN 'PENDING'
        WHEN status = 'ACTIVE' THEN 'BORROWED'
        WHEN status = 'BORROWED' THEN 'BORROWED'
        WHEN status = 'RETURNED' THEN 'RETURNED'
        ELSE 'PENDING'
      END;
    `);

    // Convert status column to use the new enum
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status TYPE borrow_status USING status::borrow_status;
    `);

    // Set default value
    await db.query(`
      ALTER TABLE borrow_records 
      ALTER COLUMN status SET DEFAULT 'PENDING';
    `);

    // Set due_date to borrow_date + 14 days for existing records
    await db.query(`
      UPDATE borrow_records 
      SET due_date = borrow_date + INTERVAL '14 days' 
      WHERE due_date IS NULL AND borrow_date IS NOT NULL;
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

migration().catch(console.error); 