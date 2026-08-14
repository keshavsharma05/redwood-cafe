import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./OrderStatus.css";

export default function OrderStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDisplayStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === "scheduled" || s === "confirmed") return "Booked";
    if (s === "inbox") return "Confirmed";
    if (s === "preparing") return "Preparing";
    if (s === "ready") return "Ready";
    if (s === "completed") return "Completed";
    return status;
  };

  const fetchOrder = React.useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
        if (res.status === 404) throw new Error("Order not found.");
        throw new Error("Unable to retrieve order details.");
      }
      const resData = await res.json();
      
      setOrder(resData.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch order", err);
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided.");
      setLoading(false);
      return;
    }
    fetchOrder(true);
    const intervalId = setInterval(() => {
      fetchOrder();
    }, 7000);
    return () => clearInterval(intervalId);
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (order && getDisplayStatus(order.status) === "Completed") {
      const timer = setTimeout(() => {
        navigate("/menu");
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [order, navigate]);

  const getStep = (status) => {
    if (status === "Confirmed") return 2;
    if (status === "Preparing") return 3;
    if (status === "Ready" || status === "Completed") return 4;
    return 1; // Booked
  };

  if (loading) {
    return (
      <div className="status-page-loader">
        <div className="spinner-premium"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="status-page error-state">
        <div className="error-card">
          <h2>Order Not Found</h2>
          <p>{error || "We couldn't find the order you're looking for."}</p>
          <button className="back-home-btn" onClick={() => navigate("/menu")}>Back to Menu</button>
        </div>
      </div>
    );
  }

  const displayStatus = getDisplayStatus(order.status);
  const step = getStep(displayStatus);

  if (displayStatus === "Completed") {
    return (
      <div className="order-completed-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f5f0', textAlign: 'center', padding: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div style={{ width: '90px', height: '90px', background: '#e3e6d5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e5339" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          {/* Sparkles */}
          <svg style={{ position: 'absolute', top: '10px', left: '-20px' }} width="16" height="16" viewBox="0 0 24 24" fill="#c3c8b4"><path d="M12 2L14 9l7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>
          <svg style={{ position: 'absolute', top: '30px', right: '-25px' }} width="20" height="20" viewBox="0 0 24 24" fill="#c3c8b4"><path d="M12 2L14 9l7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>
          <svg style={{ position: 'absolute', bottom: '0px', left: '-10px' }} width="10" height="10" viewBox="0 0 24 24" fill="#c3c8b4"><circle cx="12" cy="12" r="10"/></svg>
          <svg style={{ position: 'absolute', bottom: '15px', right: '-10px' }} width="10" height="10" viewBox="0 0 24 24" fill="#c3c8b4"><path d="M12 2L14 9l7 2-7 2-2 7-2-7-7-2 7-2z"/></svg>
        </div>
        
        <h1 style={{ fontSize: '36px', color: '#163316', margin: '15px 0 10px', fontFamily: 'Georgia, serif', fontWeight: '500' }}>Order Completed!</h1>
        <p style={{ fontSize: '15px', color: '#5a5a5a', maxWidth: '300px', lineHeight: '1.5', margin: '0 0 40px 0' }}>Thank you! Your order has been placed successfully.</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px' }}>
          <div style={{ height: '1px', width: '50px', background: '#d5d0c8' }}></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#949f87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          <div style={{ height: '1px', width: '50px', background: '#d5d0c8' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.85 }}>
          <img src="/logo.png" alt="Redwood Cafe" style={{ height: "100px", width: "auto" }} />
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharges = 40;
  const taxes = Math.round(subtotal * 0.05);
  const totalAmount = order.total || (subtotal + deliveryCharges + taxes);

  // Format date nicely
  const orderDate = new Date(order.createdAt || Date.now());
  const dateStr = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="order-status-page">
      <div className="status-main-container">
        
        {/* LEFT CARD - Order Status */}
        <div className="status-left-card">
          <div className="status-top-section">
            <div className="status-title-group">
              <div className="status-check-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="status-title-texts">
                <h2>{displayStatus === "Booked" ? "Order Received!" : "Order Confirmed!"}</h2>
                <p>Thank you for ordering with Redwood Café.<br/>We've received your order and it's being prepared.</p>
              </div>
            </div>
            
            <div className="status-id-group">
              <div className="order-id-box">
                <span className="label">Order ID</span>
                <span className="value">RC{orderId.slice(-8).toUpperCase()}</span>
              </div>
              <div className="order-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {dateStr}, {timeStr}
              </div>
            </div>
          </div>

          <div className="status-divider"></div>

          <h3 className="section-heading">Order Status</h3>
          
          <div className="status-stepper">
            <div className={`step-node ${step >= 1 ? 'completed' : ''}`}>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <span className="step-label">Booked</span>
              <span className="step-time">{timeStr}</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'solid' : 'dashed'}`}></div>
            
            <div className={`step-node ${step >= 2 ? 'completed' : 'pending'}`}>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span className="step-label">Confirmed</span>
              <span className="step-time">{step >= 2 ? "In Progress" : "Pending"}</span>
            </div>
            <div className={`step-line ${step >= 3 ? 'solid' : 'dashed'}`}></div>
            
            <div className={`step-node ${step >= 3 ? 'completed' : 'pending'}`}>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
              </div>
              <span className="step-label">Prepared</span>
              <span className="step-time">{step >= 3 ? "In Progress" : "Pending"}</span>
            </div>
            <div className={`step-line ${step >= 4 ? 'solid' : 'dashed'}`}></div>
            
            <div className={`step-node ${step >= 4 ? 'completed' : 'pending'}`}>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 22h12"/><path d="M2 17h20"/><path d="M12 2v2"/><path d="M4 17a8 8 0 0 1 16 0"/></svg>
              </div>
              <span className="step-label">Ready</span>
              <span className="step-time">{step >= 4 ? "Done" : "Pending"}</span>
            </div>
          </div>

          <div className="status-notification-box">
             <div className="bell-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             </div>
             <div className="notification-texts">
               <strong>We'll notify you when your order is ready!</strong>
               <p>You can check the status anytime from your orders.</p>
             </div>
          </div>
        </div>

        {/* RIGHT CARD - Order Details & Info */}
        <div className="status-right-card">
          <div className="order-details-pane">
            <h3 className="section-heading">Order Details</h3>
            
            <div className="details-table-header">
              <span className="col-item">Item</span>
              <span className="col-qty">Qty</span>
              <span className="col-price">Price</span>
            </div>
            
            <div className="details-items-list">
              {order.items.map((item, idx) => (
                <div className="details-item-row" key={idx}>
                  <div className="col-item">
                    <img src={item.image || "/coffee-cup.png"} alt={item.title} />
                    <span>{item.title}</span>
                  </div>
                  <span className="col-qty">{item.qty}</span>
                  <span className="col-price">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="details-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="total-row">
                <span>Delivery Charges</span>
                <span>₹{deliveryCharges}</span>
              </div>
              <div className="total-row">
                <span>Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
            </div>

            <div className="grand-total-row">
              <span>Total Amount</span>
              <span className="grand-val">₹{totalAmount}</span>
            </div>
          </div>

          <div className="delivery-info-pane">
            <h4 className="info-heading">Delivery Information</h4>
            
            <div className="info-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <div>
                <span className="info-label">Order Type</span>
                <span className="info-val">{order.orderType === 'arrived' ? 'Dine-In' : 'Scheduled Pickup'}</span>
              </div>
            </div>
            
            <div className="info-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <span className="info-label">{order.orderType === 'arrived' ? 'Table Number' : 'Pickup Store'}</span>
                <span className="info-val">
                  {order.orderType === 'arrived' ? order.tableNumber : '21, Park Street,\nC-Scheme, Jaipur,\nRajasthan 302001'}
                </span>
              </div>
            </div>

            <div className="info-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <div>
                <span className="info-label">Contact Number</span>
                <span className="info-val">+91 {order.accountPhone || '98765 43210'}</span>
              </div>
            </div>

            <div className="info-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <div>
                <span className="info-label">Payment Method</span>
                <span className="info-val">Online Payment</span>
              </div>
            </div>

            <div className="info-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <span className="info-label">Estimated Ready Time</span>
                <span className="info-val">{order.orderType === 'scheduled' ? order.arrivalTime : '10-15 min'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="status-page-footer">
        <button className="back-home-btn" onClick={() => navigate("/menu")}>BACK TO MENU</button>
      </div>
    </div>
  );
}