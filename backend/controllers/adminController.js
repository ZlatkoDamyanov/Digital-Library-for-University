import db from '../database/dlibrarydb.js';
export const getStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    // Get current counts
    const borrowedResult = await db.query(
      'SELECT COUNT(*) as count FROM borrow_records WHERE status = $1',
      ['BORROWED']
    );
    
    // Get counts at start of day including status changes
    const borrowedStartOfDayResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM borrow_records 
      WHERE status = 'BORROWED' 
      AND (created_at < $1 OR (status_updated_at IS NOT NULL AND status_updated_at < $1))
    `, [startOfToday]);
    
    const usersResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE status = $1',
      ['APPROVED']
    );
    
    const usersStartOfDayResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE status = 'APPROVED' 
      AND (created_at < $1 OR (status_updated_at IS NOT NULL AND status_updated_at < $1))
    `, [startOfToday]);
    
    const booksResult = await db.query(
      'SELECT COUNT(*) as count FROM books'
    );
    
    const booksStartOfDayResult = await db.query(
      'SELECT COUNT(*) as count FROM books WHERE created_at < $1',
      [startOfToday]
    );

    const currentBorrowed = parseInt(borrowedResult.rows[0]?.count || 0);
    const currentUsers = parseInt(usersResult.rows[0]?.count || 0);
    const currentBooks = parseInt(booksResult.rows[0]?.count || 0);

    const startOfDayBorrowed = parseInt(borrowedStartOfDayResult.rows[0]?.count || 0);
    const startOfDayUsers = parseInt(usersStartOfDayResult.rows[0]?.count || 0);
    const startOfDayBooks = parseInt(booksStartOfDayResult.rows[0]?.count || 0);

    const borrowedChange = currentBorrowed - startOfDayBorrowed;
    const usersChange = currentUsers - startOfDayUsers;
    const booksChange = currentBooks - startOfDayBooks;

    const stats = {
      borrowed: currentBorrowed,
      users: currentUsers,
      books: currentBooks,
      changes: {
        borrowed: borrowedChange,
        users: usersChange,
        books: booksChange
      }
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};


export const getUsers = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT 
        u.id,
        u."firstName",
        u."lastName",
        u.email,
        u.university_id as "universityId",
        u.role,
        u.status,
        u.created_at as "createdAt",
        COUNT(CASE WHEN br.status = 'BORROWED' THEN 1 END) as "borrowedCount"
      FROM users u
      LEFT JOIN borrow_records br ON u.id = br.user_id
      WHERE u.status = $1
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, ['APPROVED']);
    
    res.json({ success: true, data: users.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, universityId, status } = req.body;
    
    await db.query(
      'UPDATE users SET "firstName" = $1, "lastName" = $2, email = $3, university_id = $4, status = $5 WHERE id = $6',
      [firstName, lastName, email, universityId, status, id]
    );
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};


export const deleteUser = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // First check if user exists
    const userExists = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (userExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check for active borrows
    const activeBorrows = await client.query(
      'SELECT COUNT(*) as count FROM borrow_records WHERE user_id = $1 AND status IN (\'BORROWED\', \'OVERDUE\')',
      [id]
    );

    if (activeBorrows.rows[0].count > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete user with active borrowed books. Please ensure all books are returned first.' 
      });
    }

    // Delete all borrow records for this user
    await client.query(
      'DELETE FROM borrow_records WHERE user_id = $1',
      [id]
    );
    
    // Now delete the user
    await client.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  } finally {
    client.release();
  }
};


export const getBooks = async (req, res) => {
  try {
    const books = await db.query(
      'SELECT id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, language, pages, "totalCopies" as copies, "availableCopies", description, cover as image, pdffile as pdf, created_at as "createdAt" FROM books ORDER BY created_at DESC'
    );
    
    res.json({ success: true, data: books.rows });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
};


export const createBook = async (req, res) => {
  try {
    const { 
      title, author, publisher, year, isbn, category, 
      language, pages, copies, description
    } = req.body;
    
    if (!title || !author || !copies) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, author, and copies are required fields' 
      });
    }
    
    const publishedYear = year ? parseInt(year) : null;
    const totalCopies = copies ? parseInt(copies) : 1;
    const availableCopies = copies ? parseInt(copies) : 1;
    const pagesCount = pages ? parseInt(pages) : null;
    
    const cover = req.files?.image?.[0]?.filename || 'default-cover.jpg';
    const pdffile = req.files?.pdf?.[0]?.filename || '';
    
    const result = await db.query(
      'INSERT INTO books (title, author, category, publisher, "publishedYear", "ISBN", language, pages, "totalCopies", "availableCopies", description, cover, pdffile) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, language, pages, "totalCopies" as copies, "availableCopies", description, cover as image, pdffile as pdf, created_at as "createdAt"',
      [title, author, category, publisher, publishedYear, isbn, language, pagesCount, totalCopies, availableCopies, description, cover, pdffile]
    );
    
    const newBook = result.rows[0];
    
    res.json({ success: true, data: newBook, message: 'Book created successfully' });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ success: false, error: 'Failed to create book' });
  }
};


