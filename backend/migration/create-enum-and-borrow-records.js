import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();

const createEnumAndTableSQL = `
-- Create custom ENUM types first
DO $$ BEGIN
    CREATE TYPE public.borrow_status AS ENUM('BORROWED', 'RETURNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create borrow_records table
CREATE TABLE IF NOT EXISTS borrow_records (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "book_id" uuid NOT NULL,
  "borrow_date" timestamptz DEFAULT now() NOT NULL,
  "due_date" date NOT NULL,
  "return_date" date,
  "status" "borrow_status" DEFAULT 'BORROWED' NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "borrow_records_id_unique" UNIQUE("id"),
  CONSTRAINT "borrow_records_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
  CONSTRAINT "borrow_records_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"("id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_borrow_records_user_id" ON "borrow_records"("user_id");
CREATE INDEX IF NOT EXISTS "idx_borrow_records_book_id" ON "borrow_records"("book_id");
CREATE INDEX IF NOT EXISTS "idx_borrow_records_status" ON "borrow_records"("status");
CREATE INDEX IF NOT EXISTS "idx_borrow_records_borrow_date" ON "borrow_records"("borrow_date");
`;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'library_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
});

async function createEnumAndBorrowRecordsTable() {
  try {
    console.log('🔄 Creating borrow_status enum and borrow_records table...');
    
    await pool.query(createEnumAndTableSQL);
    
    console.log('✅ borrow_status enum created successfully!');
    console.log('✅ borrow_records table created successfully!');
    console.log('✅ Indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating enum and borrow_records table:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await pool.end();
  }
}

createEnumAndBorrowRecordsTable(); 