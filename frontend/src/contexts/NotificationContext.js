import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/ui/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      show: false,
      type: 'success',
      title: '',
      message: '',
      duration: 4000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Trigger show animation after a brief delay
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, show: true } : n)
      );
    }, 10);
  };

  const hideNotification = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, show: false } : n)
    );

    // Remove from array after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  const showSuccess = (title, message, duration = 4000) => {
    showNotification({
      type: 'success',
      title,
      message,
      duration
    });
  };

  const showError = (title, message, duration = 5000) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration
    });
  };

  const showWarning = (title, message, duration = 4000) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  };

  const showInfo = (title, message, duration = 4000) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration
    });
  };

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render all notifications */}
      <div className="notifications-container">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              position: 'fixed',
              top: `${20 + index * 80}px`,
              right: '20px',
              zIndex: 10000 + index
            }}
          >
            <Notification
              show={notification.show}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              duration={notification.duration}
              onClose={() => hideNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 