/**
 * Компонент за показване на всички потребители в админския панел
 * Позволява търсене, редактиране и изтриване на потребители
 * Включва модални прозорци за потвърждение на действията
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import HeaderAdmin from '../../components/layout/HeaderAdmin';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import './AllUsers.css';

export default function AllUsers() {
  const { fetchUsers, updateUser, deleteUser } = useAdmin();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    password: ''
  });

  /**
   * Зарежда всички потребители при първоначално зареждане на компонента
   */
  useEffect(() => {
    fetchUsers()
      .then((response) => {
        if (response.success && Array.isArray(response.data)) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      })
      .catch((error) => {
        setUsers([]);
        setFilteredUsers([]);
      });
  }, []);

  const handleSearch = (searchValue) => {
    if (!searchValue.trim()) {
      setFilteredUsers(users);
    } else {
      const searchLower = searchValue.toLowerCase().trim();
      const filtered = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        String(user.universityId).includes(searchValue)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete.id);
      // Update local state to remove deleted user
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setFilteredUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditFormData({
      email: user.email,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        email: editFormData.email,
        universityId: userToEdit.universityId,
        status: userToEdit.status
      };
      
      // Only include password if it's provided
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password;
      }
      
      await updateUser(userToEdit.id, updateData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userToEdit.id 
          ? { ...user, email: editFormData.email }
          : user
      ));
      setFilteredUsers(prev => prev.map(user => 
        user.id === userToEdit.id 
          ? { ...user, email: editFormData.email }
          : user
      ));
      
      setShowEditModal(false);
      setUserToEdit(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditFormData({ email: '', password: '' });
  };

  return (
    <div className="all-users-container">
      <HeaderAdmin 
        placeholder="Search users by name, email, role, or university ID..." 
        onSearch={handleSearch} 
      />
      <header className="users-header">
        <h1>All Users</h1>
        <div className="actions">
          <button className="sort-btn">A–Z <span>⇅</span></button>
        </div>
      </header>

      <div className="table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date Joined</th>
              <th>Role</th>
              <th>Books Borrowed</th>
              <th>University ID No</th>
              <th>Action</th>
            </tr>
          </thead>
                      <tbody>
              {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-cell">
                  <img src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${user.firstName} ${user.lastName}`) + '&background=CCD7FF&color=6888FF'} alt={`${user.firstName} ${user.lastName}`} className="user-avatar" />
                  <div className="user-info">
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </td>
                <td>{user.borrowedCount}</td>
                <td>{user.universityId}</td>
                <td>
                  <div className="action-cell">
                    <span className={`account-status ${user.role.toLowerCase()}`}>
                      Approve Account
                    </span>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditUser(user)}
                        aria-label="Edit user"
                      >
                        <img src={editIcon} alt="Edit" />
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteUser(user.id)}
                        aria-label="Delete user"
                      >
                        <img src={deleteIcon} alt="Delete" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="cancel-btn">Cancel</button>
              <button onClick={confirmDelete} className="confirm-btn">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button type="button" onClick={cancelEdit} className="close-btn">×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={userToEdit?.firstName || ''} disabled />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={userToEdit?.lastName || ''} disabled />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={userToEdit?.role || ''} disabled />
              </div>
              <div className="form-group">
                <label>University ID</label>
                <input type="text" value={userToEdit?.universityId || ''} disabled />
              </div>
              <div className="modal-actions">
                <button type="submit" className="confirm-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}