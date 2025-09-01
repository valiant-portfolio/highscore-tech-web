import React from 'react';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
    <div style={{
      border: '4px solid rgba(255, 255, 255, 0.1)',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      borderLeftColor: 'var(--primary-cyan)',
      animation: 'spin 1s ease infinite'
    }}>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;
