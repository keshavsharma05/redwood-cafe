import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ onOpenAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userToken"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("userToken"));
      setUserName(localStorage.getItem("userName") || "User");
    };
    window.addEventListener("auth-change", handleAuthChange);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const handleNavClick = (sectionId) => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  if (location.pathname === "/menu" || location.pathname === "/billing" || location.pathname === "/pay") {
    return null;
  }

  return (
    <header className={`app-header ${scrolled ? "app-header--scrolled" : ""}`}>
      <nav className="app-nav">
        {/* Brand / Logo */}
        <div className="app-logo" onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
        </div>

        {/* Desktop Nav Links */}
        <ul className={`app-nav-links ${menuOpen ? "app-nav-links--open" : ""}`}>
          <li>
            <button className="app-nav-btn" onClick={() => { setMenuOpen(false); navigate("/menu"); }}>
              Menu
            </button>
          </li>
          <li>
            <button className="app-nav-btn" onClick={() => handleNavClick("cafe")}>
              Our Place
            </button>
          </li>
          <li>
            <button className="app-nav-btn" onClick={() => handleNavClick("categories")}>
              Our Specials
            </button>
          </li>
          <li>
            <button className="app-nav-btn" onClick={() => handleNavClick("preorder")}>
              Queuly
            </button>
          </li>
          <li>
            <button className="app-nav-btn" onClick={() => handleNavClick("testimonials")}>
              Testimonials
            </button>
          </li>
          <li>
            <button className="app-nav-btn" onClick={() => { setMenuOpen(false); navigate("/billing"); }} style={{ display: 'flex', alignItems: 'center', padding: "8px 0" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span style={{ fontSize: "12px", fontWeight: 700, marginLeft: "6px", color: "#2c1f14" }}>
                Cart ({JSON.parse(localStorage.getItem('towncoffee-cart') || '{}') ? Object.keys(JSON.parse(localStorage.getItem('towncoffee-cart') || '{}')).length : 0})
              </span>
            </button>
          </li>
          {!isLoggedIn ? (
            <li>
              <button className="app-nav-btn" onClick={() => { setMenuOpen(false); onOpenAuth(); }}>
                Sign Up
              </button>
            </li>
          ) : (
            <li className="profile-card-wrapper" style={{ position: 'relative' }}>
              <button 
                className="app-nav-btn profile-card-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="profile-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="profile-name">{userName}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <button className="profile-dropdown-item" onClick={() => { setProfileDropdownOpen(false); navigate('/orders'); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    My Orders
                  </button>
                  <button className="profile-dropdown-item" onClick={() => { setProfileDropdownOpen(false); navigate('/history'); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Order History
                  </button>
                  <div className="profile-dropdown-divider"></div>
                  <button className="profile-dropdown-item profile-dropdown-item--danger" onClick={() => {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userPhone');
                    localStorage.removeItem('towncoffee-user');
                    window.dispatchEvent(new Event('auth-change'));
                    setProfileDropdownOpen(false);
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log Out
                  </button>
                </div>
              )}
            </li>
          )}
          <li>
            <button
              className="app-nav-btn app-nav-btn--cta"
              onClick={() => {
                setMenuOpen(false);
                navigate("/menu");
              }}
            >
              Order Now
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          className={`app-hamburger ${menuOpen ? "app-hamburger--active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}
