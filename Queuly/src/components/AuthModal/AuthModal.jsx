import React, { useState } from 'react';
import './AuthModal.css';
import API_BASE_URL from "../../config";

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState(1); // 1 = Phone/Details, 2 = OTP
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const resetStateAndClose = () => {
    setStep(1);
    setPhone('');
    setFullName('');
    setOtp('');
    setReceivedOtp('');
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup' && (!fullName.trim() || phone.trim().length < 10)) {
      setError("Please enter a valid name and phone number");
      setLoading(false);
      return;
    }

    if (mode === 'login' && phone.trim().length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setReceivedOtp(data.data.demoOtp);
        setStep(2);
      } else {
        setError(data.message || "Failed to request OTP.");
      }
    } catch (err) {
      setError("Network error connecting to backend.");
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (otp.length < 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("userToken", data.data.token);
        localStorage.setItem("userName", data.data.name);
        localStorage.setItem("userPhone", phone);
        localStorage.setItem("towncoffee-user", JSON.stringify({ phone, name: data.data.name }));
        window.dispatchEvent(new Event("auth-change"));
        resetStateAndClose();
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={resetStateAndClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={resetStateAndClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="auth-header">
          {step === 1 ? (
            <>
              <h2 className="auth-title">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="auth-subtitle">
                {mode === 'login' ? 'Sign in to continue your Redwood experience.' : "Let's get you started."}
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-title">Verify your number</h2>
              <p className="auth-subtitle">
                We've generated a code for +91 {phone}
              </p>
              {receivedOtp && (
                <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', margin: '16px 0', textAlign: 'center', border: '1px solid #d97706' }}>
                  <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Demo OTP — No SMS will be sent</span>
                  <strong style={{ fontSize: '28px', letterSpacing: '8px', color: '#2c1f14' }}>{receivedOtp}</strong>
                </div>
              )}
            </>
          )}
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form className="auth-form" onSubmit={step === 1 ? handleContinue : handleVerify}>
          {step === 1 ? (
            <>
              {mode === 'signup' && (
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              
              <div className="auth-input-group">
                <label>Phone Number</label>
                <div className="auth-input-wrapper auth-phone-wrapper">
                  <span className="phone-prefix">+91</span>
                  <div className="phone-divider"></div>
                  <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? (mode === 'login' ? 'Sending code...' : 'Creating account...') : 'Continue'}
              </button>
            </>
          ) : (
            <>
              <div className="auth-input-group">
                <div className="auth-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    autoFocus
                    disabled={loading}
                    className="otp-input"
                  />
                </div>
              </div>

              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </>
          )}
        </form>

        <div className="auth-footer-toggle">
          {step === 1 ? (
            mode === 'login' ? (
              <>
                <p>New to Redwood Café?</p>
                <button onClick={() => { setMode('signup'); setError(null); }}>Create an account</button>
              </>
            ) : (
              <>
                <p>Already have an account?</p>
                <button onClick={() => { setMode('login'); setError(null); }}>Sign in</button>
              </>
            )
          ) : (
            <>
              <p>Didn't receive the code?</p>
              <button disabled={loading} type="button" onClick={handleContinue}>Resend Demo OTP</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
