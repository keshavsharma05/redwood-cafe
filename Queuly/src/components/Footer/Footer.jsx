import "./Footer.css";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="ft-footer">
      {/* ── MAIN BODY ── */}
      <div className="ft-body">

        {/* COL 1 — Brand */}
        <div className="ft-col ft-col--brand">
          <div className="ft-brand-top">
            <div>
              <img src="/logo.png" alt="Redwood Cafe" style={{ height: "48px", width: "auto" }} />
            </div>
            <div className="ft-accent-line" />
            <p className="ft-tagline-label">GOOD COFFEE. GOOD COMPANY.</p>
            <p className="ft-tagline-sub">A space to slow down, connect, and<br />savor the little things in life.</p>
          </div>

          {/* Circular stamp badge */}
          <div className="ft-stamp">
            <svg viewBox="0 0 120 120" width="120" height="120" className="ft-stamp-ring">
              <defs>
                <path id="top-arc" d="M 15,60 a 45,45 0 1,1 90,0" />
                <path id="bot-arc" d="M 105,60 a 45,45 0 1,1 -90,0" />
              </defs>
              <text fontSize="10.5" letterSpacing="3.5" fill="#9c7c5a" fontFamily="Inter,sans-serif" fontWeight="700">
                <textPath href="#top-arc" startOffset="8%">CRAFTED WITH CARE •</textPath>
              </text>
              <text fontSize="10.5" letterSpacing="3.5" fill="#9c7c5a" fontFamily="Inter,sans-serif" fontWeight="700">
                <textPath href="#bot-arc" startOffset="8%">SERVED WITH SOUL •</textPath>
              </text>
            </svg>
            <div className="ft-stamp-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9c7c5a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z"/>
                <path d="M6 21H18"/><path d="M12 17V21"/>
              </svg>
            </div>
          </div>
        </div>

        {/* COL 2 — Nav Links */}
        <div className="ft-col ft-col--nav">
          <div className="ft-nav-group">
            <span className="ft-nav-label">EXPLORE</span>
            <a href="/story" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>Our Story</a>
            <a href="/menu" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/menu"); }}>Menu</a>
            <a href="/art" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>The Art</a>
            <a href="/visit" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>Visit Us</a>
          </div>

          <div className="ft-nav-group">
            <span className="ft-nav-label">EXPERIENCE</span>
            <a href="/cafe" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>At The Café</a>
            <a href="/order" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/menu"); }}>Order Online</a>
            <a href="/events" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>Private Events</a>
            <a href="/gift" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>Gift Cards</a>
          </div>

          <div className="ft-nav-group">
            <span className="ft-nav-label">CONNECT</span>
            <a href="https://instagram.com" className="ft-nav-link" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://facebook.com" className="ft-nav-link" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://pinterest.com" className="ft-nav-link" target="_blank" rel="noreferrer">Pinterest</a>
            <a href="/contact" className="ft-nav-link" onClick={e => { e.preventDefault(); navigate("/"); }}>Contact Us</a>
          </div>
        </div>

        {/* COL 3 — Hours, Address, Contact */}
        <div className="ft-col ft-col--info">

          {/* Hours */}
          <div className="ft-info-block">
            <div className="ft-info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9c7c5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="ft-info-label">OPEN DAILY</span>
            <p className="ft-info-time">7:00 AM</p>
            <div className="ft-info-dash">—</div>
            <p className="ft-info-time">11:00 PM</p>
          </div>

          <div className="ft-info-divider" />

          {/* Address */}
          <div className="ft-info-block">
            <div className="ft-info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9c7c5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span className="ft-info-label">FIND US</span>
            <p className="ft-info-text">21 Redwood Street<br />Bangalore, India</p>
          </div>

          <div className="ft-info-divider" />

          {/* Contact */}
          <div className="ft-info-block">
            <div className="ft-info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9c7c5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <a href="mailto:hello@redwoodcafe.in" className="ft-info-email">hello@redwoodcafe.in</a>
            <a href="tel:+919876543210" className="ft-info-phone">+91 98765 43210</a>
          </div>
        </div>

        {/* COL 4 — Photo */}
        <div className="ft-col ft-col--photo">
          <div className="ft-photo-frame">
            <img src="/interior.png" alt="Redwood Café interior" />
          </div>
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="ft-bottom">
        <span className="ft-copyright">© 2025 REDWOOD CAFÉ</span>

        <div className="ft-bottom-center">
          <span className="ft-bottom-line" />
          <div className="ft-bottom-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9c7c5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L8 6H4l2 4-2 4h4l4 4 4-4h4l-2-4 2-4h-4l-4-4z"/><circle cx="12" cy="10" r="2.5"/>
            </svg>
          </div>
          <span className="ft-bottom-line" />
          <span className="ft-bottom-tagline">MADE WITH COFFEE &amp; CARE</span>
        </div>

        <button className="ft-back-top" onClick={scrollToTop} aria-label="Back to top">
          BACK TO TOP
          <span className="ft-back-top-circle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </span>
        </button>
      </div>
    </footer>
  );
}