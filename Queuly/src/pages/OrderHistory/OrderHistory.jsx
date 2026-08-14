import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./OrderHistory.css";
import "../../components/AuthModal/AuthModal.css";

/* ── helpers ─────────────────────────────────────── */

function fmtDate(d) {
  const dt = new Date(d);
  return {
    day: dt.getDate().toString().padStart(2, "0"),
    mon: dt.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    time: dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    full: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    monthYear: dt.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase(),
  };
}

function groupByMonth(orders) {
  const map = {};
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
    if (!map[key]) map[key] = { label, ts: d, orders: [] };
    map[key].orders.push(o);
  });
  return Object.values(map).sort((a, b) => b.ts - a.ts);
}

function computeStats(orders) {
  const total = orders.length;
  const spent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const itemCount = {};
  orders.forEach((o) =>
    (o.items || []).forEach((i) => {
      itemCount[i.title] = (itemCount[i.title] || 0) + i.qty;
    })
  );
  const favItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const earliest = orders.length
    ? new Date(Math.min(...orders.map((o) => new Date(o.createdAt)))).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";
  return { total, spent, favItem, memberSince: earliest };
}

/* ── StatusBadge ─────────────────────────────────── */

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const icon = s === "completed" ? "✓" : s === "cancelled" ? "✕" : "●";
  return (
    <span className={`oh-badge oh-badge--${s}`}>
      <span className="oh-badge-icon">{icon}</span>
      {status}
    </span>
  );
}

/* ── Icons ───────────────────────────────────────── */

function IconTree() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-4"/><path d="M12 18 8 13h3L8 7h3l1-4 1 4h3l-3 6h3l-4 5z"/>
    </svg>
  );
}

function IconOrders() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconRupee() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconCup() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/* ── OrderCard ───────────────────────────────────── */

