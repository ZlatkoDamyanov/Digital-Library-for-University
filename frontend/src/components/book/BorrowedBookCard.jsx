import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookCover from './BookCover';
import './BorrowedBookCard.css';

const BorrowedBookCard = ({ borrowRecord }) => {
  const navigate = useNavigate();
  const { book, borrowDate, dueDate, returnDate, status } = borrowRecord;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysLeft = () => {
    if (status === 'RETURNED' || !dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getStatusInfo = () => {
    const daysLeft = getDaysLeft();
    
    if (status === 'RETURNED') {
      return {
        text: 'Върната',
        className: 'returned',
        icon: '✅'
      };
    }
    
    if (daysLeft === null) {
      return {
        text: 'Неизвестно',
        className: 'unknown',
        icon: '❓'
      };
    }
    
    if (daysLeft < 0) {
      return {
        text: 'Просрочена връщане',
        className: 'overdue',
        icon: '⚠️'
      };
    }
    
    if (daysLeft === 0) {
      return {
        text: 'Трябва да се върне днес',
        className: 'due-today',
        icon: '🔔'
      };
    }
    
    if (daysLeft <= 3) {
      return {
        text: `${daysLeft} дни до връщане`,
        className: 'due-soon',
        icon: '🔔'
      };
    }
    
    return {
      text: `${daysLeft} дни до връщане`,
      className: 'active',
      icon: '📅'
    };
  };

  const handleBookClick = () => {
    navigate(`/book/${book.id}`);
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="borrowed-book-card">
      {/* Status indicator overlay */}
      <div className={`status-indicator ${statusInfo.className}`}>
        <span className="status-icon">{statusInfo.icon}</span>
      </div>

      {/* Book cover */}
      <div className="book-cover-container">
        <BookCover
          src={book.coverUrl}
          title={book.title}
          author={book.author}
          size="medium"
          onClick={handleBookClick}
        />
      </div>

      {/* Book title */}
      <h3 className="book-title" onClick={handleBookClick}>
        {book.title}
      </h3>

      {/* Book author */}
      <p className="book-author">от {book.author}</p>

      {/* Book category */}
      <p className="book-category">{book.category}</p>

      {/* Borrow dates */}
      <div className="borrow-dates">
        <div className="date-row">
          <span className="date-label">📅 Взета:</span>
          <span className="date-value">{formatDate(borrowDate)}</span>
        </div>
        
        {status !== 'RETURNED' && (
          <div className="date-row">
            <span className="date-label">📆 Краен срок:</span>
            <span className="date-value">{formatDate(dueDate)}</span>
          </div>
        )}
        
        {status === 'RETURNED' && returnDate && (
          <div className="date-row">
            <span className="date-label">✅ Върната:</span>
            <span className="date-value">{formatDate(returnDate)}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className={`status-badge ${statusInfo.className}`}>
        <span className="status-icon">{statusInfo.icon}</span>
        <span className="status-text">{statusInfo.text}</span>
      </div>
    </div>
  );
};

export default BorrowedBookCard; 