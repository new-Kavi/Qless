import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className="custom-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
    </div>
  );
};

export default Input;
