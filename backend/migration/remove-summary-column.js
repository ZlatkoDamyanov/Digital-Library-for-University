import pool from '../database/dlibrarydb.js';

async function removeSummaryColumn() {
  try {
    console.log('Removing summary column from books table...');
    
    await pool.query('ALTER TABLE books DROP COLUMN IF EXISTS summary');
    
    console.log('✅ Summary column removed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing summary column:', error);
    process.exit(1);
  }
}

removeSummaryColumn(); 