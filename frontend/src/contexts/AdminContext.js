import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../utils/useApi';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const api = useApi();
  
  // State management
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [loading, setLoading] = useState({
    stats: false,
    users: false,
    books: false,
    borrowRequests: false,
    accountRequests: false
  });

  // Helper function to update loading state
  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // Stats methods
  const fetchStats = async () => {
    try {
      setLoadingState('stats', true);
      const response = await api.get('/api/admin/stats');
      if (response.success) {
        setStats(response.data);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    } finally {
      setLoadingState('stats', false);
    }
  };

  // Users methods
  const fetchUsers = async () => {
    try {
      setLoadingState('users', true);
      const response = await api.get('/api/admin/users');
      if (response.success) {
        setUsers(response.data);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    } finally {
      setLoadingState('users', false);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, userData);
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        ));
      }
      return response;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }
      return response;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  // Books methods
  const fetchBooks = async () => {
    try {
      setLoadingState('books', true);
      const response = await api.get('/api/admin/books');
      if (response.success) {
        if (Array.isArray(response.data)) {
          setBooks(response.data);
        } else {
          console.error('Response data is not an array:', response.data);
          setBooks([]);
        }
      } else {
        setBooks([]);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setBooks([]);
      throw error;
    } finally {
      setLoadingState('books', false);
    }
  };

  const upsertBook = async (bookData, bookId = null) => {
    try {
      let response;
      if (bookId) {
        // Update existing book
        response = await api.put(`/api/admin/books/${bookId}`, bookData);
        if (response.success) {
          setBooks(prev => prev.map(book => 
            book.id === bookId ? { ...book, ...response.data } : book
          ));
        }
      } else {
        // Create new book
        response = await api.post('/api/admin/books', bookData);
        if (response.success && response.data) {
          setBooks(prev => [...prev, response.data]);
        }
      }
      return response;
    } catch (error) {
      console.error('Failed to upsert book:', error);
      throw error;
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const response = await api.delete(`/api/admin/books/${bookId}`);
      if (response.success) {
        setBooks(prev => prev.filter(book => book.id !== bookId));
      }
      return response;
    } catch (error) {
      console.error('Failed to delete book:', error);
      throw error;
    }
  };

  // Borrow requests methods
  const fetchBorrowRequests = async () => {
    try {
      setLoadingState('borrowRequests', true);
      const response = await api.get('/api/admin/borrow-requests');
      if (response.success) {
        setBorrowRequests(response.data);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch borrow requests:', error);
      throw error;
    } finally {
      setLoadingState('borrowRequests', false);
    }
  };

  const updateBorrowRequest = async (requestId, status) => {
    try {
      const response = await api.put(`/api/admin/borrow-requests/${requestId}`, { status });
      if (response.success) {
        // Update local state immediately for quick UI response
        setBorrowRequests(prev => prev.map(request => 
          request.id === requestId ? { ...request, status } : request
        ));
        
        // Fetch fresh data to ensure consistency
        await fetchBorrowRequests();
        
        // Also refresh stats since borrowed count might have changed
        await fetchStats();
      }
      return response;
    } catch (error) {
      console.error('Failed to update borrow request:', error);
      throw error;
    }
  };

  // Account requests methods
  const fetchAccountRequests = async () => {
    try {
      setLoadingState('accountRequests', true);
      const response = await api.get('/api/admin/account-requests');
      if (response.success) {
        setAccountRequests(response.data);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch account requests:', error);
      throw error;
    } finally {
      setLoadingState('accountRequests', false);
    }
  };

  const updateAccountRequest = async (requestId, status) => {
    try {
      const response = await api.put(`/api/admin/account-requests/${requestId}`, { status });
      if (response.success) {
        // Update local state immediately for quick UI response
        setAccountRequests(prev => prev.map(request => 
          request.id === requestId ? { ...request, status } : request
        ));
        
        // Fetch fresh data to ensure consistency
        await fetchAccountRequests();
        
        // If account was approved, refresh users list to show the newly approved user
        if (status.toUpperCase() === 'APPROVED') {
          await fetchUsers();
        }
        
        // Also refresh stats since users count might have changed
        await fetchStats();
      }
      return response;
    } catch (error) {
      console.error('Failed to update account request:', error);
      throw error;
    }
  };

  const value = {
    // State
    stats,
    users,
    books,
    borrowRequests,
    accountRequests,
    loading,

    // Stats methods
    fetchStats,

    // Users methods
    fetchUsers,
    updateUser,
    deleteUser,

    // Books methods
    fetchBooks,
    upsertBook,
    deleteBook,

    // Borrow requests methods
    fetchBorrowRequests,
    updateBorrowRequest,

    // Account requests methods
    fetchAccountRequests,
    updateAccountRequest,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
