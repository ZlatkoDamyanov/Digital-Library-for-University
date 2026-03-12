import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/ui/SearchBar';
import BookList from '../../components/book/BookList';
import { useUser } from '../../contexts/UserContext';
import { apiClient } from '../../utils/api';
import './SearchResults.css';

export default function SearchResults() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Вземаме търсената заявка от URL параметрите
  const query = searchParams.get('q');

  useEffect(() => {
    if (!query) {
      navigate('/home'); // Пренасочваме към началната страница ако няма заявка
      return;
    }
    
    setSearchQuery(query);
    searchBooks(query);
  }, [query, navigate]);

  const searchBooks = async (searchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (data.success && data.books) {
        setBooks(data.books);
        // Няма грешка дори ако няма резултати
      } else {
        setBooks([]);
        // Не задаваме грешка за празни резултати
      }
    } catch (err) {
      console.error('Error searching books:', err);
      setError('Грешка при търсенето на книги');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-results-page">
      {/* Обвивка за header и search с background */}
      <div className="header-search-wrapper">
        {/* Header със заглавие и аватар */}
        <div className="header-wrapper">
          <div className="header-overlay" />
          <Header
            firstName={user?.firstName || ''}
            lastName={user?.lastName || ''}
            userAvatarUrl={user?.avatarUrl || null}
          />
        </div>

        {/* Търсачка секция */}
        <section className="search-hero">
          <div className="search-hero-overlay" />
          <div className="search-hero-content">
            <p className="search-hero-subtitle">РЕЗУЛТАТИ ОТ ТЪРСЕНЕТО:</p>
            <h1 className="search-hero-title">
              {searchQuery ? `"${searchQuery}"` : 'Търсене в библиотеката'}
            </h1>
            <SearchBar />
          </div>
        </section>
      </div>

      {/* Резултати от търсенето */}
      <section className="search-results-section">
        <div className="section-header">
          <h2 className="section-title">
            {loading ? 'Търсене...' : 
             error ? 'Грешка при търсенето' :
             books.length === 0 ? 'Няма намерени резултати' :
             `Намерени са ${books.length} резултат${books.length !== 1 ? 'а' : ''}`}
          </h2>
          {!loading && !error && (
            <div className="results-info">
              <span className="query-text">за "<strong>{searchQuery}</strong>"</span>
            </div>
          )}
        </div>
        
        {error ? (
          <div className="error-message">
            <p className="status-text error">{error}</p>
          </div>
        ) : (
          <BookList books={books} loading={loading} error={null} />
        )}
        
        {/* Съобщение при липса на резултати */}
        {!loading && !error && books.length === 0 && (
          <div className="no-results-message">
            <h3>Няма намерени книги</h3>
            <p>Опитайте да търсите с различни ключови думи.</p>
          </div>
        )}
      </section>
    </div>
  );
} 