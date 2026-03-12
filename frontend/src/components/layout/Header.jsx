import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import Logo from '../../assets/logo.svg';
import LogoutIcon from '../../assets/icons/logout.svg';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar/Avatar';
import Button from '../ui/Button';
import { useUser } from '../../contexts/UserContext';
import { cn, getInitials } from '../../utils/getInitials';

const Header = ({firstName, lastName, userAvatarUrl}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useUser();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/borrow-book');
  };

  return (
    <header className={cn('header')}>
      <Link to="/home" className="brand">
        <img src={Logo} alt="logo" className="logo" />
        <span className="title">Digital Library</span>
      </Link>
      <div className="avatar-wrapper">
        <div className="user-profile-section" onClick={handleProfileClick}>
          <Avatar className="avatar">
            {userAvatarUrl ? (
              <AvatarImage src={userAvatarUrl} alt={`${firstName} ${lastName}`} />
            ) : (
              <AvatarFallback>
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="username">
            <span className="firstname">{firstName}</span>
            <span className="lastname">{lastName}</span>
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          className="logout-button"
          type="button"
        >
          <img src={LogoutIcon} alt="logout" className="logout-icon" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
