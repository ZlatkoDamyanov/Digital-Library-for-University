import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();

const updateEnumSQL = `
-- Add 'LATE RETURN' to borrow_status enum
ALTER TYPE borrow_status ADD VALUE IF NOT EXISTS 'LATE RETURN';
`;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'library_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
});

async function updateBorrowStatusEnum() {
  try {
    console.log('🔄 Adding LATE RETURN to borrow_status enum...');
    
    await pool.query(updateEnumSQL);
    
    console.log('✅ LATE RETURN added to borrow_status enum successfully!');
    
  } catch (error) {
    console.error('❌ Error updating borrow_status enum:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await pool.end();
  }
}

updateBorrowStatusEnum(); 