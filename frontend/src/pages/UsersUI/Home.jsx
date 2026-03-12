// Началната страница за потребители
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/ui/SearchBar';
import BookList from '../../components/book/BookList';
import Pagination from '../../components/ui/Pagination';
import { useUser } from '../../contexts/UserContext';
import { apiClient } from '../../utils/api';
import './Home.css';

export default function Home() {
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const booksPerPage = 10;

  // Зареждане на всички книги от API с пагинация
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        // Подготвяме параметрите за API заявката
        const params = new URLSearchParams({
          page: currentPage,
          limit: booksPerPage,
          filter: filter
        });

        const data = await apiClient.get(`/api/books?${params}`);
        
        if (data.success && data.books) {
          setBooks(data.books);
          // Използваме totalPages от API отговора
          const pages = data.totalPages || Math.ceil((data.totalCount || data.books.length) / booksPerPage);
          setTotalPages(pages);
        } else {
          setBooks([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Неуспешно зареждане на книги');
        setBooks([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Връщаме на първа страница при промяна на филтъра
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Скролваме към топа при смяна на страница
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div className="home-page">
      {/* Обвивка за header и hero с background */}
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
          <p className="hero-subtitle">DISCOVER YOUR NEXT GREAT READ:</p>
          <h1 className="hero-title">
            Explore and Search for Any Book In Our Library
          </h1>
          <SearchBar />
        </div>
              </section>
      </div>

      {/* Секция с всички книги */}
      <section className="all-books-section">
        <div className="section-header">
          <h2 className="section-title">Всички книги</h2>
          <div className="filter-container">
            <select 
              className="filter-select"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">Всички</option>
              <option value="popular">Популярни</option>
              <option value="recent">Нови</option>
              <option value="author">По автор</option>
              <option value="genre">По жанр</option>
            </select>
          </div>
        </div>
        
        <BookList books={books} loading={loading} error={error} />
        
        {/* Пагинация */}
        {!loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  );
}
