// src/pages/AdminUI/AccountRequests.jsx
import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import HeaderAdmin from '../../components/layout/HeaderAdmin';
import acceptIcon from '../../assets/icons/accept.svg';
import denyIcon from '../../assets/icons/deny.svg';
import './AccountRequestsPage.css';

export default function AccountRequests() {
  const { fetchAccountRequests, updateAccountRequest } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchAccountRequests()
      .then(result => {
        // Extract the array properly - backend returns { success: true, data: [...] }
        const arr = Array.isArray(result.data) 
          ? result.data 
          : Array.isArray(result) 
            ? result 
            : [];
        setRequests(arr);
        setFilteredRequests(arr);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (searchValue) => {
    if (!searchValue.trim()) {
      setFilteredRequests(requests);
    } else {
      const searchLower = searchValue.toLowerCase().trim();
      const filtered = requests.filter(req => 
        req.firstName?.toLowerCase().includes(searchLower) ||
        req.lastName?.toLowerCase().includes(searchLower) ||
        req.email?.toLowerCase().includes(searchLower) ||
        String(req.universityId).includes(searchValue) ||
        req.role?.toLowerCase().includes(searchLower)
      );
      setFilteredRequests(filtered);
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      await updateAccountRequest(selectedRequest.id, 'APPROVED');
      // Remove from local state since AdminContext will handle the refresh
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setFilteredRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to approve account:', error);
      alert('Failed to approve account. Please try again.');
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    
    try {
      await updateAccountRequest(selectedRequest.id, 'REJECTED');
      // Remove from local state since AdminContext will handle the refresh
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setFilteredRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setShowRejectModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to reject account:', error);
      alert('Failed to reject account. Please try again.');
    }
  };

  const cancelApprove = () => {
    setShowApproveModal(false);
    setSelectedRequest(null);
  };

  const cancelReject = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="account-requests-page">
      <HeaderAdmin 
        placeholder="Search account requests by name, email, university ID, or role..." 
        onSearch={handleSearch} 
      />
      
      <header className="requests-header">
        <h1>Account Registration Requests</h1>
        <button className="sort-btn">
          Oldest to Recent <span className="sort-icon">⇅</span>
        </button>
      </header>

      <div className="table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date Joined</th>
              <th>University ID No</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredRequests) && filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className="user-cell">
                    <img
                      src={req.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${req.firstName} ${req.lastName}`) + '&background=CCD7FF&color=6888FF'}
                      alt={`${req.firstName} ${req.lastName}`}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <span className="name">{req.firstName} {req.lastName}</span>
                      <span className="email">{req.email}</span>
                    </div>
                  </td>
                  <td>
                    {new Date(req.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td>{req.universityId}</td>
                  <td>
                    <span className={`role-badge ${req.role?.toLowerCase() || 'user'}`}>{req.role || 'USER'}</span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <span 
                        className="account-status approve"
                        onClick={() => handleApproveClick(req)}
                      >
                        Approve Account
                      </span>
                      <div className="action-buttons">
                        <span 
                          className="account-status reject"
                          onClick={() => handleRejectClick(req)}
                        >
                          Reject Account
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  {Array.isArray(requests) && requests.length === 0 ? 'Няма нови заявки' : 'No matching requests found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Approve Account Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content approve-modal">
            <button onClick={cancelApprove} className="modal-close-btn">✕</button>
            <div className="modal-icon approve-icon">
              <div className="icon-circle approve-circle">
                <img src={acceptIcon} alt="Accept" className="modal-icon-img" />
              </div>
            </div>
            <h3>Approve Account Request</h3>
            <p>Approve the student's account request and grant access. A confirmation email will be sent upon approval.</p>
            <div className="modal-actions">
              <button onClick={confirmApprove} className="approve-btn">Approve & Send Confirmation</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Account Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content reject-modal">
            <button onClick={cancelReject} className="modal-close-btn">✕</button>
            <div className="modal-icon reject-icon">
              <div className="icon-circle reject-circle">
                <img src={denyIcon} alt="Deny" className="modal-icon-img" />
              </div>
            </div>
            <h3>Deny Account Request</h3>
            <p>Denying this request will notify the student they're not eligible due to unsuccessful ID card verification.</p>
            <div className="modal-actions">
              <button onClick={confirmReject} className="reject-btn">Deny & Notify Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
