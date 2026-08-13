import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/OrderHistory.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDateLabel(dateStr) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const d = new Date(dateStr);
  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, today)) return "TODAY";
  if (sameDay(d, yesterday)) return "YESTERDAY";

  return d
    .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupOrdersByDate(orders) {
  const map = {};
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) map[key] = { dateStr: o.createdAt, orders: [] };
    map[key].orders.push(o);
  });
  // Sort descending
  return Object.values(map).sort(
    (a, b) => new Date(b.dateStr) - new Date(a.dateStr)
  );
}

// ─── Order Row ───────────────────────────────────────────────────────────────

function OrderRow({ order }) {
  const items = order.items || [];
  const itemNames = items.map((i) => i.title);
  const itemQtys = items.map((i) => i.qty);

  return (
    <div className="oh-order-row">
      <div className="oh-col oh-col-id">
        <span className="oh-order-id">#{(order._id || "").slice(-6).toUpperCase()}</span>
      </div>
      <div className="oh-col oh-col-customer">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <div>
          <div className="oh-cust-name">{order.pickerName || "Guest"}</div>
          <div className="oh-cust-phone">{order.phone || "+91 98765 43210"}</div>
        </div>
      </div>
      <div className="oh-col oh-col-items">
        <ul className="oh-item-list">
          {itemNames.map((name, i) => (
            <li key={i}>
              <span className="oh-item-name">{name}</span>
              <span className="oh-item-qty">× {itemQtys[i]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="oh-col oh-col-total">
        <span className="oh-total-amt">₹{order.total || 0}</span>
      </div>
      <div className="oh-col oh-col-payment">
        {order.paymentMethod === "cash" ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Cash
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Online
          </>
        )}
      </div>
      <div className="oh-col oh-col-time">{formatTime(order.createdAt)}</div>
      <div className="oh-col oh-col-arrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────────────────────────────

function DateGroup({ group, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const label = formatDateLabel(group.dateStr);
  const fullDate = formatFullDate(group.dateStr);
  const orders = group.orders;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalItems = orders.reduce((s, o) => s + (o.items || []).reduce((q, i) => q + i.qty, 0), 0);
  const visible = showAll ? orders : orders.slice(0, 3);

  return (
    <div className={`oh-date-group ${expanded ? "expanded" : ""}`}>
      <button className="oh-date-header" onClick={() => setExpanded((e) => !e)}>
        <div className="oh-date-header-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="oh-date-label">{label}</span>
          {label !== "TODAY" && label !== "YESTERDAY" && (
            <span className="oh-date-full">{fullDate}</span>
          )}
          {(label === "TODAY" || label === "YESTERDAY") && (
            <span className="oh-date-full">{fullDate}</span>
          )}
        </div>
        <div className="oh-date-header-right">
          <span className="oh-date-meta">{orders.length} Orders</span>
          <span className="oh-meta-dot">•</span>
          <span className="oh-date-meta">{totalItems} Items</span>
          <span className="oh-meta-dot">•</span>
          <span className="oh-date-meta">₹{totalRevenue.toLocaleString("en-IN")} Revenue</span>
          <svg
            className={`oh-chevron ${expanded ? "up" : ""}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="oh-date-body">
          {/* Table head */}
          <div className="oh-table-head">
            <div className="oh-col oh-col-id">Order ID</div>
            <div className="oh-col oh-col-customer">Customer</div>
            <div className="oh-col oh-col-items">Items</div>
            <div className="oh-col oh-col-total">Total Amount</div>
            <div className="oh-col oh-col-payment">Payment</div>
            <div className="oh-col oh-col-time">Time</div>
            <div className="oh-col oh-col-arrow"></div>
          </div>

          {visible.map((o) => (
            <OrderRow key={o._id} order={o} />
          ))}

          {!showAll && orders.length > 3 && (
            <button className="oh-view-all-btn" onClick={() => setShowAll(true)}>
              View all {orders.length} orders
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderHistory() {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const handleLogout = () => {
    localStorage.removeItem("towncoffee-admin-auth");
    localStorage.removeItem("towncoffee-admin-token");
    localStorage.removeItem("towncoffee-admin-name");
    navigate("/login");
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/orders");
        const data = res.data.data || [];
        // Only show completed orders in history
        const completed = data.filter((o) => o.status === "Completed");
        setAllOrders(completed);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Filter
  const filtered = allOrders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (o._id || "").toLowerCase().includes(q) ||
      (o.pickerName || "").toLowerCase().includes(q) ||
      (o.phone || "").includes(q);

    const matchesType =
      orderTypeFilter === "all" || o.orderType === orderTypeFilter;

    const matchesPayment =
      paymentFilter === "all" || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesType && matchesPayment;
  });

  // Stats
  const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0);
  const totalItems = filtered.reduce(
    (s, o) => s + (o.items || []).reduce((q, i) => q + i.qty, 0),
    0
  );
  const avgOrder = filtered.length ? Math.round(totalRevenue / filtered.length) : 0;

  const grouped = groupOrdersByDate(filtered);

  return (
    <div className="oh-layout">
      {/* TOP BAR */}
      <header className="oh-topbar">
        <div className="oh-topbar-left">
          <div className="oh-topbar-logo">
            <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
          </div>
          <div className="oh-topbar-divider" />
          <div className="oh-topbar-title">
            <h1>Order History</h1>
            <p>Review completed orders, revenue and customer purchases</p>
          </div>
        </div>
        <div className="oh-topbar-right">
          <button className="oh-back-btn" onClick={() => navigate("/")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Orders
          </button>
          <button className="oh-history-btn active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Order History
          </button>
          <button className="oh-admin-btn" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Hello, Admin
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="oh-main">
        {/* STAT CARDS */}
        <div className="oh-stats">
          <div className="oh-stat-card oh-stat-orders">
            <div className="oh-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="oh-stat-info">
              <span className="oh-stat-label">Orders Completed</span>
              <strong className="oh-stat-value">{filtered.length}</strong>
              <span className="oh-stat-sub">Today</span>
            </div>
          </div>

          <div className="oh-stat-card oh-stat-revenue">
            <div className="oh-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="oh-stat-info">
              <span className="oh-stat-label">Total Revenue</span>
              <strong className="oh-stat-value">₹{totalRevenue.toLocaleString("en-IN")}</strong>
              <span className="oh-stat-sub">Today</span>
            </div>
          </div>

          <div className="oh-stat-card oh-stat-items">
            <div className="oh-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <div className="oh-stat-info">
              <span className="oh-stat-label">Items Sold</span>
              <strong className="oh-stat-value">{totalItems}</strong>
              <span className="oh-stat-sub">Today</span>
            </div>
          </div>

          <div className="oh-stat-card oh-stat-avg">
            <div className="oh-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="oh-stat-info">
              <span className="oh-stat-label">Average Order Value</span>
              <strong className="oh-stat-value">₹{avgOrder}</strong>
              <span className="oh-stat-sub">Today</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="oh-filter-bar">
          <div className="oh-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="oh-search"
              type="text"
              placeholder="Search by order ID, customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="oh-filter-group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="oh-filter-label">Today, 10 Aug 2026</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <select
            className="oh-filter-select"
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
          >
            <option value="all">All Order Types</option>
            <option value="arrived">Walk-in</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <select
            className="oh-filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment Methods</option>
            <option value="online">Online</option>
            <option value="cash">Cash</option>
          </select>

          <button className="oh-export-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>

        {/* ORDER GROUPS */}
        <div className="oh-groups-wrap">
          {loading ? (
            <div className="oh-loading">Loading order history…</div>
          ) : grouped.length === 0 ? (
            <div className="oh-empty">No completed orders found.</div>
          ) : (
            grouped.map((group, i) => (
              <DateGroup key={i} group={group} defaultExpanded={i === 0} />
            ))
          )}
        </div>

        {/* BRANDED FOOTER */}
        <footer className="oh-footer">
          <div className="oh-footer-wrap">
            <div className="oh-footer-line" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-4" /><path d="M12 18 8 13h3L8 7h3l1-4 1 4h3l-3 6h3l-4 5z" />
            </svg>
            <div className="oh-footer-line" />
          </div>
          <p>Great coffee. Great moments.</p>
        </footer>
      </main>
    </div>
  );
}