function OrderCard({ order, onView }) {
  const { day, mon, time } = fmtDate(order.createdAt);
  const id = `#RC${(order._id || "").slice(-8).toUpperCase()}`;
  const items = order.items || [];
  const firstImg = items.find((i) => i.image)?.image;
  const s = (order.status || "").toLowerCase();
  const payLabel = s === "cancelled" ? "Cancelled" : order.paymentMethod === "cash" ? "Cash" : "Paid Online";

  return (
    <div className={`oh-card ${s === "cancelled" ? "oh-card--cancelled" : ""}`}>
      {/* date column */}
      <div className="oh-card__date">
        <span className="oh-card__day">{day}</span>
        <span className="oh-card__mon">{mon}</span>
        <span className="oh-card__time">{time}</span>
      </div>

      {/* thumbnail */}
      <div className="oh-card__thumb">
        {firstImg ? (
          <img src={`${firstImg}?w=120&h=120&fit=crop&auto=format`} alt="" />
        ) : (
          <div className="oh-card__thumb-ph">☕</div>
        )}
      </div>

      {/* info */}
      <div className="oh-card__info">
        <span className="oh-card__id">{id}</span>
        {items.map((it, i) => (
          <span key={i} className="oh-card__item">
            {it.title} {it.qty > 1 ? `× ${it.qty}` : ""}
          </span>
        ))}
      </div>

      {/* status + payment */}
      <div className="oh-card__mid">
        <StatusBadge status={order.status} />
        <span className="oh-card__pay">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          {payLabel}
        </span>
      </div>

      {/* total */}
      <span className="oh-card__total">₹{order.total}</span>

      {/* action */}
      <button className="oh-card__btn" onClick={() => onView(order)}>
        View Details <span className="oh-card__arrow">→</span>
      </button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────── */

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("towncoffee-user")) || null;
  const name = storedUser?.name || "User";

  // Pre-calculate cart count for Navbar
  const quantities = JSON.parse(localStorage.getItem("towncoffee-cart")) || {};
  const cartCount = Object.keys(quantities).length;

  useEffect(() => {
    if (!storedUser?.phone) { navigate("/menu"); return; }
    const token = localStorage.getItem("userToken");
    fetch(`${API_BASE_URL}/api/orders/user/${storedUser.phone}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 401) throw new Error("Your session has expired. Please sign in again.");
          throw new Error("Failed to fetch");
        }
        return r.json();
      })
      .then((d) => {
        const sorted = (d.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        if (sorted.length > 0) setSelected(sorted[0]);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.message.includes("session")) {
          alert(err.message);
          localStorage.removeItem("userToken");
          localStorage.removeItem("towncoffee-user");
          navigate("/menu");
        }
      });
  }, [navigate]);

  /* filters */
  const tabbed = useMemo(() => orders.filter((o) => {
    if (tab === "completed") return (o.status || "").toLowerCase() === "completed";
    if (tab === "cancelled") return (o.status || "").toLowerCase() === "cancelled";
    return true;
  }), [orders, tab]);

  const now = new Date();
  const filtered = useMemo(() => tabbed.filter((o) => {
    if (timeFilter === "all") return true;
    const d = new Date(o.createdAt);
    if (timeFilter === "today") return d.toDateString() === now.toDateString();
    if (timeFilter === "week") return (now - d) < 7 * 864e5;
    if (timeFilter === "month") return (now - d) < 30 * 864e5;
    return true;
  }), [tabbed, timeFilter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);
  const stats = useMemo(() => computeStats(orders), [orders]);

  const counts = useMemo(() => ({
    all: orders.length,
    completed: orders.filter((o) => (o.status || "").toLowerCase() === "completed").length,
    cancelled: orders.filter((o) => (o.status || "").toLowerCase() === "cancelled").length,
  }), [orders]);

  if (loading) {
    return <div className="oh-loader"><div className="oh-spinner" /><p>Retrieving your orders…</p></div>;
  }

  return (
    <div className="oh-page">
      {/* ── SPLIT LAYOUT ── */}
      <div className="oh-split-container">
        
        {/* LEFT COLUMN: LIST */}
        <main className="oh-main-col">
          {/* ── title ── */}
          <div className="oh-title-row">
            <h1 className="oh-title">Order History <span className="oh-title-icon"><IconTree /></span></h1>
            <p className="oh-subtitle">Track your past orders and relive your favorite moments.</p>
          </div>

          {/* ── tabs + filter ── */}
          <div className="oh-controls">
            <div className="oh-tabs">
              {[["all","All Orders"],["completed","Completed"],["cancelled","Cancelled"]].map(([k,l])=>(
                <button key={k} className={`oh-tab ${tab===k?"active":""}`} onClick={()=>{setTab(k);}}>
                  {l} <span className="oh-tab__count">{counts[k]}</span>
                </button>
              ))}
            </div>
            <div className="oh-time-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <select className="oh-time-sel" value={timeFilter} onChange={(e)=>setTimeFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* ── stats ── */}
          <div className="oh-stats">
            <div className="oh-stat">
              <div className="oh-stat__icon"><IconOrders /></div>
              <div><span className="oh-stat__label">Total Orders</span><strong className="oh-stat__val">{stats.total}</strong></div>
            </div>
            <div className="oh-stat">
              <div className="oh-stat__icon"><IconRupee /></div>
              <div><span className="oh-stat__label">Total Spent</span><strong className="oh-stat__val">₹{stats.spent.toLocaleString("en-IN")}</strong></div>
            </div>
            <div className="oh-stat">
              <div className="oh-stat__icon"><IconCup /></div>
              <div><span className="oh-stat__label">Favorite Item</span><strong className="oh-stat__val">{stats.favItem}</strong></div>
            </div>
            <div className="oh-stat">
              <div className="oh-stat__icon"><IconCalendar /></div>
              <div><span className="oh-stat__label">Member Since</span><strong className="oh-stat__val">{stats.memberSince}</strong></div>
            </div>
          </div>

          {/* ── order list ── */}
          {filtered.length === 0 ? (
            <div className="oh-empty">
              <span className="oh-empty__icon">📋</span>
              <h2>No orders found</h2>
              <p>Your Redwood Cafe moments will appear here.</p>
              <button className="oh-empty__btn" onClick={() => navigate("/menu")}>Explore Menu</button>
            </div>
          ) : (
            grouped.map((g) => (
              <div key={g.label} className="oh-group">
                <div className="oh-group__label">{g.label}</div>
                {g.orders.map((o) => (
                  <OrderCard key={o._id} order={o} onView={setSelected} />
                ))}
              </div>
            ))
          )}

          {/* ── footer ── */}
          <footer className="oh-footer">
            <span className="oh-footer__tree"><IconTree /></span>
            <p>That's all for now!<br/>We hope to serve you again soon.</p>
            <span className="oh-footer__heart">♡</span>
          </footer>
        </main>

        {/* RIGHT COLUMN: DETAIL PANEL */}
        {selected ? (
          <aside className="oh-detail-col">
            <div className="oh-detail-card">
              <button className="oh-detail__close" onClick={() => setSelected(null)}>✕</button>

              <h3 className="oh-detail__title">ORDER #RC{(selected._id || "").slice(-8).toUpperCase()}</h3>
              <StatusBadge status={selected.status} />
              <p className="oh-detail__date">{fmtDate(selected.createdAt).full} - {fmtDate(selected.createdAt).time}</p>

              <h4 className="oh-detail__section">ITEMS</h4>
              {(selected.items || []).map((it, i) => (
                <div key={i} className="oh-detail__item">
                  {it.image ? (
                    <img src={`${it.image}?w=80&h=80&fit=crop&auto=format`} alt="" />
                  ) : (
                    <div className="oh-detail__item-ph">☕</div>
                  )}
                  <div className="oh-detail__item-info">
                    <span>{it.title}</span>
                    <span className="oh-detail__item-qty">Qty: {it.qty}</span>
                  </div>
                  <span className="oh-detail__item-price">₹{it.price * it.qty}</span>
                </div>
              ))}

              <div className="oh-detail__totals">
                <div><span>Subtotal</span><span>₹{selected.items?.reduce((s, i) => s + i.price * i.qty, 0)}</span></div>
                <div><span>Taxes</span><span>₹{Math.round((selected.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0) * 0.05)}</span></div>
                <div className="oh-detail__grand">
                  <span>Total</span>
                  <span>₹{selected.items?.reduce((s, i) => s + i.price * i.qty, 0) + Math.round((selected.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0) * 0.05)}</span>
                </div>
              </div>

              <h4 className="oh-detail__section">PAYMENT METHOD</h4>
              <div className="oh-detail__pay-row">
                <div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  <span>{selected.paymentMethod === "cash" ? "Cash" : "Paid Online"}</span>
                  {selected.paymentMethod !== "cash" && <span className="oh-detail__pay-sub">UPI • **** 2324</span>}
                </div>
                <span className="oh-badge oh-badge--completed" style={{fontSize:"10px", padding:"2px 8px"}}>Paid</span>
              </div>

              <h4 className="oh-detail__section">ORDER TYPE</h4>
              <div className="oh-detail__type-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <div>
                  <span>{selected.orderType === "arrived" ? "Walk-in" : "Scheduled"}</span>
                  <span className="oh-detail__type-sub">
                    {selected.orderType === "arrived" ? `Table ${selected.tableNumber || "—"}` : selected.arrivalTime || "—"}
                  </span>
                </div>
              </div>

              <button className="oh-detail__reorder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-2.02"/></svg>
                Order Again
              </button>
              <button className="oh-detail__help">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Need Help?
              </button>
            </div>
          </aside>
        ) : (
          <aside className="oh-detail-col">
             {/* empty state placeholder for right column if needed */}
          </aside>
        )}

      </div>
    </div>
  );
}
