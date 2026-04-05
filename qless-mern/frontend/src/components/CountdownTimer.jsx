import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetTimeMs }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('upcoming');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetTimeMs - now;

      if (difference <= 0) {
         if (difference > -3600000) { // Within 1 hour after start
             setTimeLeft('In Progress');
             setStatus('active');
         } else {
             setTimeLeft('Completed');
             setStatus('completed');
         }
         return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`Starts in: ${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`);
      
      // Change status to approaching if less than 30 mins
      if (difference < 30 * 60 * 1000) {
         setStatus('approaching');
      } else {
         setStatus('upcoming');
      }
    };

    calculateTime(); // initial calculate
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [targetTimeMs]);

  const colorClass = 
      status === 'approaching' ? 'var(--color-danger)' : 
      status === 'active' ? 'var(--color-secondary)' : 
      'var(--color-primary)';

  return (
    <div style={{
       fontSize: '0.85rem', 
       fontWeight: '600', 
       color: colorClass,
       display: 'inline-flex',
       alignItems: 'center',
       gap: '0.4rem',
       backgroundColor: 'var(--color-background)',
       padding: '0.25rem 0.5rem',
       borderRadius: 'var(--radius-sm)',
       border: `1px dashed ${colorClass}`
    }}>
      {status === 'approaching' && <span className="pulsing-dot" style={{width: 8, height: 8, backgroundColor: 'var(--color-danger)', borderRadius: '50%', display: 'inline-block'}}></span>}
      {timeLeft}
    </div>
  );
};

export default CountdownTimer;
