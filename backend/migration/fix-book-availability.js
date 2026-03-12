import db from '../database/dlibrarydb.js';

async function fixBookAvailability() {
  try {
    // Get all books with their total copies and current borrow records
    const booksResult = await db.query(`
      SELECT 
        b.id,
        b.title,
        b."totalCopies",
        b."availableCopies",
        COUNT(CASE WHEN br.status IN ('BORROWED', 'OVERDUE') THEN 1 END) as active_borrows
      FROM books b
      LEFT JOIN borrow_records br ON b.id = br.book_id
      GROUP BY b.id, b.title, b."totalCopies", b."availableCopies"
    `);

    console.log('Fixing book availability counts...');

    for (const book of booksResult.rows) {
      const correctAvailableCopies = book.totalCopies - parseInt(book.active_borrows);
      
      if (book.availableCopies !== correctAvailableCopies) {
        console.log(`Fixing book "${book.title}":
          - Current available copies: ${book.availableCopies}
          - Correct available copies: ${correctAvailableCopies}
          - Total copies: ${book.totalCopies}
          - Active borrows: ${book.active_borrows}
        `);

        await db.query(
          'UPDATE books SET "availableCopies" = $1 WHERE id = $2',
          [correctAvailableCopies, book.id]
        );
      }
    }

    console.log('Book availability counts have been fixed successfully!');
  } catch (error) {
    console.error('Error fixing book availability:', error);
    throw error;
  }
}

// Run the migration
fixBookAvailability().catch(console.error); 