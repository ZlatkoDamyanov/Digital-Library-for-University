import React from 'react';

function Button({
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,      
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;