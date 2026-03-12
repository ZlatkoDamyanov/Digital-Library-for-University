import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';

export default function BookCard({ book }) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleImageError = (e) => {
    setImageError(true);
  };

  const handleImageLoad = (e) => {
    e.target.style.width = '100%';
    e.target.style.height = '100%';
  };

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-cover-wrapper">
        {book.coverUrl && !imageError ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="book-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="book-placeholder">
            {book.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <p className="book-category">{book.category}</p>
      </div>
    </div>
  );
} 