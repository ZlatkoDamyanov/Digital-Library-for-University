import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();

const createBorrowRecordsTableSQL = `
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

const pool = new Pool();

async function createBorrowRecordsTable() {
  try {
    console.log('Започвам създаване на таблицата borrow_records...');
    
    await pool.query(createBorrowRecordsTableSQL);
    
    console.log('✅ Таблицата borrow_records е създадена успешно!');
    console.log('✅ Индексите са създадени успешно!');
    
  } catch (error) {
    console.error('❌ Грешка при създаване на таблицата borrow_records:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createBorrowRecordsTable(); 