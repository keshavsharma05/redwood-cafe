import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import Preloader from "../../components/Preloader/Preloader";
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
    return <Preloader />;
  }

  return (
    <div className="orders-page animation-fade">
      <div className="orders-page-header">
        <h1 className="orders-page-title">My Orders</h1>
        <p className="orders-page-subtitle">Track your current order or place a new one.</p>
      </div>

      {error ? (
        <div className="orders-error-state">
          <p>{error}</p>
          <button className="orders-browse-btn" onClick={() => navigate("/menu")}>Go to Menu</button>
        </div>
      ) : (
        <div className="orders-empty-state-card">
          <img src="/cup.png" alt="Coffee Cup" className="orders-empty-icon" />
          <h2 className="orders-empty-title">No active orders</h2>
          <p className="orders-empty-text">
            You don't have an active order right now.<br/>
            Your next favorite might be waiting on the menu.
          </p>
          <button className="orders-browse-btn" onClick={() => navigate("/menu")}>
            Browse Menu <span>→</span>
          </button>
        </div>
      )}

      <footer className="orders-footer">
        <div className="orders-footer-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22v-4"/><path d="M12 18 8 13h3L8 7h3l1-4 1 4h3l-3 6h3l-4 5z"/>
          </svg>
        </div>
        <p>Thanks for choosing Redwood Cafe.<br/>We hope to serve you again soon!</p>
      </footer>
    </div>
  );
}
