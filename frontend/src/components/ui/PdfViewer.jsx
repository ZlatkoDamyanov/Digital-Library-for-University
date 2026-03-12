import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaExpand} from 'react-icons/fa';
import './PdfViewer.css';

const PdfViewer = ({ isOpen, onClose, pdfUrl, bookTitle, bookCover, author }) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Will try to get actual count from PDF
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInput, setPageInput] = useState('1');
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setError(null);
      setPage(1); // Reset to first page when opening
      setPageInput('1');
      setTotalPages(1); // Reset total pages
      
      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        const modal = document.querySelector('.pdf-viewer-overlay');
        if (modal) {
          modal.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, pdfUrl]);

  // Update iframe when page changes
  useEffect(() => {
    if (isOpen && page > 0) {
      setIsLoading(true);
      // Small delay to ensure iframe renders with new page
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [page, isOpen]);

  // Touch handling for mobile navigation
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.nav-pages') || e.target.closest('.pdf-header')) {
        return; // Don't handle touches on navigation elements
      }
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current || e.target.closest('.nav-pages') || e.target.closest('.pdf-header')) {
        return;
      }

      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

      // Check if it's a swipe (horizontal movement > vertical, fast enough, long enough)
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          Math.abs(deltaX) > 50 && 
          deltaTime < 500) {
        
        if (deltaX > 0) {
          // Swipe right - previous page
          prevPage();
        } else {
          // Swipe left - next page
          nextPage();
        }
      }

      touchStartRef.current = null;
      touchEndRef.current = null;
    };

    const pdfContent = document.querySelector('.pdf-content');
    if (pdfContent) {
      pdfContent.addEventListener('touchstart', handleTouchStart, { passive: true });
      pdfContent.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        pdfContent.removeEventListener('touchstart', handleTouchStart);
        pdfContent.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isOpen, isMobile, page]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (isOpen && !isMobile) { // Only enable keyboard navigation on non-mobile
      const handleFocusTrap = (e) => {
        const focusableElements = document.querySelectorAll(
          '.pdf-viewer button, .pdf-viewer input, .pdf-viewer [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleFocusTrap);
      return () => document.removeEventListener('keydown', handleFocusTrap);
    }
  }, [isOpen, isMobile]);

  const handleKeyDown = (e) => {
    if (isMobile) return; // Disable keyboard navigation on mobile
    
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevPage();
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToPage(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToPage(totalPages);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      setPageInput(newPage.toString());
    }
  };
  
  const nextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    setPageInput(newPage.toString());
    
    // Expand totalPages dynamically but more conservatively
    if (newPage > totalPages) {
      setTotalPages(Math.max(totalPages + 20, newPage + 10));
    }
  };

  const goToPage = (pageNumber) => {
    const targetPage = Math.max(1, parseInt(pageNumber) || 1);
    setPage(targetPage);
    setPageInput(targetPage.toString());
    
    // If target page is beyond current totalPages, expand it
    if (targetPage > totalPages) {
      setTotalPages(targetPage + 10);
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setPageInput(value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    goToPage(pageInput);
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      // Enter fullscreen
      const element = document.querySelector('.pdf-viewer-overlay');
      if (element) {
        const enterFullscreen = element.requestFullscreen || 
                               element.mozRequestFullScreen || 
                               element.webkitRequestFullscreen || 
                               element.msRequestFullscreen;
        
        if (enterFullscreen) {
          enterFullscreen.call(element)
            .then(() => setIsFullScreen(true))
            .catch(err => console.log('Fullscreen error:', err));
        }
      }
    } else {
      // Exit fullscreen - check if we're actually in fullscreen
      if (document.fullscreenElement || 
          document.mozFullScreenElement || 
          document.webkitFullscreenElement || 
          document.msFullscreenElement) {
        
        const exitFullscreen = document.exitFullscreen || 
                              document.mozCancelFullScreen || 
                              document.webkitExitFullscreen || 
                              document.msExitFullscreen;
        
        if (exitFullscreen) {
          exitFullscreen.call(document)
            .then(() => setIsFullScreen(false))
            .catch(err => console.log('Exit fullscreen error:', err));
        }
      } else {
        // Not actually in fullscreen, just update state
        setIsFullScreen(false);
      }
    }
  };

  const handlePdfLoad = () => {
    setIsLoading(false);
    
    // Try multiple methods to get actual page count
    const attemptPageCount = () => {
      // Method 1: Try to access PDF.js viewer
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const win = iframeRef.current.contentWindow;
          
          // Try different PDF.js APIs
          if (win.PDFViewerApplication && win.PDFViewerApplication.pdfDocument) {
            const numPages = win.PDFViewerApplication.pdfDocument.numPages;
            if (numPages && numPages > 0) {
              setTotalPages(numPages);
              return;
            }
          }
          
          // Try alternative access
          if (win.pdfDocument && win.pdfDocument.numPages) {
            setTotalPages(win.pdfDocument.numPages);
            return;
          }
        }
      } catch (e) {
        console.log('Cannot access PDF document:', e);
      }
      
      // Method 2: Try to get from URL or filename patterns
      if (pdfUrl) {
        // Some PDFs have page info in URL or can be estimated
        const urlMatch = pdfUrl.match(/pages?[=_-](\d+)/i);
        if (urlMatch) {
          setTotalPages(parseInt(urlMatch[1]));
          return;
        }
      }
      
      // Method 3: Use reasonable default and expand dynamically
      if (totalPages <= 1) {
        setTotalPages(100); // More reasonable default
      }
    };
    
    // Try immediately and then retry after delays
    attemptPageCount();
    setTimeout(attemptPageCount, 1000);
    setTimeout(attemptPageCount, 3000);
    setTimeout(attemptPageCount, 5000);
  };

  const handlePdfError = () => {
    setIsLoading(false);
    setError('Failed to load PDF');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  // Get responsive zoom based on device
  const getZoomLevel = () => {
    if (isMobile) {
      if (window.innerWidth <= 360) return 45;
      if (window.innerWidth <= 480) return 50;
      if (window.innerWidth <= 768) return 55;
    }
    return 54; // Default zoom
  };

  return (
    <div 
      className={`pdf-viewer-overlay ${isFullScreen ? 'fullscreen' : ''}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-title"
      aria-describedby="pdf-viewer-description"
    >
      <div className="pdf-viewer">
        <header className="pdf-header">
          <div className="header-left">
            <button className="back-btn" onClick={onClose} aria-label="Close PDF viewer">
              <FaArrowLeft /> 
              {!isMobile && <span>Назад</span>}
            </button>
            <div className="book-info">
              <img src={bookCover} alt={`Cover of ${bookTitle}`} className="small-cover" />
              <div className="text-info">
                <div id="pdf-viewer-title" className="pdf-title">{bookTitle}</div>
                <div className="pdf-author">by {author}</div>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className={`ctrl-btn ${isFullScreen ? 'active' : ''}`}
              onClick={toggleFullScreen}
              title="Toggle fullscreen mode"
              aria-label={isFullScreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            >
              <FaExpand /> 
              {!isMobile && <span>Full Screen</span>}
            </button>
            <button 
              className="close-btn" 
              onClick={onClose} 
              title="Close PDF viewer (ESC)"
              aria-label="Close PDF viewer"
            >
              ×
            </button>
          </div>
        </header>

        <div className="pdf-container">
          <nav className="nav-pages" role="toolbar" aria-label="PDF page navigation">
            <button 
              onClick={prevPage} 
              disabled={page === 1}
              title={isMobile ? "Previous page" : "Previous page (← or Page Up)"}
              aria-label={`Go to previous page. Currently on page ${page}`}
            >
              ‹
            </button>
            
            <div className="page-controls">
              <span>Page</span>
              <form onSubmit={handlePageInputSubmit} className="page-input-form">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={() => goToPage(pageInput)}
                  className="page-input"
                  title={isMobile ? "Enter page number" : "Enter page number or use Home/End keys"}
                  aria-label={`Page number input, currently on page ${page} of ${totalPages}`}
                />
              </form>
              <span>of {totalPages}</span>
            </div>
            
            <button 
              onClick={nextPage} 
              title={isMobile ? "Next page" : "Next page (→ or Page Down)"}
              aria-label={`Go to next page. Currently on page ${page}`}
            >
              ›
            </button>
          </nav>
          
          <div className="pdf-content" role="main" id="pdf-viewer-description">
            {isMobile && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                zIndex: 5,
                pointerEvents: 'none'
              }}>
                Swipe left/right to navigate
              </div>
            )}
            
            {isLoading && (
              <div className="pdf-loading" role="status" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true"></div>
                <p>Loading PDF...</p>
              </div>
            )}
            
            {error && (
              <div className="pdf-error" role="alert" aria-live="assertive">
                <p>Error loading PDF: {error}</p>
                <button 
                  onClick={() => window.open(pdfUrl, '_blank')}
                  aria-label="Open PDF in new browser tab"
                >
                  Open in new tab
                </button>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              key={`${pdfUrl}-page-${page}`}
              src={`${pdfUrl}#page=${page}&view=Fit&pagemode=none&toolbar=0&navpanes=0&scrollbar=0&zoom=${getZoomLevel()}`}
              title={`PDF viewer showing ${bookTitle} - Page ${page} of ${totalPages}`}
              className={`pdf-frame ${isLoading ? 'loading' : ''}`}
              onLoad={handlePdfLoad}
              onError={handlePdfError}
              allow="fullscreen"
              style={{ 
                border: 'none',
                borderRadius: isMobile ? '4px' : '8px',
                overflow: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrolling: 'no'
              }}
              scrolling="no"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              aria-label={`PDF content for ${bookTitle}, currently showing page ${page} of ${totalPages}. ${isMobile ? 'Swipe left or right to navigate pages.' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer; 