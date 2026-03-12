import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import BorrowedBookCard from '../../components/book/BorrowedBookCard';
import { useUser } from '../../contexts/UserContext';
import { useApi } from '../../utils/useApi';
import './BorrowedBooks.css';

const BorrowedBooks = () => {
  const { user } = useUser();
  const api = useApi();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Slider configuration
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  // Update items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setItemsPerPage(1);
      } else if (width < 768) {
        setItemsPerPage(2);
      } else if (width < 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/auth/borrowed-books');
      
      if (response.success) {
        setBorrowedBooks(response.data);
      } else {
        setError(response.error || 'Неуспешно зареждане на взетите книги');
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      setError('Възникна грешка при зареждане на взетите книги');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBooks = () => {
    switch (filter) {
      case 'active':
        return borrowedBooks.filter(record => record.status === 'BORROWED');
      case 'returned':
        return borrowedBooks.filter(record => record.status === 'RETURNED');
      case 'overdue':
        return borrowedBooks.filter(record => {
          if (record.status === 'RETURNED') return false;
          const today = new Date();
          const dueDate = new Date(record.dueDate);
          return dueDate < today;
        });
      default:
        return borrowedBooks;
    }
  };

  const getStatsData = () => {
    const activeBooks = borrowedBooks.filter(record => record.status === 'BORROWED');
    const returnedBooks = borrowedBooks.filter(record => record.status === 'RETURNED');
    const overdueBooks = borrowedBooks.filter(record => {
      if (record.status === 'RETURNED') return false;
      const today = new Date();
      const dueDate = new Date(record.dueDate);
      return dueDate < today;
    });

    return {
      total: borrowedBooks.length,
      active: activeBooks.length,
      returned: returnedBooks.length,
      overdue: overdueBooks.length
    };
  };

  // Slider functions
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredBooks.length / itemsPerPage) - 1;
    setCurrentPage(prev => Math.min(maxPage, prev + 1));
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Reset current page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  const filteredBooks = getFilteredBooks();
  const stats = getStatsData();
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleBooks = filteredBooks.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="borrowed-books-page">
        <div className="header-hero-wrapper">
          <div className="header-wrapper">
            <div className="header-overlay" />
            <Header 
              firstName={user?.firstName || ''} 
              lastName={user?.lastName || ''} 
              userAvatarUrl={user?.avatarUrl || null}
            />
          </div>
          <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="hero-subtitle">ВАШАТА ЛИЧНА БИБЛИОТЕКА:</p>
              <h1 className="hero-title">Взети книги</h1>
            </div>
          </section>
        </div>
        <section className="borrowed-books-section">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Зареждане на взетите книги...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="borrowed-books-page">
        <div className="header-hero-wrapper">
          <div className="header-wrapper">
            <div className="header-overlay" />
            <Header 
              firstName={user?.firstName || ''} 
              lastName={user?.lastName || ''} 
              userAvatarUrl={user?.avatarUrl || null}
            />
          </div>
          <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="hero-subtitle">ВАШАТА ЛИЧНА БИБЛИОТЕКА:</p>
              <h1 className="hero-title">Взети книги</h1>
            </div>
          </section>
        </div>
        <section className="borrowed-books-section">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Възникна грешка</h2>
            <p>{error}</p>
            <button onClick={fetchBorrowedBooks} className="retry-button">
              Опитай отново
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="borrowed-books-page">
      {/* Header and Hero wrapper with background */}
      <div className="header-hero-wrapper">
        {/* Header със заглавие и аватар */}
        <div className="header-wrapper">
          <div className="header-overlay" />
          <Header
            firstName={user?.firstName || ''}
            lastName={user?.lastName || ''}
            userAvatarUrl={user?.avatarUrl || null}
          />
        </div>

        {/* Hero секция */}
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-subtitle">ВАШАТА ЛИЧНА БИБЛИОТЕКА:</p>
            <h1 className="hero-title">
              Взети книги
            </h1>
            <p className="hero-description">
              Ето всички книги, които сте взели от библиотеката
            </p>
          </div>
        </section>
      </div>

      {/* Main content section */}
      <section className="borrowed-books-section">
        {/* Filter buttons */}
        <div className="section-header">
          <h2 className="section-title">Моите книги</h2>
          <div className="filter-container">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Всички ({stats.total})
            </button>
            <button
              className={`filter-button ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Активни ({stats.active})
            </button>
            <button
              className={`filter-button ${filter === 'returned' ? 'active' : ''}`}
              onClick={() => setFilter('returned')}
            >
              Върнати ({stats.returned})
            </button>
            {stats.overdue > 0 && (
              <button
                className={`filter-button ${filter === 'overdue' ? 'active' : ''}`}
                onClick={() => setFilter('overdue')}
              >
                Просрочени ({stats.overdue})
              </button>
            )}
          </div>
        </div>

        {/* Books list */}
        <div className="books-container">
          {filteredBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2>Няма книги</h2>
              <p>
                {filter === 'all' 
                  ? 'Още не сте взели книги от библиотеката.'
                  : `Няма книги за показване в категорията "${filter === 'active' ? 'активни' : filter === 'returned' ? 'върнати' : 'просрочени'}".`
                }
              </p>
            </div>
          ) : (
            <div className="books-grid">
              {visibleBooks.map((borrowRecord) => (
                <BorrowedBookCard
                  key={borrowRecord.borrowId}
                  borrowRecord={borrowRecord}
                />
              ))}
            </div>
          )}
          
          {/* Slider Navigation */}
          {filteredBooks.length > itemsPerPage && (
            <div className="slider-navigation">
              <button
                className="slider-nav-button slider-nav-prev"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                aria-label="Previous page"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="slider-dots">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${currentPage === index ? 'active' : ''}`}
                    onClick={() => goToPage(index)}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                className="slider-nav-button slider-nav-next"
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                aria-label="Next page"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BorrowedBooks; 