import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./Orders.css";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("towncoffee-user")) || null;
  const phone = storedUser?.phone;

  useEffect(() => {
    if (!phone) {
      setError("Please sign in to view your orders.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/user/${phone}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const resData = await res.json();
        setOrders(resData.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [phone]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "preparing") return "#ff9800"; // orange
    if (s === "ready") return "#4caf50";    // green
    if (s === "completed") return "#8bc34a"; // light green
    if (s === "scheduled" || s === "confirmed") return "#2196f3"; // blue
    return "#9e9e9e"; // grey
  };

  const getStatusLabel = (status) => {
    const s = status?.toLowerCase();
    if (s === "scheduled" || s === "confirmed") return "Booked";
    return status;
  };

  if (loading) {
    return (
      <div className="orders-page-loading">
        <div className="loader-spin"></div>
        <p>Fetching your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page animation-fade">
      <header className="orders-header">
        <button className="back-btn-premium" onClick={() => navigate("/menu")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        
        <div className="orders-header-logo-wrapper">
          <img 
            className="orders-logo-premium" 
            src="/logo1.png" 
            alt="Redwood CafÃ©" 
            onClick={() => navigate("/")} 
          />
        </div>

        <h1 className="page-title-premium">Orders</h1>
      </header>

      {error ? (
        <div className="orders-error-state">
          <p>{error}</p>
          <button className="order-now-btn-premium" onClick={() => navigate("/menu")}>Go to Menu</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">â˜•</div>
          <h3>No active orders</h3>
          <p>Hungry? Start an order from our menu.</p>
          <button className="order-now-btn-premium" onClick={() => navigate("/menu")}>Browse Menu</button>
        </div>
      ) : (
        <div className="orders-list">
          {(() => {
            const activeOrders = orders.filter(o => o.status?.toLowerCase() !== "completed");
            const completedOrders = orders.filter(o => o.status?.toLowerCase() === "completed");
            
            return (
              <>
                {activeOrders.map((order, index) => (
                  <div 
                    key={order._id} 
                    className="order-card-premium"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => navigate(`/order-status?orderId=${order._id}`)}
                  >
                    <div className="order-card-header">
                      <span className="order-id-short">REF: {order._id.slice(-6).toUpperCase()}</span>
                      <span 
                        className="order-status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-items-preview">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="item-token">{item.qty}x {item.title}</span>
                        ))}
                        {order.items.length > 2 && <span className="item-token-more">+{order.items.length - 2} more</span>}
                      </div>
                      
                      <div className="order-meta-info">
                        <span className="order-total">â‚¹{order.total}</span>
                        {order.orderType === "scheduled" && (
                          <span className="order-timing">ðŸ“… {order.arrivalTime}</span>
                        )}
                        {order.orderType === "arrived" && (
                          <span className="order-timing">ðŸ“ Table {order.tableNumber}</span>
                        )}
                      </div>
                    </div>
                    
                    <span className="view-tracking-link">View Details â†’</span>
                  </div>
                ))}

                {completedOrders.length > 0 && (
                  <>
                    <div className="previous-orders-divider">
                      <span>Previous Orders</span>
                    </div>
                    {completedOrders.map((order, index) => (
                      <div 
                        key={order._id} 
                        className="order-card-premium order-card-completed"
                        style={{ animationDelay: `${(activeOrders.length + index) * 0.05}s` }}
                      >
                        <div className="order-card-header">
                          <span className="order-id-short">REF: {order._id.slice(-6).toUpperCase()}</span>
                          <span 
                            className="order-status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        
                        <div className="order-card-body">
                          <div className="order-items-preview">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="item-token">{item.qty}x {item.title}</span>
                            ))}
                            {order.items.length > 2 && <span className="item-token-more">+{order.items.length - 2} more</span>}
                          </div>
                          
                          <div className="order-meta-info">
                            <span className="order-total">â‚¹{order.total}</span>
                            {order.orderType === "scheduled" && (
                              <span className="order-timing">ðŸ“… {order.arrivalTime}</span>
                            )}
                            {order.orderType === "arrived" && (
                              <span className="order-timing">ðŸ“ Table {order.tableNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
