import React from 'react';
import './Preloader.css';

export default function Preloader() {
  return (
    <div className="preloader-container">
      {/* Decorative Shadow Overlay */}
      <div className="preloader-shadow-overlay"></div>
      
      <div className="preloader-content">
        <div className="preloader-logo-section">
          <div className="steam-lines">
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="steam-line steam-1" d="M10 24C10 20 6 16 6 12C6 8 10 4 10 0" stroke="#B4A695" strokeWidth="1.5" strokeLinecap="round"/>
              <path className="steam-line steam-2" d="M16 28C16 24 12 20 12 16C12 12 16 8 16 4" stroke="#B4A695" strokeWidth="1.5" strokeLinecap="round"/>
              <path className="steam-line steam-3" d="M22 24C22 20 18 16 18 12C18 8 22 4 22 0" stroke="#B4A695" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          
          <div className="tree-circle" style={{ marginTop: '15px' }}>
            <img className="preloader-logo-pulse" src="/logo.png" alt="Redwood Cafe" style={{ height: '110px', width: 'auto' }} />
          </div>
        </div>

        <div className="preloader-divider"></div>
        
        <p className="preloader-msg">Brewing something good...</p>
      </div>
    </div>
  );
}
