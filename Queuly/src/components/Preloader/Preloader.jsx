import React, { useEffect, useState } from 'react';
import './Preloader.css';

export default function Preloader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += Math.random() * 4;

      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }

      setProgress(Math.floor(current));
    }, 90);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="preloader-container">

      {/* Subtle atmospheric background */}
      <div className="preloader-texture" />
      <div className="preloader-light" />

      {/* Top left */}
      <div className="preloader-top-left">
        <span className="small-line"></span>
        <span>REDWOOD CAFE</span>
      </div>

      {/* Top right */}
      <div className="preloader-top-right">
        <span>GOOD COFFEE</span>
        <span className="slash">/</span>
        <span>BETTER DAYS</span>
      </div>

      {/* Left vertical detail */}
      <div className="preloader-side-label">
        <span className="side-line"></span>

        <span className="vertical-text">
          EST. 2021
        </span>

        <span className="side-line"></span>
      </div>

      {/* Main content */}
      <main className="preloader-content">

        <div className="brand-wrapper">

          <img
            src="/logo.png"
            alt="Redwood Cafe"
            className="preloader-logo"
          />

        </div>

        <div className="loading-area">

          <p className="loading-message">
            BREWING SOMETHING SPECIAL...
          </p>

          <div className="progress-row">

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>

          <div className="progress-number">
            {String(progress).padStart(2, '0')}%
          </div>

        </div>

      </main>

      {/* Bottom right */}
      <div className="preloader-skip">
        <span className="skip-line"></span>
      </div>

    </div>
  );
}