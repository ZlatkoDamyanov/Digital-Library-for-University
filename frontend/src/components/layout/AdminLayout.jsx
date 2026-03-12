import React from 'react';
import Sidebar from '../layout/Sidebar';
import './AdminLayout.css';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export default function AdminLayout() {
  const { user, loading } = useUser();

  // Показваме loading индикатор докато проверяваме автентикацията
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading admin panel...
      </div>
    );
  }

  // Пренасочваме неадминистраторски потребители към login страницата
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}