import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) {
      // Навигиране към страница за търсене с query параметър
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        className="search-input"
        placeholder="Търси заглавие, автор, жанр или ISBN"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </form>
  );
} 