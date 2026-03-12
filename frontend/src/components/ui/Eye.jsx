// src/components/ui/Eye.jsx
import React from 'react';
import eyeOpen from '../../assets/icons/eye.svg';
import eyeClosed from '../../assets/icons/eye-slash.svg';

function Eye({ isVisible, onToggle, className = '' }) {
  return (
    <img
      src={isVisible ? eyeOpen : eyeClosed}
      alt={isVisible ? 'Hide password' : 'Show password'}
      onClick={onToggle}
      className={className}
      style={{ cursor: 'pointer' }}
    />
  );
}

export default Eye;