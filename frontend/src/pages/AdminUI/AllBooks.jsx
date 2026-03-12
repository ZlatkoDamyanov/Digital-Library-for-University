/**
 * Компонент за показване на всички книги в админския панел  
 * Позволява преглед, редактиране и изтриване на книги
 * Включва търсене и сортиране по различни критерии
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import HeaderAdmin from '../../components/layout/HeaderAdmin';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import './AllBooks.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AllBooks() {
  const { fetchBooks, books, deleteBook } = useAdmin();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Highlight matching text
  const highlightText = (text, search) => {
    if (!search.trim() || !text) return text;
    
    const regex = new RegExp(`(${search.trim()})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Format cell content with highlighting
  const formatCell = (content, searchTerm) => {
    if (!searchTerm.trim() || !content) return content;
    return <span dangerouslySetInnerHTML={{ __html: highlightText(content, searchTerm) }} />;
  };

  /**
   * Зарежда всички книги при първоначално зареждане на компонента
   */
  useEffect(() => {
    fetchBooks()
      .then((response) => {
        // Книгите са заредени успешно
      })
      .catch(error => {
        // Грешка при зареждане на книгите
      });
  }, []);

  // Update filtered books when books or search term changes
  useEffect(() => {
    if (!Array.isArray(books)) {
      setFilteredBooks([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredBooks(books);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filtered = books.filter(book => 
      book.title?.toLowerCase().includes(searchTermLower) ||
      book.author?.toLowerCase().includes(searchTermLower) ||
      book.category?.toLowerCase().includes(searchTermLower) ||
      book.isbn?.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredBooks(filtered);
  }, [books, searchTerm]);

  /**
   * Обработва търсенето на книги по заглавие, автор или категория
   */
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  /**
   * Подготвя книга за изтриване и показва модал за потвърждение
   */
  const handleDeleteBook = (bookId) => {
    if (!Array.isArray(books)) {
      return;
    }
    const book = books.find(b => b.id === bookId);
    if (!book) {
      return;
    }
    setBookToDelete(book);
    setShowDeleteConfirm(true);
  };

  /**
   * Потвърждава изтриването на книгата
   */
  const confirmDelete = async () => {
    try {
      const response = await deleteBook(bookToDelete.id);
      if (response.success) {
        setShowDeleteConfirm(false);
        setBookToDelete(null);
      } else {
        alert(response.error || 'Failed to delete book. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete book. Please try again.';
      alert(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBookToDelete(null);
  };

  return (
    <div className="all-books-container">
      <HeaderAdmin 
        placeholder="Search books by title, author, category, or ISBN..." 
        onSearch={handleSearch} 
      />
      
      <header className="books-header">
        <h1>All Books</h1>
        <div className="actions">
          <button className="sort-btn">A–Z <span>⇅</span></button>
          <Link to="/admin/books/new" className="create-btn">
            + Create New Book
          </Link>
        </div>
      </header>

      <div className="table-scroll">
        <table className="books-table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Date Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredBooks) && filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <tr key={book.id}>
                  <td className="title-cell">
                    <img 
                      src={book.image && book.image !== 'default-cover.jpg' ? `${API_URL}/uploads/books/covers/${book.image}` : ''} 
                      alt={book.title} 
                      className="book-cover"
                      onError={(e) => {
                        // Fallback to a simple placeholder
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA0MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxOEgyNFYyNkgxNlYxOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                      }}
                      style={{ 
                        display: book.image && book.image !== 'default-cover.jpg' ? 'block' : 'none' 
                      }}
                    />
                    {(!book.image || book.image === 'default-cover.jpg') && (
                      <div className="book-cover-placeholder">
                        📚
                      </div>
                    )}
                    <span className="book-title-text">
                      {formatCell(book.title, searchTerm)}
                    </span>
                  </td>
                  <td>{formatCell(book.author, searchTerm)}</td>
                  <td>{formatCell(book.category, searchTerm)}</td>
                  <td>{formatCell(book.isbn, searchTerm)}</td>
                  <td>{new Date(book.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                  <td>
                    <div className="action-cell">
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/books/${book.id}/edit`} 
                          className="edit-btn" 
                          aria-label="Edit book"
                        >
                          <img src={editIcon} alt="Edit" />
                        </Link>
                        <button 
                          className="delete-btn" 
                          aria-label="Delete book"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          <img src={deleteIcon} alt="Delete" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  {Array.isArray(filteredBooks) ? 'No books found' : 'Loading books...'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete book <strong>{bookToDelete?.title}</strong>?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="cancel-btn">Cancel</button>
              <button onClick={confirmDelete} className="confirm-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}