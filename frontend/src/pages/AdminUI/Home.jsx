/**
 * Главна страница на администраторския панел - Dashboard
 * Показва статистики, скорошни заявки за заемане, заявки за акаунти и нови книги
 * Предоставя бърз достъп до всички административни функции
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import HeaderAdmin from '../../components/layout/HeaderAdmin';
import calendarIcon from '../../assets/icons/calendar.svg';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Home() {
  const {
    fetchStats,
    fetchBorrowRequests,
    fetchAccountRequests,
    fetchBooks,
  } = useAdmin();

  const [stats, setStats] = useState({ 
    borrowed: 0, 
    users: 0, 
    books: 0,
    changes: {
      borrowed: 0,
      users: 0,
      books: 0
    }
  });
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    fetchStats().then((response) => {
      if (response.success) {
        setStats(response.data);
      }
    });
    fetchBorrowRequests().then((response) => {
      if (response.success && Array.isArray(response.data)) {
        // Filter out only RETURNED requests, show all others
        const activeRequests = response.data.filter(request => 
          request.status !== 'RETURNED'
        );
        
        // Sort by newest first (by borrow date or created date)
        const sorted = activeRequests
          .slice()
          .sort((a, b) => {
            const dateA = new Date(a.borrowDate || a.createdAt || 0);
            const dateB = new Date(b.borrowDate || b.createdAt || 0);
            return dateB - dateA;
          });
        setBorrowRequests(sorted);
      } else {
        setBorrowRequests([]);
      }
    });
    fetchAccountRequests().then((response) => {
      if (response.success && Array.isArray(response.data)) {
        // Backend already returns only PENDING requests
        setAccountRequests(response.data);
      } else {
        setAccountRequests([]);
      }
    });
    fetchBooks().then((response) => {
      if (response.success && Array.isArray(response.data)) {
        const sorted = response.data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentBooks(sorted.slice(0, 5));
      } else {
        setRecentBooks([]);
      }
    });
  }, []);

  /**
   * Обработва търсенето в админския панел
   * Функционалността може да бъде имплементирана при нужда
   */
  const handleSearch = (searchValue) => {
    // Функционалността за търсене може да бъде имплементирана тук при нужда
  };

  // Format stats change with arrow and sign
  const formatStatsChange = (change) => {
    if (change === 0) {
      return { text: '0', className: 'stat-change-neutral' };
    }
    
    const isPositive = change > 0;
    const arrow = isPositive ? '▲' : '▼';
    const absChange = Math.abs(change);
    
    return {
      text: `${arrow}${absChange}`,
      className: isPositive ? 'stat-change-positive' : 'stat-change-negative'
    };
  };

  return (
    <div className="dashboard-page">
      <HeaderAdmin onSearch={handleSearch} />

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <p className="stat-title">Borrowed Books</p>
          <div className="stat-value">{stats.borrowed}</div>
          <div className={`stat-change ${formatStatsChange(stats.changes?.borrowed || 0).className}`}>
            {formatStatsChange(stats.changes?.borrowed || 0).text}
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-title">Total Users</p>
          <div className="stat-value">{stats.users}</div>
          <div className={`stat-change ${formatStatsChange(stats.changes?.users || 0).className}`}>
            {formatStatsChange(stats.changes?.users || 0).text}
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-title">Total Books</p>
          <div className="stat-value">{stats.books}</div>
          <div className={`stat-change ${formatStatsChange(stats.changes?.books || 0).className}`}>
            {formatStatsChange(stats.changes?.books || 0).text}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="side-col">
          {/* Borrow Requests */}
          <div className="card borrow-requests">
            <div className="card-header">
              <h2>Borrow Requests</h2>
              <Link className="view-all" to="/admin/borrow-requests">
                View all
              </Link>
            </div>
            <div className="card-body">
              {borrowRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon" />
                  <p className="empty-title">No Pending Book Requests</p>
                  <p className="empty-text">
                    There are no borrow book requests awaiting your review at this
                    time.
                  </p>
                </div>
              ) : (
                borrowRequests.slice(0, 5).map((req) => (
                  <div key={req.id} className="recent-item">
                    {req.bookCover ? (
                      <>
                        <img 
                          src={req.bookCover} 
                          alt={req.bookTitle}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="book-placeholder" style={{ display: 'none' }}>📚</div>
                      </>
                    ) : (
                      <div className="book-placeholder">📚</div>
                    )}
                    <div className="recent-info">
                      <Link to={`/admin/borrow-requests`} className="borrow-title">{req.bookTitle}</Link>
                      <p className="subtitle">
                        By {req.bookAuthor || 'Unknown Author'}
                      </p>
                      <p className="date">
                        <img
                          src={req.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.userName || 'User')}&background=CCD7FF&color=6888FF`}
                          alt={req.userName}
                          className="user-avatar-small"
                        />
                        {req.userName} • 
                        <img src={calendarIcon} alt="Calendar" className="calendar-icon" />
                        {req.borrowDate ? new Date(req.borrowDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }) : new Date().toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Requests */}
          <div className="card account-requests">
            <div className="card-header">
              <h2>Account Requests</h2>
              <Link className="view-all" to="/admin/account-requests">
                View all
              </Link>
            </div>
            <div className="card-body">
              {accountRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon" />
                  <p className="empty-title">No Pending Account Requests</p>
                  <p className="empty-text">
                    There are currently no account requests awaiting approval.
                  </p>
                </div>
              ) : (
                accountRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="request-item">
                    <img
                      src={req.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${req.firstName} ${req.lastName}`) + '&background=CCD7FF&color=6888FF'}
                      alt={`${req.firstName} ${req.lastName}`}
                      className="request-avatar"
                    />
                    <div className="request-info">
                      <p className="request-name">{req.firstName} {req.lastName}</p>
                      <p className="request-email">{req.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recently Added Books */}
        <div className="side-col recent-books">
          <div className="card recent">
            <div className="card-header">
              <h2>Recently Added Books</h2>
              <Link className="view-all" to="/admin/books">
                View all
              </Link>
            </div>
            <div className="card-body">
              <Link to="/admin/books/new" className="add-book">
                + Add New Book
              </Link>
              {recentBooks.map((book) => (
                <div key={book.id} className="recent-item">
                  {book.image && book.image !== 'default-cover.jpg' ? (
                    <>
                      <img 
                        src={`${API_URL}/uploads/books/covers/${book.image}`} 
                        alt={book.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="book-placeholder" style={{ display: 'none' }}>📚</div>
                    </>
                  ) : (
                    <div className="book-placeholder">📚</div>
                  )}
                  <div className="recent-info">
                    <Link to={`/admin/books/${book.id}`}>{book.title}</Link>
                    <p className="subtitle">
                      By {book.author} • {book.category}
                    </p>
                    <p className="date">
                      <img src={calendarIcon} alt="Calendar" className="calendar-icon" />
                      {new Date(book.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}