export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, author, publisher, year, isbn, category, 
      language, pages, copies, description, removeImage, removePdf
    } = req.body;
    
    if (!title || !author || !copies) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, author, and copies are required fields' 
      });
    }
    const publishedYear = year ? parseInt(year) : null;
    const totalCopies = copies ? parseInt(copies) : 1;
    const availableCopies = copies ? parseInt(copies) : 1;
    const pagesCount = pages ? parseInt(pages) : null;
    
    let updateFields = [
      'title = $1', 'author = $2', 'category = $3', 'publisher = $4', 
      '"publishedYear" = $5', '"ISBN" = $6', 'language = $7', 'pages = $8', 
      '"totalCopies" = $9', '"availableCopies" = $10', 'description = $11'
    ];
    let values = [title, author, category, publisher, publishedYear, isbn, language, pagesCount, totalCopies, availableCopies, description];
    
    if (req.files?.image?.[0]) {
      updateFields.push('cover = $' + (values.length + 1));
      values.push(req.files.image[0].filename);
    } else if (removeImage === 'true') {
      updateFields.push('cover = $' + (values.length + 1));
      values.push('default-cover.jpg');
    }
    
    if (req.files?.pdf?.[0]) {
      updateFields.push('pdffile = $' + (values.length + 1));
      values.push(req.files.pdf[0].filename);
    } else if (removePdf === 'true') {
      updateFields.push('pdffile = $' + (values.length + 1));
      values.push('');
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE books SET ${updateFields.join(', ')} WHERE id = $${values.length}`,
      values
    );
    
    const updatedBook = await db.query(
      'SELECT id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, language, pages, "totalCopies" as copies, "availableCopies", description, cover as image, pdffile as pdf, created_at as "createdAt" FROM books WHERE id = $1',
      [id]
    );
    
    res.json({ success: true, data: updatedBook.rows[0], message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ success: false, error: 'Failed to update book' });
  }
};


export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for active borrows
    const activeBorrows = await db.query(
      'SELECT COUNT(*) as count FROM borrow_records WHERE book_id = $1 AND status = $2',
      [id, 'BORROWED']
    );

    if (activeBorrows.rows[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete book with active borrows. Please ensure all copies are returned first.' 
      });
    }

    // Get book info for file deletion
    const book = await db.query(
      'SELECT cover, pdffile FROM books WHERE id = $1',
      [id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    // Delete borrow records first
    await db.query('DELETE FROM borrow_records WHERE book_id = $1', [id]);
    
    // Delete the book
    await db.query('DELETE FROM books WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, error: 'Failed to delete book' });
  }
};


export const getBorrowRequests = async (req, res) => {
  try {
    const requests = await db.query(`
      WITH request_status AS (
        SELECT 
          br.*,
          CASE 
            WHEN br.status = 'BORROWED' AND br.due_date < CURRENT_DATE THEN 'OVERDUE'
            ELSE br.status
          END as display_status
        FROM borrow_records br
      )
      SELECT 
        r.id,
        r.user_id,
        r.book_id,
        r.borrow_date,
        r.due_date,
        r.return_date,
        r.status,
        r.display_status,
        r.created_at,
        u."firstName" || ' ' || u."lastName" as user_name,
        u."firstName",
        u."lastName",
        u.email as user_email,
        b.title as book_title,
        b.author,
        b.cover as book_cover
      FROM request_status r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      WHERE r.status != 'RETURNED'
      ORDER BY 
        CASE 
          WHEN r.display_status = 'OVERDUE' THEN 1
          WHEN r.status = 'PENDING' THEN 2
          WHEN r.status = 'BORROWED' THEN 3
          ELSE 4
        END,
        CASE 
          WHEN r.display_status = 'OVERDUE' THEN r.due_date
          ELSE r.created_at
        END DESC
    `);
    
    const transformedRequests = requests.rows.map(request => ({
      id: request.id,
      userId: request.user_id,
      bookId: request.book_id,
      userName: request.user_name,
      userEmail: request.user_email,
      bookTitle: request.book_title,
      bookAuthor: request.author,
      bookCover: request.book_cover ? `http://localhost:5000/uploads/books/covers/${request.book_cover}` : null,
      status: request.display_status,
      borrowDate: request.borrow_date,
      returnDate: request.return_date,
      dueDate: request.due_date,
      createdAt: request.created_at
    }));
    
    res.json({ success: true, data: transformedRequests });
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch borrow requests' });
  }
};


