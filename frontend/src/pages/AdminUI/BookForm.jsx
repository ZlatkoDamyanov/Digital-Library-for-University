/**
 * Компонент за създаване и редактиране на книги в администраторския панел
 * Поддържа качване на корици и PDF файлове, валидация и обработка на грешки
 * Използва се както за създаване на нови книги, така и за редактиране на съществуващи
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import HeaderAdmin from '../../components/layout/HeaderAdmin';
import uploadIcon from '../../assets/icons/upload.svg';
import './BookForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBooks, upsertBook, books } = useAdmin();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    publisher: '',
    year: '',
    isbn: '',
    category: '',
    language: '',
    pages: '',
    copies: '',
    image: null,
    pdf: null,
    description: '',
  });

  const [existingFiles, setExistingFiles] = useState({
    image: null,
    pdf: null
  });

  const [hasNewFiles, setHasNewFiles] = useState({
    image: false,
    pdf: false
  });

  /**
   * Зарежда данните за книга във формуляра при редактиране
   * Попълва всички полета и настройва информацията за съществуващи файлове
   */
  const loadBookData = useCallback((book) => {
    setForm({
      title: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
      year: book.year ? book.year.toString() : '',
      isbn: book.isbn || '',
      category: book.category || '',
      language: book.language || '',
      pages: book.pages ? book.pages.toString() : '',
      copies: book.copies ? book.copies.toString() : '',
      image: null,
      pdf: null,
      description: book.description || '',
    });
    
    // Настройване на информацията за съществуващи файлове
    setExistingFiles({
      image: book.image && book.image !== 'default-cover.jpg' ? book.image : null,
      pdf: book.pdf || null
    });
    
    // Ресетиране на флаговете за нови файлове за edit режим
    setHasNewFiles({
      image: false,
      pdf: false
    });
  }, []);

  /**
   * Effect за зареждане на данни при редактиране на книга
   * Първо проверява в локалното състояние, след това прави заявка към сървъра
   */
  useEffect(() => {
    if (isEdit && id) {
      // Първо опитваме да намерим в съществуващото състояние на книгите
      if (Array.isArray(books) && books.length > 0) {
        const book = books.find(b => b.id === id);
        if (book) {
          loadBookData(book);
          return;
        }
      }
      
      // Ако не е намерена в състоянието, зареждаме книгите от сървъра
      fetchBooks()
        .then((response) => {
          if (response.success && Array.isArray(response.data)) {
            const book = response.data.find(b => b.id === id);
            if (book) {
              loadBookData(book);
            } else {
              setError('Book not found');
            }
          }
        })
        .catch(error => {
          setError('Failed to load book data');
        });
    }
  }, [id, isEdit, books, fetchBooks, loadBookData]);

  /**
   * Обработва промените в полетата на формуляра
   * Специално управление за файлове и текстови полета
   */
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      const selectedFile = files[0];
      setForm(prev => ({ ...prev, [name]: selectedFile }));
      
      // Отбелязваме че имаме нов файл за това поле
      setHasNewFiles(prev => ({ ...prev, [name]: true }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Обработва изпращането на формуляра за създаване/редактиране на книга
   * Валидира данните, подготвя файловете и изпраща заявката към сървъра
   */
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Предотвратяваме множество изпращания с двойна защита
    if (loading || isSubmitting) {
      return;
    }
    
    // Валидираме задължителните полета преди започване на изпращането
    if (!form.title?.trim() || !form.author?.trim() || !form.copies) {
      setError('Please fill in all required fields (Title, Author, Copies)');
      return;
    }
    
    // Изчистваме предишната грешка и задаваме състоянията за зареждане
    setError('');
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      // Създаваме FormData за качване на файлове
      const payload = new FormData();
      
      // Добавяме обикновените полета от формуляра (не-файлове)
      Object.keys(form).forEach(key => {
        if (key !== 'image' && key !== 'pdf' && form[key] !== null && form[key] !== '') {
          payload.append(key, form[key]);
        }
      });
      
      // Интелигентно управление на качването на файлове
      if (isEdit) {
        // EDIT РЕЖИМ: Изпращаме само файлове които са наистина нови
        
        // Управление на файла с изображение
        if (hasNewFiles.image && form.image instanceof File) {
          payload.append('image', form.image);
        } else if (!existingFiles.image && !form.image) {
          payload.append('removeImage', 'true');
        }
        
        // Управление на PDF файла
        if (hasNewFiles.pdf && form.pdf instanceof File) {
          payload.append('pdf', form.pdf);
        } else if (!existingFiles.pdf && !form.pdf) {
          payload.append('removePdf', 'true');
        }
      } else {
        // CREATE РЕЖИМ: Изпращаме всички избрани файлове
        if (form.image instanceof File) {
          payload.append('image', form.image);
        }
        if (form.pdf instanceof File) {
          payload.append('pdf', form.pdf);
        }
      }
      
      const result = await upsertBook(payload, id);
      
      if (result?.success) {
        navigate('/admin/books');
      } else {
        throw new Error(result?.error || 'Unknown error occurred');
      }
    } catch (error) {
      setError(error.message || 'Failed to submit book. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="book-form-container">
      <HeaderAdmin 
        placeholder="Search books by title, author, or category..." 
        onSearch={() => {}} 
      />
      <div className="book-form-wrapper">
        <header className="book-form-header">
          <Link to="/admin/books" className="back-btn">← Go back</Link>
          <h1>{isEdit ? 'Edit Book' : 'Create New Book'}</h1>
        </header>
      <form className="book-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter the book title"
            required
          />
        </div>
        <div className="form-group">
          <label>Author</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Enter the author name"
            required
          />
        </div>
        <div className="form-group">
          <label>Publisher</label>
          <input
            type="text"
            name="publisher"
            value={form.publisher}
            onChange={handleChange}
            placeholder="Enter the publisher of the book"
          />
        </div>
        <div className="form-group">
          <label>Year of Publication</label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleChange}
            placeholder="Enter the year of publication of the book"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>ISBN</label>
          <input
            type="text"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            placeholder="Enter the ISBN of the book"
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Enter the category of the book"
          />
        </div>
        <div className="form-group">
          <label>Language of the Book</label>
          <input
            type="text"
            name="language"
            value={form.language}
            onChange={handleChange}
            placeholder="Enter the language of the book"
          />
        </div>
        <div className="form-group">
          <label>Number of Pages</label>
          <input
            type="number"
            name="pages"
            value={form.pages}
            onChange={handleChange}
            placeholder="Enter the number of pages of the book"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Number of Copies Available</label>
          <input
            type="number"
            name="copies"
            value={form.copies}
            onChange={handleChange}
            placeholder="Enter the number of copies available"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label>Book Image</label>
          
          {/* Show existing image if in edit mode */}
          {isEdit && existingFiles.image && !form.image && (
            <div className="existing-file">
              <div className="existing-image-preview">
                <img 
                  src={`${API_URL}/uploads/books/covers/${existingFiles.image}`}
                  alt="Current book cover" 
                  className="existing-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="existing-file-info">
                  <span>Current image: {existingFiles.image}</span>
                  <button 
                    type="button" 
                    className="remove-existing-file"
                    onClick={() => {
                      setExistingFiles(prev => ({ ...prev, image: null }));
                      setHasNewFiles(prev => ({ ...prev, image: true })); // Отбелязваме като променено
                    }}
                  >
                    Remove current image
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Upload new image */}
          {(!isEdit || !existingFiles.image || form.image) && (
            <div className="file-upload-wrapper">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                id="book-image"
              />
              <label htmlFor="book-image" className="file-upload-label">
                <div className="upload-main">
                  <img src={uploadIcon} alt="Upload" className="upload-icon" />
                  <div className="upload-text">
                    {isEdit && existingFiles.image ? 'Replace image' : 'Upload an image'}
                  </div>
                </div>
                <div className="upload-subtext">PNG, JPG, GIF up to 10MB</div>
              </label>
            </div>
          )}
          
          {/* Show newly selected image */}
          {form.image && (
            <div className="file-selected">
              <span>📄 {form.image.name}</span>
              <button 
                type="button" 
                className="remove-file"
                onClick={() => {
                  setForm(prev => ({ ...prev, image: null }));
                  setHasNewFiles(prev => ({ ...prev, image: false })); // Ресетираме флага за нов файл
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Book PDF</label>
          
          {/* Show existing PDF if in edit mode */}
          {isEdit && existingFiles.pdf && !form.pdf && (
            <div className="existing-file">
              <div className="existing-pdf-info">
                <span>📄 Current PDF: {existingFiles.pdf}</span>
                <div className="existing-file-actions">
                  <a 
                    href={`${API_URL}/uploads/books/pdfs/${existingFiles.pdf}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-pdf-btn"
                  >
                    View PDF
                  </a>
                  <button 
                    type="button" 
                    className="remove-existing-file"
                    onClick={() => {
                      setExistingFiles(prev => ({ ...prev, pdf: null }));
                      setHasNewFiles(prev => ({ ...prev, pdf: true })); // Отбелязваме като променено
                    }}
                  >
                    Remove current PDF
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Upload new PDF */}
          {(!isEdit || !existingFiles.pdf || form.pdf) && (
            <div className="file-upload-wrapper">
              <input
                type="file"
                name="pdf"
                accept="application/pdf"
                onChange={handleChange}
                id="book-pdf"
              />
              <label htmlFor="book-pdf" className="file-upload-label">
                <div className="upload-main">
                  <img src={uploadIcon} alt="Upload" className="upload-icon" />
                  <div className="upload-text">
                    {isEdit && existingFiles.pdf ? 'Replace PDF file' : 'Upload a PDF File'}
                  </div>
                </div>
                <div className="upload-subtext">PDF up to 50MB</div>
              </label>
            </div>
          )}
          
          {/* Show newly selected PDF */}
          {form.pdf && (
            <div className="file-selected">
              <span>📄 {form.pdf.name}</span>
              <button 
                type="button" 
                className="remove-file"
                onClick={() => {
                  setForm(prev => ({ ...prev, pdf: null }));
                  setHasNewFiles(prev => ({ ...prev, pdf: false })); // Ресетираме флага за нов файл
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Book Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a brief description of the book"
            rows={6}
          />
        </div>
        {error && (
          <div className="error-message" style={{
            color: '#ef4444',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading || isSubmitting}
          onClick={(e) => {
            if (loading || isSubmitting) {
              e.preventDefault();
              // Предотвратяваме изпращането ако вече е в процес
            }
          }}
        >
          {(loading || isSubmitting) ? 'Submitting...' : (isEdit ? 'Update Book' : 'Create Book')}
        </button>
      </form>
      </div>
    </div>
  );
}
