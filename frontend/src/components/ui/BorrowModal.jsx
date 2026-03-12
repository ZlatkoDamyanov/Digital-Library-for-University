import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import './BorrowModal.css';

const BorrowModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const { showError } = useNotification();
  const [borrowDate, setBorrowDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftCalendarDate, setLeftCalendarDate] = useState(new Date());
  const [rightCalendarDate, setRightCalendarDate] = useState(new Date());

  const monthNames = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];

  const dayNames = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];

  // Функция за форматиране на дата в YYYY-MM-DD формат (локално време)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Получаване на дните в месеца
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // Make Monday = 1

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 1; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Проверка дали датата е валидна за избор
  const isDateSelectable = (date, isReturnCalendar = false) => {
    if (!date) return false;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const dateDay = date.getDate();
    
    if (isReturnCalendar) {
      const borrowDay = borrowDate.getDate();
      const borrowMonth = borrowDate.getMonth();
      const borrowYear = borrowDate.getFullYear();
      
      // За return календара - 1-14 дни след borrow датата
      if (dateYear !== borrowYear || dateMonth !== borrowMonth) {
        // За различни месеци, трябва по-сложна логика
        const borrowTime = borrowDate.getTime();
        const dateTime = date.getTime();
        const daysDiff = (dateTime - borrowTime) / (1000 * 60 * 60 * 24);
        return daysDiff >= 1 && daysDiff <= 14;
      } else {
        // Същия месец
        return dateDay > borrowDay && dateDay <= borrowDay + 14;
      }
    } else {
      // За borrow календара - само днешната дата и утрешната дата
      if (dateYear !== currentYear || dateMonth !== currentMonth) {
        // Ако е различен месец/година, проверяваме дали е утре
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return dateYear === tomorrow.getFullYear() && 
               dateMonth === tomorrow.getMonth() && 
               dateDay === tomorrow.getDate();
      } else {
        // Същия месец - само днес или утре
        return dateDay === currentDay || dateDay === currentDay + 1;
      }
    }
  };

  // Проверка дали датата е избрана
  const isDateSelected = (date, isReturnCalendar = false) => {
    if (isReturnCalendar) {
      return returnDate && date.toDateString() === returnDate.toDateString();
    } else {
      return borrowDate && date.toDateString() === borrowDate.toDateString();
    }
  };

  // Навигация в календарите
  const navigateCalendar = (direction, isRightCalendar = false) => {
    if (!isRightCalendar) return; // Блокираме навигацията за лявия календар
    
    const currentDate = rightCalendarDate;
    const today = new Date();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    
    // Строго ограничаваме навигацията: максимум следващия месец
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);
    const minDate = new Date(today);
    
    // Не позволяваме да отидем в миналото или повече от 1 месец в бъдещето
    if (newDate >= minDate && newDate <= maxDate) {
      setRightCalendarDate(newDate);
    }
  };

  // Обработка на клик върху дата
  const handleDateClick = (date, isReturnCalendar = false) => {
    if (!isDateSelectable(date, isReturnCalendar)) return;
    
    // Нормализираме датата
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    if (isReturnCalendar) {
      setReturnDate(normalizedDate);
    } else {
      setBorrowDate(normalizedDate);
      // Ако променим датата на заемане, нулираме датата за връщане
      setReturnDate(null);
    }
  };

  // Ресет на формата при затваряне и отваряне
  useEffect(() => {
    if (!isOpen) {
      setReturnDate(null);
      setIsSubmitting(false);
    } else {
      // При отваряне - обновяваме всички дати към днешната дата
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Нулираме часовете
      setBorrowDate(new Date(today));
      setLeftCalendarDate(new Date(today));
      setRightCalendarDate(new Date(today));
      setReturnDate(null); // Нулираме return date
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!returnDate) {
      showError(
        'Избор на дата за връщане',
        'Моля, изберете дата за връщане на книгата'
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        borrowDate: formatDate(borrowDate),
        returnDate: formatDate(returnDate)
      });
      onClose();
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      showError(
        'Грешка при изпращане',
        'Възникна грешка при изпращане на заявката. Моля, опитайте отново.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Рендериране на календар
  const renderCalendar = (calendarDate, isReturnCalendar = false, onNavigate) => {
    const days = getDaysInMonth(calendarDate);
    
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button 
            type="button" 
            className="nav-button"
            onClick={() => onNavigate(-1)}
            style={{ visibility: isReturnCalendar ? 'visible' : 'hidden' }}
          >
            <FaChevronLeft />
          </button>
          <h3 className="calendar-title">
            {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
          </h3>
          <button 
            type="button" 
            className="nav-button"
            onClick={() => onNavigate(1)}
            style={{ visibility: isReturnCalendar ? 'visible' : 'hidden' }}
          >
            <FaChevronRight />
          </button>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-days-header">
            {dayNames.map((day, index) => (
              <div key={index} className="day-header">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {days.map((date, index) => (
              <div
                key={index}
                className={`calendar-day ${
                  date ? 'valid-day' : 'empty-day'
                } ${
                  date && isDateSelected(date, isReturnCalendar) ? 'selected' : ''
                } ${
                  date && isDateSelectable(date, isReturnCalendar) ? 'selectable' : ''
                } ${
                  date && !isDateSelectable(date, isReturnCalendar) ? 'disabled' : ''
                }`}
                onClick={() => date && handleDateClick(date, isReturnCalendar)}
              >
                {date ? date.getDate() : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="borrow-modal-overlay" onClick={onClose}>
      <div className="borrow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="borrow-modal-header">
          <h2>Fill Up the Details</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="borrow-modal-content">
          <div className="book-info">
            <p className="book-title">"{bookTitle}"</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="calendars-container">
              <div className="calendar-wrapper">
                <h4>Дата на заемане</h4>
                {renderCalendar(leftCalendarDate, false, (direction) => navigateCalendar(direction, false))}
              </div>

              <div className="calendar-wrapper">
                <h4>Дата за връщане</h4>
                {renderCalendar(rightCalendarDate, true, (direction) => navigateCalendar(direction, true))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="submit" 
                className="btn-submit-full"
                disabled={isSubmitting || !returnDate}
              >
                {isSubmitting ? 'Изпращане...' : 'Вземи сега'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowModal; 