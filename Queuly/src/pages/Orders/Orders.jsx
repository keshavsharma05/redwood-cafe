import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./Orders.css";

const ACTIVE_STATUSES = ["scheduled", "confirmed", "inbox", "preparing", "ready"];

export default function Orders() {
  const navigate = useNavigate();
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
        const token = localStorage.getItem("userToken");
        const res = await fetch(`${API_BASE_URL}/api/orders/user/${phone}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
          if (res.status === 403) throw new Error("You do not have permission to view these orders.");
          throw new Error("Failed to fetch orders");
        }
        const resData = await res.json();
        const allOrders = resData.data || [];
        
        const sortedOrders = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const activeOrder = sortedOrders.find(o => ACTIVE_STATUSES.includes((o.status || "").toLowerCase()));

        if (activeOrder) {
          navigate(`/order-status?orderId=${activeOrder._id}`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (err.message.includes("session")) {
          alert(err.message);
          localStorage.removeItem("userToken");
          localStorage.removeItem("towncoffee-user");
          navigate("/menu");
        } else {
          setError(err.message || "Unable to load orders. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [phone, navigate]);

  if (loading) {
    return (
      <div className="orders-page-loading">
        <div className="loader-spin"></div>
        <p>Checking active orders...</p>
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
            alt="Redwood Café" 
            onClick={() => navigate("/")} 
          />
        </div>

        <h1 className="page-title-premium">My Orders</h1>
      </header>

      {error ? (
        <div className="orders-error-state">
          <p>{error}</p>
          <button className="order-now-btn-premium" onClick={() => navigate("/menu")}>Go to Menu</button>
        </div>
      ) : (
        <div className="orders-empty-state">
          <div className="empty-icon">☕</div>
          <h3>No active orders</h3>
          <p>Your next coffee is waiting to happen.</p>
          <button className="order-now-btn-premium" onClick={() => navigate("/menu")}>Browse Menu</button>
        </div>
      )}
    </div>
  );
}
