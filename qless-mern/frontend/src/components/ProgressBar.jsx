import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, label, hint }) => {
  // progress should be 0 to 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="progress-container">
      <div className="progress-labels">
        {label && <span className="progress-label">{label}</span>}
        {hint && <span className="progress-hint">{hint}</span>}
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
