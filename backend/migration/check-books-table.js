import pool from '../database/dlibrarydb.js';

async function checkBooksTable() {
  try {
    console.log('Checking books table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Books table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    const booksCount = await pool.query('SELECT COUNT(*) as count FROM books');
    console.log(`\n📚 Total books in database: ${booksCount.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking books table:', error);
    process.exit(1);
  }
}

checkBooksTable(); 