export const updateBorrowRequest = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Get current record with book information in a transaction
    const currentRecord = await client.query(`
      SELECT 
        br.*,
        b."availableCopies",
        b."totalCopies",
        b.id as book_id,
        b.title as book_title,
        (SELECT COUNT(*) FROM borrow_records 
         WHERE book_id = b.id 
         AND status IN ('BORROWED', 'OVERDUE')) as active_borrows
      FROM borrow_records br 
      JOIN books b ON br.book_id = b.id 
      WHERE br.id = $1
      FOR UPDATE`,
      [id]
    );
    
    if (currentRecord.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Borrow record not found' });
    }
    
    const record = currentRecord.rows[0];
    const oldStatus = record.status;
    const newStatus = status.toUpperCase();

    // Validate status transition
    if (oldStatus === 'OVERDUE' && newStatus !== 'RETURNED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Overdue books can only be returned' 
      });
    }

    // Validate available copies
    if (oldStatus === 'PENDING' && newStatus === 'BORROWED') {
      const actualAvailableCopies = record.totalCopies - parseInt(record.active_borrows);
      
      if (actualAvailableCopies <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `No copies of "${record.book_title}" are available for borrowing`
        });
      }
      
      // Fix available copies if they're incorrect
      if (record.availableCopies !== actualAvailableCopies) {
        await client.query(
          'UPDATE books SET "availableCopies" = $1 WHERE id = $2',
          [actualAvailableCopies, record.book_id]
        );
        record.availableCopies = actualAvailableCopies;
      }
    }

    // Handle status transitions
    let updates = ['status = $1', 'status_updated_at = CURRENT_TIMESTAMP'];
    let values = [newStatus];

    // Handle borrow date and due date
    if (oldStatus === 'PENDING' && newStatus === 'BORROWED') {
      updates.push('borrow_date = CURRENT_TIMESTAMP');
      updates.push('due_date = CURRENT_TIMESTAMP + INTERVAL \'14 days\'');
    }

    // Handle return date
    if (newStatus === 'RETURNED') {
      updates.push('return_date = CURRENT_TIMESTAMP');
    } else {
      updates.push('return_date = NULL');
    }

    // Update the record
    await client.query(
      `UPDATE borrow_records SET ${updates.join(', ')} WHERE id = $2`,
      [newStatus, id]
    );
    
    // Update book available copies
    if (oldStatus === 'PENDING' && newStatus === 'BORROWED') {
      // Decrease available copies when book is borrowed
      await client.query(
        'UPDATE books SET "availableCopies" = "availableCopies" - 1 WHERE id = $1 AND "availableCopies" > 0',
        [record.book_id]
      );
    } else if ((oldStatus === 'BORROWED' || oldStatus === 'OVERDUE') && newStatus === 'RETURNED') {
      // Increase available copies when book is returned
      await client.query(
        'UPDATE books SET "availableCopies" = "availableCopies" + 1 WHERE id = $1',
        [record.book_id]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Borrow request updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating borrow request:', error);
    res.status(500).json({ success: false, error: 'Failed to update borrow request' });
  } finally {
    client.release();
  }
};


export const getAccountRequests = async (req, res) => {
  try {
    const requests = await db.query(
      'SELECT id, "firstName", "lastName", email, university_id as "universityId", role, status, created_at as "createdAt" FROM users WHERE status = $1 ORDER BY created_at DESC',
      ['PENDING']
    );
    
    res.json({ success: true, data: requests.rows });
  } catch (error) {
    console.error('Error fetching account requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch account requests' });
  }
};


export const updateAccountRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.query(
      'UPDATE users SET status = $1, status_updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status.toUpperCase(), id]
    );
    
    res.json({ success: true, message: 'Account request updated successfully' });
  } catch (error) {
    console.error('Error updating account request:', error);
    res.status(500).json({ success: false, error: 'Failed to update account request' });
  }
}; 