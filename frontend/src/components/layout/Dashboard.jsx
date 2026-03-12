import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const { fetchStats } = useAdmin();
  const [stats, setStats] = useState({ borrowed: 0, users: 0, books: 0 });

  useEffect(() => {
    // Only fetch stats if user is authenticated as admin
    if (userLoading || !user || user.role !== 'ADMIN') {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetchStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep default empty stats on error
      }
    };

    fetchData();
  }, [user, userLoading, fetchStats]);

  // Show loading while checking authentication
  if (userLoading) {
    return <div>Loading...</div>;
  }

  // Don't render if not authenticated
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="dashboard">
      <h2>Welcome, Admin</h2>
      <div className="stats-grid">
        <div className="stat-card">👓<h3>{stats.borrowed}</h3><p>Borrowed Books</p></div>
        <div className="stat-card">👤<h3>{stats.users}</h3><p>Total Users</p></div>
        <div className="stat-card">📚<h3>{stats.books}</h3><p>Total Books</p></div>
      </div>
    </div>
  );
}