import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import HeaderAdmin from '../../components/layout/HeaderAdmin';
import './BorrowRequestsPage.css';

export default function BorrowRequestsPage() {
  const { borrowRequests, loading, fetchBorrowRequests, updateBorrowRequest } = useAdmin();
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  useEffect(() => {
    filterRequests(searchValue, statusFilter);
  }, [borrowRequests, searchValue, statusFilter]);

  const filterRequests = (search, status) => {
    let filtered = [...borrowRequests];

    // Apply status filter
    if (status !== 'ALL') {
      filtered = filtered.filter(request => request.status === status);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(request => 
        request.userName?.toLowerCase().includes(searchLower) ||
        request.bookTitle?.toLowerCase().includes(searchLower) ||
        request.status?.toLowerCase().includes(searchLower) ||
        request.id?.toString().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const getStatusCount = (status) => {
    return borrowRequests.filter(request => request.status === status).length;
  };

  const handleStatusChange = async (requestId, newStatus, currentStatus) => {
    try {
      // Validate status transitions
      if (currentStatus === 'OVERDUE' && newStatus !== 'RETURNED') {
        alert('Overdue books can only be returned');
        return;
      }

      await updateBorrowRequest(requestId, newStatus);
      // Обновление произойдет автоматически через AdminContext
    } catch (error) {
      alert('Failed to update borrow request status: ' + (error.message || 'Unknown error'));
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus?.toUpperCase()) {
      case 'PENDING':
        return ['PENDING', 'BORROWED'];
      case 'BORROWED':
        return ['BORROWED', 'RETURNED'];
      case 'OVERDUE':
        return ['OVERDUE', 'RETURNED'];
      case 'RETURNED':
        return ['RETURNED'];
      default:
        return ['PENDING', 'BORROWED', 'RETURNED'];
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'borrowed':
        return 'borrowed';
      case 'returned':
        return 'returned';
      case 'pending':
        return 'pending';
      case 'overdue':
        return 'overdue';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'BORROWED':
        return 'Borrowed';
      case 'RETURNED':
        return 'Returned';
      case 'PENDING':
        return 'Pending';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return status;
    }
  };

  if (loading.borrowRequests) {
    return <div className="borrow-requests-page loading">Loading borrow requests...</div>;
  }

  return (
    <div className="borrow-requests-page">
      <HeaderAdmin 
        placeholder="Search users, books by title, author, or genre..." 
        onSearch={handleSearch} 
      />
      
      <header className="requests-header">
        <h1>Borrow Book Requests</h1>
        <div className="status-filters">
          <button 
            className={`status-filter ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('ALL')}
          >
            All ({borrowRequests.length})
          </button>
          <button 
            className={`status-filter overdue ${statusFilter === 'OVERDUE' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('OVERDUE')}
          >
            Overdue ({getStatusCount('OVERDUE')})
          </button>
          <button 
            className={`status-filter pending ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('PENDING')}
          >
            Pending ({getStatusCount('PENDING')})
          </button>
          <button 
            className={`status-filter borrowed ${statusFilter === 'BORROWED' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('BORROWED')}
          >
            Borrowed ({getStatusCount('BORROWED')})
          </button>
        </div>
      </header>

      <div className="borrow-table-container">
        <table className="borrow-requests-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>User Requested</th>
              <th>Status</th>
              <th>Borrowed date</th>
              <th>Return date</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <tr key={request.id} className={request.status.toLowerCase()}>
                  <td className="borrow-book-cell">
                    <div className="borrow-book-cover">
                      {request.bookCover ? (
                        <img 
                          src={request.bookCover} 
                          alt={request.bookTitle}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="borrow-book-placeholder" style={{display: request.bookCover ? 'none' : 'flex'}}>
                        📚
                      </div>
                    </div>
                    <span className="borrow-book-title" title={request.bookTitle}>
                      {request.bookTitle}
                    </span>
                  </td>
                  <td className="borrow-user-cell">
                    <img
                      src={request.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userName || 'User')}&background=CCD7FF&color=6888FF`}
                      alt={request.userName}
                      className="borrow-user-avatar"
                    />
                    <div className="borrow-user-info">
                      <span className="borrow-user-name">{request.userName}</span>
                      <span className="borrow-user-email">{request.userEmail || 'No email'}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`borrow-status-dropdown ${getStatusColor(request.status)}`}>
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value, request.status)}
                        disabled={request.status === 'RETURNED'}
                      >
                        {getAvailableStatuses(request.status).map(status => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <span className="borrow-dropdown-arrow">⌄</span>
                    </div>
                  </td>
                  <td>
                    {request.borrowDate ? new Date(request.borrowDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td>
                    {request.returnDate ? new Date(request.returnDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Not returned'}
                  </td>
                  <td>
                    {request.dueDate ? new Date(request.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  No borrow requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 