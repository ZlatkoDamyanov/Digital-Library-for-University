import express from 'express';
import {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getBorrowRequests,
  updateBorrowRequest,
  getAccountRequests,
  updateAccountRequest
} from '../controllers/adminController.js';
import authenticateToken from '../middleware/auth.js';
import { uploadBookFiles } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/books', getBooks);
router.post('/books', (req, res, next) => {
  uploadBookFiles(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, createBook);
router.put('/books/:id', (req, res, next) => {
  uploadBookFiles(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, updateBook);
router.delete('/books/:id', deleteBook);

router.get('/borrow-requests', getBorrowRequests);
router.put('/borrow-requests/:id', updateBorrowRequest);

router.get('/account-requests', getAccountRequests);
router.put('/account-requests/:id', updateAccountRequest);

export default router; 