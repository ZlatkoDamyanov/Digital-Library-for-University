import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import './Sidebar.css';

// Import contexts and utilities
import { useUser } from '../../contexts/UserContext';
import { getInitials } from '../../utils/getInitials';

// Import components
import { Avatar, AvatarImage, AvatarFallback } from '../avatar/Avatar';

// Import icons
import logoIcon from '../../assets/logo.svg';
import homeIcon from '../../assets/icons/home.svg';
import usersIcon from '../../assets/icons/users.svg';
import bookIcon from '../../assets/icons/book.svg';
import bookmarkIcon from '../../assets/icons/bookmark.svg';
import userIcon from '../../assets/icons/user.svg';
import logoutIcon from '../../assets/icons/logout.svg';

export default function Sidebar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Force navigation to login page
    window.location.href = '/login';
  };

  return (
    <nav className="admin-sidebar">
      <Link to="/admin/home" className="logo">
        <img src={logoIcon} alt="Logo" className="logo-icon" />
        <span className="logo-text">Digital Library</span>
      </Link>
      
      <ul>
        <li>
          <NavLink to="/admin/home" end className="nav-link">
            <img src={homeIcon} alt="Home" className="nav-icon" />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/users" className="nav-link">
            <img src={usersIcon} alt="Users" className="nav-icon" />
            <span>All Users</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/books" className="nav-link">
            <img src={bookIcon} alt="Books" className="nav-icon" />
            <span>All Books</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/borrow-requests" className="nav-link">
            <img src={bookmarkIcon} alt="Borrow Requests" className="nav-icon" />
            <span>Borrow Requests</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/account-requests" className="nav-link">
            <img src={userIcon} alt="Account Requests" className="nav-icon" />
            <span>Account Requests</span>
          </NavLink>
        </li>
      </ul>

      {/* User Profile Section */}
      {user && (
        <div className="user-profile">
          <div className="user-info" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar className="user-avatar" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="user-details" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <img src={logoutIcon} alt="Logout" className="logout-icon" />
          </button>
        </div>
      )}
    </nav>
  );
}