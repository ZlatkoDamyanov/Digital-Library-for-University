import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import searchIcon from '../../assets/icons/search.svg';
import './HeaderAdmin.css';

export default function HeaderAdmin({ placeholder = "Search users, books by title, author, or category.", onSearch }) {
  const { user } = useUser();
  const [search, setSearch] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="dashboard-header">
      <h1>Welcome, {user ? `${user.firstName} ${user.lastName}` : 'Admin'}</h1>
      <div className="search-container">
        <img src={searchIcon} alt="Search" className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          className="dashboard-search"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
} 