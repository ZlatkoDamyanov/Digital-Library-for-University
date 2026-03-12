import React from 'react';
import BookCard from './BookCard';
import './BookList.css';

export default function BookList({ books, loading, error }) {
  if (loading) {
    return <p className="status-text">Зареждане...</p>;
  }

  if (error) {
    return <p className="status-text error">{error}</p>;
  }

  if (books.length === 0) {
    return <p className="status-text">Няма налични книги</p>;
  }

  return (
    <div className="book-list-container">
      <div className="book-grid">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
} 