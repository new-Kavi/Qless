import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', fullWidth, className = '', ...props }) => {
  const baseClass = `custom-button ${variant} ${fullWidth ? 'full-width' : ''} ${className}`;
  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
