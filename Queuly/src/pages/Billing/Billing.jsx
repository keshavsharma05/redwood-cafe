import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./Billing.css";
import "../../components/AuthModal/AuthModal.css";

export default function Billing() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Persistence & Cart Info
  const [quantities, setQuantities] = useState(() => JSON.parse(localStorage.getItem("towncoffee-cart")) || {});
  const menuItems = JSON.parse(localStorage.getItem("towncoffee-menu")) || [];
  const storedUser = JSON.parse(localStorage.getItem("towncoffee-user")) || null;

  const cartItems = Object.entries(quantities)
    .map(([id, qty]) => {
      const item = menuItems.find((m) => String(m._id || m.itemId || m.id) === String(id));
      return item ? { id: id, title: item.title, price: item.price, image: item.image, qty } : null;
    })
    .filter(Boolean);

  // 2. States
  const [activeMode, setActiveMode] = useState("arrived");
  const [tableNumber, setTableNumber] = useState("");
  
  const [pickH, setPickH] = useState("");
  const [pickM, setPickM] = useState("");
  const [pickAmPm, setPickAmPm] = useState("PM");
  
  // User Account Details
  const [name, setName] = useState(storedUser?.name || "");
  const [phone, setPhone] = useState(storedUser?.phone || "");
  const [isVerified, setIsVerified] = useState(storedUser?.isVerified || false);
  
  // Recipient (Someone else) Details
  const [isForSomeoneElse, setIsForSomeoneElse] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);


  const getMinTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < 9) return "09:00";
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  const minTime = getMinTime();
  const isCafeClosed = minTime > "23:00";

  const computedArrivalTime = (pickH && pickM) ? (() => {
    let h24 = parseInt(pickH, 10);
    if (pickAmPm === "PM" && h24 !== 12) h24 += 12;
    if (pickAmPm === "AM" && h24 === 12) h24 = 0;
    return `${String(h24).padStart(2, '0')}:${String(pickM).padStart(2, '0')}`;
  })() : "";

  const timeError = (() => {
    if (!computedArrivalTime) return null;
    const currentMinTime = getMinTime();
    if (computedArrivalTime < currentMinTime) return "Please select a time that is in the future.";
    if (computedArrivalTime > "23:00") return "Cafe closes at 11:00 PM.";
    return null;
  })();

  // 3. Totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const convenienceFee = 0;
  const itemTotal = subtotal + gst + convenienceFee;

  // 4. Handlers
  const handleUpdateQty = (id, delta) => {
    const newQuantities = { ...quantities };
    const currentQty = newQuantities[id] || 0;
    const nextQty = currentQty + delta;

    if (nextQty <= 0) {
      delete newQuantities[id];
    } else {
      newQuantities[id] = nextQty;
    }

    setQuantities(newQuantities);
    localStorage.setItem("towncoffee-cart", JSON.stringify(newQuantities));
  };

  const handleConfirmPay = async () => {
    if (isProcessing) return;

    if (activeMode === "scheduled") {
      if (!computedArrivalTime) {
        alert("Please select a pickup time.");
        return;
      }
      if (timeError) {
        alert(timeError);
        return;
      }
    }

    setIsProcessing(true);

    // If we just verified, save the user
    if (showVerifyModal && !isVerified) {
      const userData = { name, phone, isVerified: true };
      localStorage.setItem("towncoffee-user", JSON.stringify(userData));
      setIsVerified(true);
      setShowVerifyModal(false);
    }

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          orderType: activeMode,
          tableNumber: activeMode === "arrived" ? tableNumber : null,
          arrivalTime: activeMode === "scheduled" ? computedArrivalTime : null,
          items: cartItems.map((i) => ({ itemId: i.id, qty: i.qty })),
          accountName: name,
          accountPhone: phone,
          pickerName: isForSomeoneElse ? recipientName : name,
          pickerPhone: isForSomeoneElse ? recipientPhone : phone,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        alert(resData.message || "Order failed");
        return;
      }

      localStorage.removeItem("towncoffee-cart");
      navigate(`/pay?orderId=${resData.data.orderId}`);
    } catch (err) {
      console.error(err);
      alert("Connection Error. Check your server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrderClick = () => {
    if (isVerified) {
      handleConfirmPay();
    } else {
      setShowVerifyModal(true);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="billing-page">
        {/* ── LOCAL NAVBAR ── */}
        <nav className="mn-nav">
          <div className="mn-nav-logo" onClick={() => navigate("/")}>
            <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
          </div>
          <ul className="mn-nav-links">
            <li><button onClick={() => navigate("/")}>Our Place</button></li>
            <li><button onClick={() => navigate("/menu")}>Our Specials</button></li>
            <li><button onClick={() => navigate("/")}>Queuly</button></li>
            <li><button onClick={() => navigate("/")}>Testimonials</button></li>
          </ul>
          <div className="mn-nav-actions">
            <button className="mn-icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button className="mn-icon-btn" style={{ padding: "8px 0", borderBottom: "2px solid #2c1f14" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span style={{ fontSize: "12px", fontWeight: 700, marginLeft: "6px", color: "#2c1f14" }}>Cart (0)</span>
            </button>
            <button className="mn-icon-btn" style={{ background: "#386a41", color: "#fff", width: 28, height: 28, borderRadius: "50%", fontSize: 12, fontWeight: 700, marginLeft: 16 }}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2c1f14" }}>{name || "User"}</span>
            <button className="mn-nav-order-btn" onClick={() => navigate("/menu")} style={{ background: "#3d2b1f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "30px", fontSize: 12, fontWeight: 700, marginLeft: 16, cursor: "pointer" }}>Order Now</button>
          </div>
        </nav>

        {/* ── EMPTY CART MAIN ── */}
        <div className="empty-cart-container">
          <div className="empty-cart-header">
            <h1>Your Cart</h1>
            <p>Review your items before placing the order.</p>
          </div>
          <div className="empty-cart-box">
              <img src="/cart.png" alt="Empty Cart" className="empty-cart-img" />
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-sub">Looks like you haven't added anything yet.<br/>Explore our menu and add something delicious!</p>
            <button className="empty-btn" onClick={() => navigate("/menu")}>Explore Menu</button>
          </div>
          
          <div className="empty-cart-footer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d2b1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-4"/><path d="M12 18 8 13h3L8 7h3l1-4 1 4h3l-3 6h3l-4 5z"/></svg>
            <p>Thanks for choosing Redwood Cafe.<br/>We hope to serve you again soon!</p>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5544" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-page">
      {/* ── LOCAL NAVBAR ── */}
      <nav className="mn-nav">
        <div className="mn-nav-logo" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
        </div>

        <ul className="mn-nav-links">
          <li><button onClick={() => navigate("/")}>Home</button></li>
          <li><button onClick={() => navigate("/menu")}>Menu</button></li>
          <li><button onClick={() => navigate("/")}>Our Story</button></li>
          <li><button onClick={() => navigate("/")}>The Art</button></li>
          <li><button onClick={() => navigate("/")}>Visit Us</button></li>
        </ul>

        <div className="mn-nav-actions">
          <button className="mn-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="mn-icon-btn" style={{ padding: "8px 0", borderBottom: "2px solid #2c1f14", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span style={{ fontSize: "12px", fontWeight: 700, marginLeft: "6px", color: "#2c1f14" }}>Cart ({cartItems.length})</span>
          </button>
        </div>
      </nav>

      {/* ── SPLIT LAYOUT ── */}
      <div className="billing-container-split">
        <button className="billing-back-link" onClick={() => navigate("/menu")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Menu
        </button>

        <div className="billing-columns">
          {/* LEFT COLUMN */}
          <div className="billing-left-col">
            <div className="billing-summary-card">
              <div className="summary-card-header">
                <h2>ORDER SUMMARY</h2>
                <div className="summary-decor">
                  <svg width="40" height="10" viewBox="0 0 40 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5H25M20 1C17 1 15 5 15 5C15 5 17 9 20 9C23 9 25 5 25 5C25 5 23 1 20 1Z" stroke="#D1C4B5" strokeWidth="1"/>
                    <line x1="0" y1="5" x2="15" y2="5" stroke="#D1C4B5" strokeWidth="1"/>
                    <line x1="25" y1="5" x2="40" y2="5" stroke="#D1C4B5" strokeWidth="1"/>
                  </svg>
                </div>
                <p>Almost ready to brew.</p>
              </div>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <img src={item.image} alt={item.title} className="summary-item-img" onError={(e) => { e.target.onerror = null; e.target.src = '/bean.png'; }} />
                    <span className="summary-item-title">{item.title}</span>
                    <span className="summary-item-qty">x {item.qty}</span>
                    <span className="summary-item-price">₹ {item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>₹ {subtotal}</span>
                </div>
                <div className="breakdown-row">
                  <span>GST (5%)</span>
                  <span>₹ {gst}</span>
                </div>
                <div className="breakdown-row">
                  <span>Convenience Fee</span>
                  <span>₹ {convenienceFee}</span>
                </div>
              </div>

              <div className="summary-total-row">
                <span>TOTAL</span>
                <span>₹ {itemTotal}</span>
              </div>

              <div className="summary-badges">
                <div className="badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                  <span>Secure Payment</span>
                </div>
                <div className="badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                  <span>Freshly Prepared</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="billing-right-col">
            <div className="billing-details-header">
              <h2>BILLING & DETAILS</h2>
              <p>Please review your order and provide the details below.</p>
            </div>

            <div className="billing-modes-toggle">
              <button className={`mode-btn ${activeMode === "arrived" ? "active" : ""}`} onClick={() => setActiveMode("arrived")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m9 10 3.2 1.6a2 2 0 0 0 1.96-.13L15 10"/><path d="M12 14v-4"/></svg>
                WALK IN
              </button>
              <button className={`mode-btn ${activeMode === "scheduled" ? "active" : ""}`} onClick={() => setActiveMode("scheduled")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                SCHEDULE PICKUP
              </button>
            </div>

            {activeMode === "arrived" ? (
              <div className="billing-input-card">
                <div className="card-header-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                  <div>
                    <h3>Where should we serve you?</h3>
                    <p>Enter your table number and we'll bring your order.</p>
                  </div>
                </div>

                <div className="input-wrap-bordered">
                  <label>TABLE NUMBER</label>
                  <div className="input-inner">
                    <input type="number" placeholder="08" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                    <svg className="table-icon" width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="#D1C4B5" strokeWidth="1.5">
                      <rect x="15" y="10" width="10" height="4" rx="1"/><path d="M17 14v8M23 14v8"/><rect x="5" y="14" width="6" height="2" rx="1"/><path d="M8 16v6M5 16l-2 6M11 16l2 6"/><rect x="29" y="14" width="6" height="2" rx="1"/><path d="M32 16v6M29 16l-2 6M35 16l2 6"/>
                    </svg>
                  </div>
                </div>

                <div className="card-footer-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                  We'll bring your order directly to your table.
                </div>
              </div>
            ) : (
              <div className="billing-input-card">
                <div className="card-header-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <div>
                    <h3>When will you pick it up?</h3>
                    <p>Select a time so we can have it ready for you.</p>
                  </div>
                </div>

                {isCafeClosed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(211, 47, 47, 0.05)', border: '1px solid rgba(211, 47, 47, 0.2)', borderRadius: '12px', marginTop: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#d32f2f', fontSize: '14px', fontWeight: '700' }}>Cafe is Closed</h4>
                      <p style={{ margin: 0, color: '#c62828', fontSize: '13px', lineHeight: '1.4' }}>We're done brewing for today. Please visit us tomorrow starting at 9:00 AM!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="input-wrap-bordered">
                      <label>ARRIVAL TIME</label>
                      <div className="input-inner" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          min="1" 
                          max="12" 
                          placeholder="12"
                          value={pickH} 
                          onChange={(e) => setPickH(e.target.value)} 
                          style={{ width: '50px', fontSize: '18px', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center' }} 
                        />
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>:</span>
                        <input 
                          type="number" 
                          min="0" 
                          max="59" 
                          placeholder="00"
                          value={pickM} 
                          onChange={(e) => setPickM(e.target.value)} 
                          style={{ width: '50px', fontSize: '18px', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center' }} 
                        />
                        <select 
                          value={pickAmPm} 
                          onChange={(e) => setPickAmPm(e.target.value)}
                          style={{ fontSize: '16px', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 'auto' }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    {timeError && (
                      <div style={{ color: '#d32f2f', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {timeError}
                      </div>
                    )}
                    <div className="card-footer-note" style={{ marginTop: '10px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                      We'll have it hot, fresh, and waiting.
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="billing-input-card">
              <div className="card-header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <div>
                  <h3>Anything for our barista?</h3>
                  <p>Any special requests or instructions?</p>
                </div>
              </div>
              <textarea className="barista-notes" placeholder="E.g. Less sugar, extra hot, no ice..."></textarea>
              <div className="char-count">0/120</div>
            </div>

            <div className="billing-ready-time">
              <div>
                <label>ESTIMATED READY TIME</label>
                <div className="time-val">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  8-10 Minutes
                </div>
              </div>
              <div className="ready-note">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A99681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                <span>We brew fresh,<br/>just for you.</span>
              </div>
            </div>

            <button 
              className="billing-pay-btn" 
              onClick={handlePlaceOrderClick}
              disabled={activeMode === "scheduled" && (isCafeClosed || !!timeError)}
              style={{ opacity: (activeMode === "scheduled" && (isCafeClosed || !!timeError)) ? 0.5 : 1, cursor: (activeMode === "scheduled" && (isCafeClosed || !!timeError)) ? 'not-allowed' : 'pointer' }}
            >
              PAY ₹{itemTotal}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      {showVerifyModal && (
        <div className="auth-modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setShowVerifyModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="auth-header">
              <div className="auth-logo-group">
                <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
              </div>

              <h2 className="auth-title">Verify Account</h2>
              <p className="auth-subtitle">First-time verification needed.</p>
              
              <div className="auth-tree-divider">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V6" />
                    <path d="M7 16l5-3 5 3" />
                    <path d="M8 13l4-3 4 3" />
                    <path d="M9.5 10l2.5-2.5L14.5 10" />
                  </svg>
              </div>
            </div>
            
            <div className="auth-form">
              {!otpSent ? (
                <>
                  <div className="auth-input-group">
                    <label>YOUR NAME</label>
                    <div className="auth-input-wrapper">
                      <svg className="auth-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="auth-input-group">
                    <label>PHONE NUMBER</label>
                    <div className="auth-input-wrapper">
                      <svg className="auth-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <input type="tel" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  <button className="auth-submit-btn" disabled={!name || !phone || isProcessing} onClick={async () => { 
                    setIsProcessing(true);
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setOtpSent(true); 
                        setOtp(""); 
                        window._currentOtp = data.data.demoOtp;
                        alert(`[DEMO ONLY] Your OTP is: ${data.data.demoOtp}`);
                      } else {
                        alert(data.message || "Failed to request OTP");
                      }
                    } catch(err) {
                      alert("Network error");
                    }
                    setIsProcessing(false);
                  }}>
                    SEND VERIFICATION OTP
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="auth-input-group">
                    <label>ENTER 4-DIGIT OTP</label>
                    <div className="auth-input-wrapper">
                      <svg className="auth-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <input type="number" placeholder="Enter OTP (1234)" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    </div>
                  </div>
                  
                  <button className="auth-submit-btn" disabled={otp.length < 6 || isProcessing} onClick={async () => {
                    setIsProcessing(true);
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, phone, otp })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        localStorage.setItem("userToken", data.data.token);
                        localStorage.setItem("userName", data.data.name);
                        localStorage.setItem("userPhone", phone);
                        localStorage.setItem("towncoffee-user", JSON.stringify({ phone, name: data.data.name }));
                        window.dispatchEvent(new Event("auth-change"));
                        setIsVerified(true);
                        setShowVerifyModal(false);
                        handleConfirmPay();
                      } else {
                        alert(data.message || "Invalid OTP");
                      }
                    } catch(err) {
                      alert("Network error");
                    }
                    setIsProcessing(false);
                  }}>
                    {isProcessing ? "VERIFYING..." : "CONFIRM & PROCEED"}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}