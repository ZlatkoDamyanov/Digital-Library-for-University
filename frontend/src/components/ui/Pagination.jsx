import React from 'react';
import './Pagination.css';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5 
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous button
  if (currentPage > 1) {
    pages.push(
      <button
        key="prev"
        className="pagination-btn pagination-nav"
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Предишна страница"
      >
        ‹
      </button>
    );
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        onClick={() => onPageChange(i)}
        aria-label={`Страница ${i}`}
      >
        {i}
      </button>
    );
  }

  // Next button
  if (currentPage < totalPages) {
    pages.push(
      <button
        key="next"
        className="pagination-btn pagination-nav"
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Следваща страница"
      >
        ›
      </button>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination">
        {pages}
      </div>
    </div>
  );
} 