import express from 'express';
import { register, login, profile } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';
import db from '../database/dlibrarydb.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Auth API is working', 
    endpoints: {
      'POST /api/auth/login': 'User login',
      'POST /api/auth/register': 'User registration',
      'GET /api/auth/profile': 'Get user profile (protected)',
      'POST /api/auth/borrow-request': 'Create borrow request (protected)',
      'GET /api/auth/borrowed-books': 'Get user borrowed books (protected)'
    }
  });
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, profile);

router.get('/borrowed-books', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const borrowedBooks = await db.query(`
      SELECT 
        br.id as borrow_id,
        br.borrow_date,
        br.due_date,
        br.return_date,
        br.status,
        br.created_at,
        b.id as book_id,
        b.title,
        b.author,
        b.category,
        b.publisher,
        b."publishedYear" as year,
        b.language,
        b.pages,
        b.description,
        b.cover,
        b.pdffile as pdf
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      WHERE br.user_id = $1
      ORDER BY br.created_at DESC
    `, [userId]);
    
    const booksWithUrls = borrowedBooks.rows.map(record => ({
      borrowId: record.borrow_id,
      borrowDate: record.borrow_date,
      dueDate: record.due_date,
      returnDate: record.return_date,
      status: record.status,
      createdAt: record.created_at,
      book: {
        id: record.book_id,
        title: record.title,
        author: record.author,
        category: record.category,
        publisher: record.publisher,
        year: record.year,
        language: record.language,
        pages: record.pages,
        description: record.description,
        coverUrl: record.cover ? `http://localhost:5000/uploads/books/covers/${record.cover}` : null,
        pdfUrl: record.pdf ? `http://localhost:5000/uploads/books/pdfs/${record.pdf}` : null
      }
    }));
    
    res.json({ success: true, data: booksWithUrls });
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch borrowed books' });
  }
});

router.post('/borrow-request', (req, res, next) => {
  console.log('BORROW REQUEST ROUTE HIT - BEFORE AUTH!');
  next();
}, authenticateToken, async (req, res) => {
  console.log('BORROW REQUEST ENDPOINT REACHED AFTER AUTH!');
  try {
    const { bookId, borrowDate, returnDate } = req.body;
    const userId = req.user.sub;

    console.log('Borrow request data:', { bookId, borrowDate, returnDate, userId });

    if (!bookId || !borrowDate || !returnDate) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Book ID, borrow date, and return date are required' 
      });
    }

    console.log('Validating dates:', { borrowDate, returnDate });
    const borrow = new Date(borrowDate);
    const returnDateObj = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Parsed dates:', { borrow, returnDateObj, today });

    if (borrow < today) {
      console.log('Borrow date is in the past');
      return res.status(400).json({ 
        success: false, 
        error: 'Borrow date cannot be in the past' 
      });
    }

    if (returnDateObj <= borrow) {
      console.log('Return date is not after borrow date');
      return res.status(400).json({ 
        success: false, 
        error: 'Return date must be after borrow date' 
      });
    }

    const maxReturnDate = new Date(borrow);
    maxReturnDate.setDate(maxReturnDate.getDate() + 14);
    
    console.log('Max return date:', maxReturnDate);
    
    if (returnDateObj > maxReturnDate) {
      console.log('Return date is more than 14 days from borrow date');
      return res.status(400).json({ 
        success: false, 
        error: 'Return date cannot be more than 14 days from borrow date' 
      });
    }

    console.log('Checking book with ID:', bookId);
    const bookResult = await db.query(
      'SELECT id, title, "availableCopies", "totalCopies" FROM books WHERE id = $1',
      [bookId]
    );

    console.log('Book query result:', bookResult.rows);

    if (bookResult.rows.length === 0) {
      console.log('Book not found');
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    const book = bookResult.rows[0];
    if (book.availableCopies <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No available copies of this book' 
      });
    }

    console.log('Checking for existing borrow record');
    const existingBorrow = await db.query(
      `SELECT id, status 
       FROM borrow_records 
       WHERE user_id = $1 AND book_id = $2 
       AND status IN ('PENDING', 'BORROWED', 'OVERDUE')
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, bookId]
    );

    console.log('Existing borrow records:', existingBorrow.rows);

    if (existingBorrow.rows.length > 0) {
      const status = existingBorrow.rows[0].status;
      let errorMessage = 'Cannot borrow this book at the moment.';
      
      switch(status) {
        case 'BORROWED':
          errorMessage = 'You already have this book borrowed';
          break;
        case 'PENDING':
          errorMessage = 'You have a pending request for this book';
          break;
        case 'OVERDUE':
          errorMessage = 'You have an overdue return for this book';
          break;
      }
      
      console.log(`User has existing ${status} status for this book`);
      return res.status(400).json({ 
        success: false, 
        error: errorMessage
      });
    }

    console.log('Creating borrow record with params:', [userId, bookId, borrowDate, returnDate, 'PENDING']);
    const borrowResult = await db.query(
      'INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, borrow_date, due_date, status, created_at',
      [userId, bookId, borrowDate, returnDate, 'PENDING']
    );

    console.log('Borrow record created:', borrowResult.rows[0]);

    console.log('Updating available copies for book:', bookId);
    await db.query(
      'UPDATE books SET "availableCopies" = "availableCopies" - 1 WHERE id = $1',
      [bookId]
    );

    console.log('Available copies updated successfully');

    const newBorrowRecord = borrowResult.rows[0];

    res.json({ 
      success: true, 
      data: newBorrowRecord,
      message: 'Book borrowed successfully' 
    });

  } catch (error) {
    console.error('Error creating borrow request:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ success: false, error: 'Failed to create borrow request', details: error.message });
  }
});

export default router;
