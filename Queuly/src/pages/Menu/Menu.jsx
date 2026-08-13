import React, { useState, useMemo, useEffect } from "react";
import "./Menu.css";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../config";
import Preloader from "../../components/Preloader/Preloader";

const CATEGORY_META = {
  All: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>, desc: "Our complete culinary collection." },
  Coffee: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 8h1a4 4 0 110 8h-1"/><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>, desc: "Signature coffee, brewed to perfection." },
  Tea: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 8h1a4 4 0 110 8h-1"/><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>, desc: "Artisanal steeped teas and fragrant infusions." },
  Breakfast: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 13.5c-1.5-1.5-2-3.5-1.5-5 1.5-.5 3.5 0 5 1.5M19.5 13.5c1.5-1.5 2-3.5 1.5-5-1.5-.5-3.5 0-5 1.5"/><path d="M12 17c-2.5 0-4.5-1.5-5-3 1.5-1 3-1 5-1s3.5 0 5 1c-.5 1.5-2.5 3-5 3z"/></svg>, desc: "Wholesome start to your beautiful day." },
  Sandwiches: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3"/><path d="M12 19H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-8z"/><path d="m2.39 11.45 8.16-8.15a2 2 0 0 1 2.82 0l8.16 8.15"/></svg>, desc: "Freshly pressed paninis and gourmet sandwiches." },
  Burgers: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h18M3 15h18M5 11c0-3.3 3.1-6 7-6s7 2.7 7 6M5 15c0 2.2 3.1 4 7 4s7-1.8 7-4"/></svg>, desc: "Handcrafted juicy patties with artisanal buns." },
  Desserts: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 2-9.6 10.4A2 2 0 0 0 6 13.8V22h12v-8.2a2 2 0 0 0-.6-1.4L16 2Zm0 0v8"/><path d="M6 16h12"/><path d="M6 12h12"/></svg>, desc: "Decadent sweets and freshly baked treats." },
  "Cold Beverages": { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><path d="M8 22V6M16 22V6"/><path d="M14 6V2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4"/></svg>, desc: "Chilled refreshers and house-made shakes." },
  Pasta: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M4 12a8 8 0 0 0 16 0"/><path d="M8 8V6"/><path d="M12 8V4"/><path d="M16 8V6"/></svg>, desc: "Freshly tossed al dente pasta with rich sauces." },
  Sides: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M4 12a8 8 0 0 0 16 0"/><path d="M8 8V4"/><path d="M12 8V2"/><path d="M16 8V4"/></svg>, desc: "Perfectly crafted sides to complement your meal." }
};

