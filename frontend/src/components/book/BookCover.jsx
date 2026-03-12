import React, { useState } from 'react';
import './BookCover.css';

const BookCover = ({ 
  src, 
  alt, 
  title, 
  author, 
  className = '', 
  size = 'medium',
  showOverlay = false,
  onClick 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`book-cover ${className} book-cover-${size} ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={alt || `${title} by ${author}`}
          className={`book-cover-image ${imageLoaded ? 'loaded' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className="book-cover-placeholder">
          <div className="book-icon">📚</div>
          <div className="book-title-placeholder">{title}</div>
          {author && <div className="book-author-placeholder">{author}</div>}
        </div>
      )}
      
      {showOverlay && (
        <div className="book-cover-overlay">
          <div className="overlay-content">
            <h4>{title}</h4>
            <p>{author}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCover; 