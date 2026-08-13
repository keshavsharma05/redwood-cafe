import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from '../components/OrderCard';
import api from '../services/api';
import '../styles/Dashboard.css';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const optimisticStatusesRef = useRef(new Map());

  const handleLogout = () => {
    localStorage.removeItem("towncoffee-admin-auth");
    localStorage.removeItem("towncoffee-admin-token");
    localStorage.removeItem("towncoffee-admin-name");
    navigate('/login');
  };

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/orders');
      const data = res.data.data || [];

      setOrders(data.map(serverOrder => {
        if (optimisticStatusesRef.current.has(serverOrder._id)) {
          return { ...serverOrder, status: optimisticStatusesRef.current.get(serverOrder._id) };
        }
        return serverOrder;
      }));
    } catch (err) {
      // Handle error silently
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleMove = async (id, nextStatus) => {
    setOrders(prevOrders => prevOrders.map(o => o._id === id ? { ...o, processing: true } : o));
    optimisticStatusesRef.current.set(id, nextStatus);
    setOrders(prevOrders => prevOrders.map(o => o._id === id ? { ...o, status: nextStatus } : o));

    try {
      if (nextStatus === 'Preparing') {
        await api.patch(`/orders/${id}/start-prep`);
      } else {
        await api.patch(`/orders/${id}/status`, { status: nextStatus });
      }
      setTimeout(() => { optimisticStatusesRef.current.delete(id); }, 3000);
    } catch (err) {
      optimisticStatusesRef.current.delete(id);
      fetchOrders();
    } finally {
      setOrders(prevOrders => prevOrders.map(o => o._id === id ? { ...o, processing: false } : o));
    }
  };

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();
    const currH = now.getHours();
    const currM = now.getMinutes();
    const currTotalMins = currH * 60 + currM;

    orders.forEach(o => {
      if (o.orderType === 'scheduled' && (o.status === 'scheduled' || o.status === 'confirmed') && o.arrivalTime) {
        if (optimisticStatusesRef.current.has(o._id)) return;
        
        const [arrH, arrM] = o.arrivalTime.split(':').map(Number);
        const arrTotalMins = arrH * 60 + arrM;
        const diff = arrTotalMins - currTotalMins;

        if (diff < 10 && diff >= -120) {
          handleMove(o._id, 'Inbox');
        }
      }
    });
  }, [orders]);

  const mappedOrders = Array.isArray(orders) ? orders.map(o => ({
    id: o._id,
    customer: o.pickerName || "Guest",
    phone: o.phone || "+91 98765 43210",
    accountName: o.accountName,
    items: (o.items || []).map(i => `${i.title} x${i.qty} (₹${i.price * i.qty})`).join(", "),
    status: o.status === 'Inbox' ? 'inbox' : o.status === 'late' ? 'inbox' : o.status,
    type: o.orderType,
    total: o.total,
    processing: o.processing,
    createdAt: o.createdAt,
    arrivalTime: o.arrivalTime,
  })) : [];

  const scheduledOrders = mappedOrders.filter(o => o.type === 'scheduled' && (o.status === 'scheduled' || o.status === 'confirmed'));
  const inboxOrders = mappedOrders.filter(o => o.status === 'inbox' || o.status === 'late' || (o.status === 'confirmed' && o.type === 'arrived'));
  const preparingOrders = mappedOrders.filter(o => o.status === 'Preparing');
  const readyOrders = mappedOrders.filter(o => o.status === 'Ready');
  const completedOrders = mappedOrders.filter(o => o.status === 'Completed');

  const stats = {
    scheduled: scheduledOrders.length,
    inbox: inboxOrders.length,
    preparing: preparingOrders.length,
    ready: readyOrders.length,
    completed: completedOrders.length,
  };

  return (
    <div className="admin-layout">

      {/* TOP HEADER */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
          </div>
          <div className="topbar-divider" />
          <div className="topbar-title">
            <h1>Order Management</h1>
            <p>Track and manage all customer orders in real-time</p>
          </div>
        </div>

        <div className="topbar-right">
          <button className="order-history-btn" onClick={() => navigate('/order-history')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Order History
          </button>
          <button className="admin-profile-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Hello, Admin
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="admin-main">

        {/* STATS ROW */}
        <div className="admin-stats">
          <div className="stat-card stat-scheduled">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="stat-info">
              <span>Scheduled</span>
              <strong>{stats.scheduled}</strong>
            </div>
          </div>

          <div className="stat-card stat-inbox">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
              </svg>
            </div>
            <div className="stat-info">
              <span>Inbox</span>
              <strong>{stats.inbox}</strong>
            </div>
          </div>

          <div className="stat-card stat-preparing">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div className="stat-info">
              <span>Preparing</span>
              <strong>{stats.preparing}</strong>
            </div>
          </div>

          <div className="stat-card stat-ready">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
              </svg>
            </div>
            <div className="stat-info">
              <span>Ready</span>
              <strong>{stats.ready}</strong>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-info">
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="admin-board">

          {/* SCHEDULED */}
          <div className="board-col col-scheduled">
            <div className="col-header">
              <div className="col-header-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                SCHEDULED
              </div>
              <div className="col-count">{stats.scheduled}</div>
            </div>
            <div className="col-body">
              {scheduledOrders.map(o => (
                <OrderCard key={o.id} order={{ ...o, status: 'scheduled' }} onMove={() => handleMove(o.id, 'Inbox')} buttonText="Start → Inbox" />
              ))}
              {scheduledOrders.length > 3 && (
                <p className="more-orders-text">+ {scheduledOrders.length - 3} more orders</p>
              )}
              {scheduledOrders.length === 0 && !loading && (
                <p className="empty-col-text">No scheduled orders</p>
              )}
            </div>
          </div>

          {/* INBOX */}
          <div className="board-col col-inbox">
            <div className="col-header">
              <div className="col-header-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                </svg>
                INBOX
              </div>
              <div className="col-count">{stats.inbox}</div>
            </div>
            <div className="col-body">
              {inboxOrders.map(o => (
                <OrderCard key={o.id} order={{ ...o, status: 'inbox' }} onMove={() => handleMove(o.id, 'Preparing')} buttonText="Start → Preparing" />
              ))}
              {inboxOrders.length > 3 && (
                <p className="more-orders-text">+ {inboxOrders.length - 3} more orders</p>
              )}
              {inboxOrders.length === 0 && !loading && (
                <p className="empty-col-text">No inbox orders</p>
              )}
            </div>
          </div>

          {/* PREPARING */}
          <div className="board-col col-preparing">
            <div className="col-header">
              <div className="col-header-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
                PREPARING
              </div>
              <div className="col-count">{stats.preparing}</div>
            </div>
            <div className="col-body">
              {preparingOrders.map(o => (
                <OrderCard key={o.id} order={{ ...o, status: 'preparing' }} onMove={() => handleMove(o.id, 'Ready')} buttonText="Start → Ready" />
              ))}
              {preparingOrders.length > 3 && (
                <p className="more-orders-text">+ {preparingOrders.length - 3} more orders</p>
              )}
              {preparingOrders.length === 0 && !loading && (
                <p className="empty-col-text">No orders preparing</p>
              )}
            </div>
          </div>

          {/* READY */}
          <div className="board-col col-ready">
            <div className="col-header">
              <div className="col-header-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                READY
              </div>
              <div className="col-count">{stats.ready}</div>
            </div>
            <div className="col-body">
              {readyOrders.map(o => (
                <OrderCard key={o.id} order={{ ...o, status: 'ready' }} onMove={() => handleMove(o.id, 'Completed')} buttonText="Start → Completed" />
              ))}
              {readyOrders.length > 3 && (
                <p className="more-orders-text">+ {readyOrders.length - 3} more orders</p>
              )}
              {readyOrders.length === 0 && !loading && (
                <p className="empty-col-text">No orders ready</p>
              )}
            </div>
          </div>

          {/* COMPLETED */}
          <div className="board-col col-completed">
            <div className="col-header">
              <div className="col-header-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                COMPLETED
              </div>
              <div className="col-count">{stats.completed}</div>
            </div>
            <div className="col-body">
              {completedOrders.map(o => (
                <OrderCard key={o.id} order={{ ...o, status: 'Completed' }} />
              ))}
              {completedOrders.length > 3 && (
                <p className="more-orders-text">+ {completedOrders.length - 3} more orders</p>
              )}
              {completedOrders.length === 0 && !loading && (
                <p className="empty-col-text">No completed orders</p>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER NOTE */}
        <div className="board-footer-text">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Orders move to the next stage automatically when you click the start button.
        </div>

      </main>
    </div>
  );
}