export default function Menu({ onOpenAuth }) {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userToken"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("userToken"));
      setUserName(localStorage.getItem("userName") || "User");
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // Auto-scroll logic for deep linking
  useEffect(() => {
    if (!isLoading && menuItems.length > 0) {
      const params = new URLSearchParams(search);
      const scrollToId = params.get("scrollTo");
      if (scrollToId) {
        setTimeout(() => {
          const element = document.getElementById(scrollToId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 600);
      }
    }
  }, [isLoading, menuItems, search]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // LocalStorage Cart Hydration
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    const savedCart = localStorage.getItem("towncoffee-cart");
    if (savedCart) {
      setQuantities(JSON.parse(savedCart));
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem("towncoffee-cart", JSON.stringify(quantities));
  }, [quantities, hasHydrated]);

  // Fetch Menu from Backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch menu. Please try again.");
        return res.json();
      })
      .then((resData) => {
        const data = Array.isArray(resData.data)
          ? resData.data
          : resData.data?.items || [];
        setMenuItems(data);
        localStorage.setItem("towncoffee-menu", JSON.stringify(data));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Menu fetch error:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const updateQty = (id, delta) => {
    setQuantities((prev) => {
      const currentQty = prev[id] || 0;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        const updatedCart = { ...prev };
        delete updatedCart[id];
        return updatedCart;
      }
      if (!currentQty && newQty === 1) {
        showToast("Added to your order");
      }
      return { ...prev, [id]: newQty };
    });
  };

  // Grouping items by category
  const categoriesList = useMemo(() => {
    const cats = new Set();
    menuItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

  const groupedData = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      const cat = item.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [menuItems]);

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className="menu-error-container">
        <h2>Unable to load menu</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="menu-page" data-hide-global-nav>
      {/* Toast popup */}
      {toast && (
        <div className="toast-minimal">
          <span>✓</span> {toast}
        </div>
      )}

      {/* Menu-specific Navbar */}
      <nav className="mn-nav">
        <div className="mn-nav-logo" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Redwood Cafe" style={{ height: "40px", width: "auto" }} />
        </div>

        <ul className="mn-nav-links">
          <li><button onClick={() => navigate("/")}>Home</button></li>
          <li className="mn-nav-active"><button>Menu</button></li>
          <li><button onClick={() => navigate("/")}>Our Story</button></li>
          <li><button onClick={() => navigate("/")}>The Art</button></li>
          <li><button onClick={() => navigate("/")}>Visit Us</button></li>
        </ul>

        <div className="mn-nav-actions">
          <div className="mn-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b6f52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search for dishes, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="mn-icon-btn" onClick={() => navigate("/billing")} style={{ padding: "8px 0", borderBottom: "2px solid #2c1f14", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c1f14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span style={{ fontSize: "12px", fontWeight: 700, marginLeft: "6px", color: "#2c1f14" }}>Cart ({totalItems})</span>
          </button>
          
          {!isLoggedIn ? (
            <button className="mn-cart-btn" style={{ marginLeft: '12px' }} onClick={onOpenAuth}>
              Sign Up
            </button>
          ) : (
            <div className="profile-card-wrapper" style={{ position: 'relative', marginLeft: '12px' }}>
              <button 
                className="mn-cart-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px' }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#386A41', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>{userName}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="profile-dropdown" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', backgroundColor: '#FFFFFF', border: '1px solid rgba(44,31,20,0.05)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(44,31,20,0.1)', minWidth: '180px', padding: '12px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button style={{ textAlign: 'left', padding: '8px 12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#2c1f14' }} onClick={() => { setProfileDropdownOpen(false); navigate('/orders'); }}>My Orders</button>
                  <button style={{ textAlign: 'left', padding: '8px 12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#2c1f14' }} onClick={() => { setProfileDropdownOpen(false); navigate('/history'); }}>Order History</button>
                  <div style={{ height: '1px', backgroundColor: 'rgba(44,31,20,0.1)', margin: '4px 0' }}></div>
                  <button style={{ textAlign: 'left', padding: '8px 12px', width: '100%', color: '#A53636', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px', fontWeight: 500 }} onClick={() => {
                    localStorage.removeItem('userToken');
                    window.dispatchEvent(new Event('auth-change'));
                    setProfileDropdownOpen(false);
                  }}>Log Out</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="menu-hero-full">
        <div className="menu-hero-content">
          <h1 className="menu-hero-title">Our Menu</h1>
          <p className="menu-hero-subtitle">
            Thoughtfully crafted. Beautifully served.
          </p>
        </div>
      </div>

      <div className="menu-container">

        {/* Category Pills Row */}
        <div className="menu-pills-row">
          {categoriesList.map((cat) => {
            const meta = CATEGORY_META[cat] || { icon: "•" };
            return (
              <button
                key={cat}
                className={`menu-pill ${
                  activeCategory === cat ? "menu-pill--active" : ""
                }`}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat !== "All") {
                    const el = document.getElementById(cat);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span className="pill-icon">{meta.icon}</span>
                <span className="pill-label">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Category Sections */}
        <div className="menu-sections">
          {Object.entries(groupedData).map(([catName, items]) => {
            if (activeCategory !== "All" && activeCategory !== catName) {
              return null;
            }

            const filteredItems = items.filter((item) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                item.title?.toLowerCase().includes(q) ||
                item.desc?.toLowerCase().includes(q)
              );
            });

            if (filteredItems.length === 0) return null;

            const meta = CATEGORY_META[catName] || {
              desc: "Freshly prepared with quality ingredients.",
            };

            return (
              <section key={catName} id={catName} className="menu-cat-section">
                {/* Category Header */}
                <div className="menu-cat-header">
                  <div className="menu-cat-title-row">
                    <h2 className="menu-cat-title">{catName.toUpperCase()}</h2>
                    <span className="menu-wheat-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8b6f52"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2L12 22M12 4L16 8M12 8L8 12M12 12L16 16M12 16L8 20" />
                      </svg>
                    </span>
                  </div>
                  <p className="menu-cat-desc">{meta.desc}</p>
                  <button
                    className="menu-view-all"
                    onClick={() => setActiveCategory(catName)}
                  >
                    View all &rarr;
                  </button>
                </div>

                {/* Split Cards Grid */}
                <div className="menu-grid">
                  {filteredItems.map((item) => {
                    const idKey = item._id || item.itemId || item.id;
                    const qty = quantities[idKey] || 0;

                    return (
                      <div key={idKey} id={idKey} className="menu-card">
                        <div className="menu-card-img">
                          <img src={item.image} alt={item.title} onError={(e) => { e.target.onerror = null; e.target.src = '/bean.png'; }} />
                        </div>
                        <div className="menu-card-body">
                          <h3 className="menu-card-title">{item.title}</h3>
                          <p className="menu-card-desc">
                            {item.desc || "Prepared fresh to order."}
                          </p>

                          <div className="menu-card-footer">
                            <span className="menu-card-price">
                              ₹ {item.price}
                            </span>

                            {qty === 0 ? (
                              <button
                                className="menu-add-btn"
                                onClick={() => updateQty(idKey, 1)}
                              >
                                + Add
                              </button>
                            ) : (
                              <div className="menu-qty-pill">
                                <button onClick={() => updateQty(idKey, -1)}>
                                  −
                                </button>
                                <span>{qty}</span>
                                <button onClick={() => updateQty(idKey, 1)}>
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="menu-floating-cart">
          <div className="floating-cart-info">
            <span className="floating-cart-count">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </span>
            <span className="floating-cart-sub">Selected in cart</span>
          </div>
          <button
            className="floating-cart-btn"
            onClick={() => navigate("/billing")}
          >
            View Cart &rarr;
          </button>
        </div>
      )}
    </div>
  );
}