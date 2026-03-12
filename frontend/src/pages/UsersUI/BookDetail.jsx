import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/ui/SearchBar';
import PdfViewer from '../../components/ui/PdfViewer';
import BorrowModal from '../../components/ui/BorrowModal';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';
import { apiClient } from '../../utils/api';
import { ReactComponent as AvailableIcon } from '../../assets/icons/availably.svg';
import { ReactComponent as ReviewsIcon } from '../../assets/icons/reviews.svg';
import { ReactComponent as NotesIcon } from '../../assets/icons/notes.svg';
import { ReactComponent as ShareIcon } from '../../assets/icons/share.svg';
import './BookDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  // Функция за зареждане на книгата
  const fetchBook = async () => {
    try {
      const response = await apiClient.get(`/api/books/${id}`);
      if (response.success && response.book) {
        setBook(response.book);
      } else {
        setError('Книгата не е намерена');
      }
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Неуспешно зареждане на книга');
    } finally {
      setLoading(false);
    }
  };

  // Зареждане на книгата при първоначално зареждане
  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  // Периодично обновяване на информацията за книгата
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) {
        fetchBook();
      }
    }, 5000); // Обновяване на всеки 5 секунди

    return () => clearInterval(interval);
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTakeNow = () => {
    if (!user) {
      showError(
        'Необходимо е влизане',
        'Моля, влезте в профила си за да заемете книга'
      );
      navigate('/login');
      return;
    }
    setShowBorrowModal(true);
  };

  const handleBorrowSubmit = async (borrowData) => {
    try {
      const response = await apiClient.post('/api/auth/borrow-request', {
        bookId: book.id,
        borrowDate: borrowData.borrowDate,
        returnDate: borrowData.returnDate
      });

      if (response.success) {
        showSuccess(
          'Заявката е изпратена успешно!',
          `Заявката за заемане на книгата "${book.title}" беше изпратена успешно. Ще получите потвърждение скоро.`
        );
        // Обновяване на книгата за да се покаже новият брой налични копия
        const updatedBook = { ...book, availableCopies: book.availableCopies - 1 };
        setBook(updatedBook);
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      showError(
        'Грешка при заемане',
        error.message || 'Възникна грешка при изпращане на заявката за заемане. Моля, опитайте отново.'
      );
    }
  };

  const handleReadPdf = () => {
    if (book?.pdf) {
      setShowPdfViewer(true);
    }
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
  };

  const closeBorrowModal = () => {
    setShowBorrowModal(false);
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="header-hero-wrapper">
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
        <div className="book-detail-content">
          <div className="loading">Зареждане...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <div className="header-hero-wrapper">
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
        <div className="book-detail-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="header-hero-wrapper">
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
        <div className="book-detail-content">
          <div className="error">Книгата не е намерена</div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      {/* Header wrapper with background */}
      <div className="header-hero-wrapper">
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

      {/* Book detail content */}
      <div className="book-detail-content">
        <div className="book-detail">
          <header className="detail-header">
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft /> Назад
            </button>
          </header>

          <section className="detail-main">
            <div className="detail-left">
              <img
                className="detail-cover"
                src={book.coverUrl || `${API_URL}/uploads/books/covers/${book.cover}`}
                alt={book.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="detail-cover-placeholder" style={{ display: 'none' }}>
                📚
              </div>

              {/* Interaction buttons */}
              <div className="interaction-buttons">
                <div className="interaction-item">
                  <ReviewsIcon className="interaction-icon" />
                  <span className="interaction-label">Review</span>
                </div>
                <div className="interaction-item">
                  <NotesIcon className="interaction-icon" />
                  <span className="interaction-label">Notes</span>
                </div>
                <div className="interaction-item">
                  <ShareIcon className="interaction-icon" />
                  <span className="interaction-label">Share</span>
                </div>
              </div>
            </div>

            <div className="detail-right">
              {/* Book title and author */}
              <div className="book-header">
                <h1 className="detail-title">{book.title}</h1>
                <p className="detail-subtitle">От {book.author}</p>
              </div>

              {/* Two column layout for info and summary */}
              <div className="content-columns">
                <div className="left-column">
                  {/* Information section */}
                  <div className="info-section">
                    <h3 className="section-title">Информация</h3>
                    <table className="detail-info">
                      <tbody>
                        <tr><th>Заглавие</th><td>{book.title}</td></tr>
                        <tr><th>Автор/и</th><td>{book.author}</td></tr>
                        <tr><th>Издателство</th><td>{book.publisher || 'Неизвестно'}</td></tr>
                        <tr><th>Година на издаване</th><td>{book.year || 'Неизвестна'}</td></tr>
                        <tr><th>ISBN</th><td>{book.isbn || 'Няма'}</td></tr>
                        <tr><th>Категория</th><td>{book.category || 'Неопределена'}</td></tr>
                        <tr><th>Език на книгата</th><td>{book.language || 'Неизвестен'}</td></tr>
                        <tr><th>Страници</th><td>{book.pages || 'Неизвестен брой'}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Availability section */}
                  <div className="availability-section">
                    <h3 className="section-title">Наличност</h3>
                    <div className="detail-availability">
                      <div>
                        <AvailableIcon className="availability-icon" /> Hard Copy
                      </div>
                      {book.pdf && (
                        <div>
                          <AvailableIcon className="availability-icon" /> E - Book
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="right-column">
                  {/* Summary section */}
                  <div className="summary-section">
                    <h3 className="section-title">Резюме</h3>
                    <p className="detail-summary">{book.description || 'Няма описание'}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="detail-actions">
                    <button 
                      className="btn-primary" 
                      onClick={handleTakeNow}
                      disabled={!book.availableCopies || book.availableCopies === 0}
                    >
                      Вземи сега
                    </button>
                    {book.pdf && (
                      <button className="btn-secondary" onClick={handleReadPdf}>
                        Чети PDF
                      </button>
                    )}
                    

                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PdfViewer
        isOpen={showPdfViewer}
        onClose={closePdfViewer}
        pdfUrl={book?.pdf ? `${API_URL}/uploads/books/pdfs/${book.pdf}` : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
        bookTitle={book?.title || 'Test Book'}
        bookCover={book?.coverUrl || `${API_URL}/uploads/books/covers/${book?.cover}` || '/placeholder-book.png'}
        author={book?.author || 'Unknown Author'}
      />

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={showBorrowModal}
        onClose={closeBorrowModal}
        onSubmit={handleBorrowSubmit}
        bookTitle={book?.title || ''}
      />

    </div>
  );
} 