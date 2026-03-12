import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './database/dlibrarydb.js';  
import authRoutes from './routes/auth.js';  
import adminRoutes from './routes/admin.js';
import authenticateToken from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  next();
});

app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '';
    let orderClause = 'ORDER BY created_at DESC';
    
    switch (filter) {
      case 'popular':
        whereClause = 'WHERE "availableCopies" > 0';
        orderClause = 'ORDER BY ("totalCopies" - "availableCopies") DESC, created_at DESC';
        break;
      case 'recent':
        whereClause = '';
        orderClause = 'ORDER BY created_at DESC';
        break;
      case 'author':
        whereClause = '';
        orderClause = 'ORDER BY author ASC, title ASC';
        break;
      case 'genre':
        whereClause = '';
        orderClause = 'ORDER BY category ASC, title ASC';
        break;
      default:
        whereClause = '';
        orderClause = 'ORDER BY created_at DESC';
    }
    
    const countQuery = `SELECT COUNT(*) FROM books ${whereClause}`;
    const countResult = await db.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    const booksQuery = `
      SELECT id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, 
             language, pages, "totalCopies" as copies, "availableCopies", description, 
             cover, pdffile as pdf, created_at as "createdAt" 
      FROM books 
      ${whereClause} 
      ${orderClause} 
      LIMIT $1 OFFSET $2
    `;
    
    const books = await db.query(booksQuery, [parseInt(limit), offset]);
    
    const booksWithUrls = books.rows.map(book => ({
      ...book,
      coverUrl: book.cover ? `http://localhost:${PORT}/uploads/books/covers/${book.cover}?t=${Date.now()}` : null,
      category: book.category || 'Неопределен'
    }));
    
    res.json({ 
      success: true, 
      books: booksWithUrls,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      hasMore: offset + booksWithUrls.length < totalCount
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
});

app.get('/api/books/recommended', async (req, res) => {
  try {
    const books = await db.query(
      'SELECT id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, language, pages, "totalCopies" as copies, "availableCopies", description, cover, pdffile as pdf, created_at as "createdAt" FROM books WHERE "availableCopies" > 0 ORDER BY "availableCopies" DESC, created_at DESC LIMIT 12'
    );
    
    const booksWithUrls = books.rows.map(book => ({
      ...book,
      coverUrl: book.cover ? `http://localhost:${PORT}/uploads/books/covers/${book.cover}?t=${Date.now()}` : null,
      category: book.category || 'Неопределен'
    }));
    
    res.json({ success: true, books: booksWithUrls });
  } catch (error) {
    console.error('Error fetching recommended books:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommended books' });
  }
});


app.get('/api/books/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }
    
    const searchQuery = `%${q}%`;
    const books = await db.query(
      `SELECT id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, language, pages, "totalCopies" as copies, "availableCopies", description, cover, pdffile as pdf, created_at as "createdAt" 
       FROM books 
       WHERE LOWER(title) LIKE LOWER($1) 
       OR LOWER(author) LIKE LOWER($1) 
       OR LOWER(category) LIKE LOWER($1)
       OR LOWER(description) LIKE LOWER($1)
       OR LOWER("ISBN") LIKE LOWER($1)
       ORDER BY 
         CASE 
           WHEN LOWER(title) LIKE LOWER($1) THEN 1
           WHEN LOWER(author) LIKE LOWER($1) THEN 2
           WHEN LOWER(category) LIKE LOWER($1) THEN 3
           WHEN LOWER("ISBN") LIKE LOWER($1) THEN 4
           ELSE 5
         END,
         "availableCopies" DESC,
         created_at DESC`,
      [searchQuery]
    );
    
    const booksWithUrls = books.rows.map(book => ({
      ...book,
      coverUrl: book.cover ? `http://localhost:${PORT}/uploads/books/covers/${book.cover}?t=${Date.now()}` : null,
      category: book.category || 'Неопределен'
    }));
    
    res.json({ success: true, books: booksWithUrls, total: booksWithUrls.length });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ success: false, error: 'Failed to search books' });
  }
});


app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await db.query(
      'SELECT id, title, author, category, publisher, "publishedYear" as year, "ISBN" as isbn, language, pages, "totalCopies" as copies, "availableCopies", description, cover, pdffile as pdf, created_at as "createdAt" FROM books WHERE id = $1',
      [id]
    );
    
    if (book.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    
    const bookData = book.rows[0];
    const bookWithUrl = {
      ...bookData,
      coverUrl: bookData.cover ? `http://localhost:${PORT}/uploads/books/covers/${bookData.cover}?t=${Date.now()}` : null,
      category: bookData.category || 'Неопределен'
    };
    
    res.json({ success: true, book: bookWithUrl });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch book' });
  }
});


app.get('/api/covers', async (req, res) => {
  try {
    const coversDir = path.join(__dirname, 'uploads/books/covers');
    const files = await fs.promises.readdir(coversDir);
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    const coversWithStats = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(coversDir, file);
        const stats = await fs.promises.stat(filePath);
        return {
          filename: file,
          url: `/uploads/books/covers/${file}`,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
    );
    
    coversWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ success: true, data: coversWithStats });
  } catch (error) {
    console.error('Error fetching covers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch covers' });
  }
});



app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  
  // Test database connection
  try {
    await db.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
});
