import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'dlibrarydb',
  user: 'postgres',
  password: '024416'
});

const checkUser = async () => {
  const client = await pool.connect();
  
  try {
    // Find user by name
    const userResult = await client.query(
      `SELECT id, "firstName", "lastName", email, role, status
       FROM users 
       WHERE "firstName" = $1 AND "lastName" = $2`,
      ['Ivan', 'Ivanov']
    );

    if (userResult.rows.length === 0) {
      console.log('User not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('User found:', user);

    // Check borrow records
    const borrowsResult = await client.query(
      `SELECT br.id, br.status, br.borrow_date, br.return_date, br.due_date,
              b.title as book_title
       FROM borrow_records br
       JOIN books b ON br.book_id = b.id
       WHERE br.user_id = $1`,
      [user.id]
    );

    console.log('\nBorrow records:', borrowsResult.rows);
    
    if (borrowsResult.rows.length > 0) {
      console.log('\nActive borrow records:');
      borrowsResult.rows.forEach(record => {
        if (record.status === 'BORROWED' || record.status === 'OVERDUE') {
          console.log(`- Book: ${record.book_title}`);
          console.log(`  Status: ${record.status}`);
          console.log(`  Borrow date: ${record.borrow_date}`);
          console.log(`  Due date: ${record.due_date}`);
          console.log('---');
        }
      });
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the check
checkUser().catch(console.error); 