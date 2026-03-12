import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ 
  show, 
  type = 'success', 
  title, 
  message, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  if (!show) return null;

  return (
    <div className={`notification-overlay ${show ? 'show' : ''}`}>
      <div className={`notification notification-${type} ${show ? 'slide-in' : ''}`}>
        <div className="notification-content">
          <div className="notification-icon">
            {getIcon()}
          </div>
          <div className="notification-text">
            <h3 className="notification-title">{title}</h3>
            <p className="notification-message">{message}</p>
          </div>
          <button className="notification-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={`notification-progress notification-progress-${type}`}></div>
      </div>
    </div>
  );
};

export default Notification; 