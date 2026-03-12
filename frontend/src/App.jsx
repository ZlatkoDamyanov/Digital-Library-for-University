import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';

// User pages
import Home from './pages/UsersUI/Home';    
import Registration from './pages/UsersUI/Registration';
import Login from './pages/UsersUI/Login';
import MyProfile from './pages/UsersUI/myProfile';
import BookDetail from './pages/UsersUI/BookDetail';
import BorrowedBooks from './pages/UsersUI/BorrowedBooks';
import SearchResults from './pages/UsersUI/SearchResults';

// Admin layout and pages
import AdminLayout from './components/layout/AdminLayout';
import HomeAdmin from './pages/AdminUI/Home';
import AllBooks from './pages/AdminUI/AllBooks';
import BookForm from './pages/AdminUI/BookForm';
import BorrowRequestsPage from './pages/AdminUI/BorrowRequestsPage';
import AccountRequestsPage from './pages/AdminUI/AccountRequestsPage';
import AllUsers from './pages/AdminUI/AllUsers';

import './global.css';

const PageNotFound = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <NotificationProvider>
      <UserProvider>
        <AdminProvider>
          <Router>
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Public routes */}
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/borrow-book" element={<ProtectedRoute><BorrowedBooks /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<HomeAdmin />} />
                <Route path="home" element={<HomeAdmin />} />
                <Route path="users" element={<AllUsers />} />
                <Route path="books" element={<AllBooks />} />
                <Route path="books/new" element={<BookForm />} />
                <Route path="books/:id/edit" element={<BookForm />} />
                <Route path="borrow-requests" element={<BorrowRequestsPage />} />
                <Route path="account-requests" element={<AccountRequestsPage />} />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
        </AdminProvider>
      </UserProvider>
    </NotificationProvider>
  );
}

export default App;
