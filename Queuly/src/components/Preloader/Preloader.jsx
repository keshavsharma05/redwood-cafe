import React from 'react';
import './Preloader.css';

export default function Preloader() {
  return (
    <div className="preloader-container">
      <div className="preloader-bg-overlay"></div>
      
      <div className="preloader-content">
        <div className="preloader-spinner-wrapper">
          <svg className="preloader-spinner" viewBox="0 0 100 100">
            <circle className="spinner-track" cx="50" cy="50" r="46" />
            <circle className="spinner-path" cx="50" cy="50" r="46" />
          </svg>
          <img className="preloader-center-logo" src="/logo.png" alt="Redwood Cafe" />
        </div>
        
        <h2 className="preloader-title">Redwood Café</h2>
        <p className="preloader-msg">Brewing something good...</p>
      </div>
    </div>
  );
}
