import React from "react";
import "./OrderCard.css";

export default function OrderCard({ order, onMove, buttonText, onDelay }) {
  const statusClass = `status-${(order.status || 'inbox').toLowerCase()}`;

  const checkShouldGlow = () => {
    if (order.status !== 'scheduled' || !order.arrivalTime) return false;
    
    const [arrH, arrM] = order.arrivalTime.split(':').map(Number);
    const now = new Date();
    const currH = now.getHours();
    const currM = now.getMinutes();
    
    const arrTotalMins = arrH * 60 + arrM;
    const currTotalMins = currH * 60 + currM;
    
    const diff = arrTotalMins - currTotalMins;
    return diff <= 30 && diff >= -120; 
  };

  const isUrgent = checkShouldGlow();
  
  // Format the items string into an array if possible, or parse it.
  // Assuming the items string from AdminDashboard looks like: "Cappuccino x2 (₹360), Chocolate Cake x1 (₹150)"
  const rawItems = order.items ? order.items.split(', ') : [];
  
  // The actual format in AdminDashboard: `${i.title} x${i.qty} (₹${i.price * i.qty})`
  // We need to split into Name, Qty, Total
  const parsedItems = rawItems.map(itemStr => {
    // Basic regex or string split to extract title, qty, price
    const match = itemStr.match(/(.+) x(\d+) \([^0-9]*(\d+)\)/);
    if (match) {
      return { title: match[1].trim(), qty: match[2], total: match[3] };
    }
    return { title: itemStr, qty: 1, total: 0 }; // Fallback
  });

  const formatTime = (dateString) => {
    if (!dateString) return 'Today, 10:42 AM';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Today, 10:42 AM';
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const displayTime = formatTime(order.createdAt);

  return (
    <div className={`order-card-ui ${statusClass} ${isUrgent ? 'glowing-urgent' : ''}`}>
      <div className="card-header-top">
        <span className="id-tag">#{order.id.slice(-6).toUpperCase()}</span>
        <div className="time-tags" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {order.type === 'scheduled' && (
            <span className="time-tag scheduled-tag" style={{ color: '#b7791f', fontWeight: '700', backgroundColor: '#fefcbf', padding: '2px 6px', borderRadius: '4px' }}>
              Scheduled: {order.arrivalTime}
            </span>
          )}
          <span className="time-tag">{displayTime}</span>
        </div>
      </div>

      <div className="card-customer">
        <svg className="cust-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <div className="cust-info">
          <h4 className="cust-name">{order.customer}</h4>
          <p className="cust-phone">+91 98765 43210</p>
        </div>
      </div>

      <div className="card-items">
        {parsedItems.map((item, idx) => (
          <div className="card-item-row" key={idx}>
            <span className="item-name">{item.title}</span>
            <span className="item-qty">{item.qty} x ₹{Math.round(parseInt(item.total)/parseInt(item.qty)) || 0}</span>
            <span className="item-price">₹{item.total}</span>
          </div>
        ))}
      </div>

      <div className="card-total">
        <span>Total</span>
        <span>₹{order.total}</span>
      </div>

      <div className="card-actions-area">
        {order.status === 'Completed' ? (
          <div className="completed-badge">
            <div className="completed-badge-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Completed
            </div>
            <span>09:45 AM</span>
          </div>
        ) : (
          <button 
            className="move-btn" 
            onClick={onMove}
            disabled={order.processing}
          >
            {order.processing ? 'Updating...' : buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
