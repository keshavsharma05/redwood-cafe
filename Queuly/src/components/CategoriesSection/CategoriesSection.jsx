import "./CategoriesSection.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    image: "/menu/cappuccino.webp",
    alt: "Hot Coffee",
    label: "Hot Coffee",
    sub: "Smooth espresso blended with steamed milk and a hint of vanilla.",
    price: "from ₹180",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z"/>
        <path d="M6 21H18"/><path d="M12 17V21"/>
      </svg>
    ),
  },
  {
    image: "/menu/cold-coffee.webp",
    alt: "Cold Drinks",
    label: "Cold Drinks",
    sub: "Refreshing iced teas, frappes, and coolers for every season.",
    price: "from ₹160",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3H17L19 21H5L7 3Z"/>
        <path d="M6 10H18"/>
      </svg>
    ),
  },
  {
    image: "/menu/grilled-sandwich.webp",
    alt: "Bites & Food",
    label: "Bites & Food",
    sub: "Grilled sandwiches, fresh pastries, and light snacks to savour.",
    price: "from ₹220",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="2" rx="1"/>
        <path d="M3 6c0 0 2 2 9 2s9-2 9-2"/>
        <path d="M3 17c0 0 2-2 9-2s9 2 9 2"/>
        <path d="M3 20h18"/>
      </svg>
    ),
  },
  {
    image: "/menu/brownie.webp",
    alt: "Desserts",
    label: "Desserts",
    sub: "Rich, moist brownies, cakes, and sweet treats crafted daily.",
    price: "from ₹190",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    image: "/menu/alfredo-pasta.webp",
    alt: "Chef Specials",
    label: "Chef Specials",
    sub: "Seasonal signatures and curated chef picks you won't find elsewhere.",
    price: "from ₹280",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([".cat-eyebrow", ".cat-title", ".cat-icon-sep", ".cat-sub"], {
        scrollTrigger: { trigger: ".cat-header", start: "top 85%", once: true },
        y: 24, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      });
      gsap.from(".cat-card", {
        scrollTrigger: { trigger: ".cat-grid", start: "top 80%", once: true },
        y: 50, opacity: 0, scale: 0.94, duration: 0.9,
        stagger: 0.12, ease: "back.out(1.2)",
      });
      gsap.from(".cat-img-wrap img", {
        scrollTrigger: { trigger: ".cat-grid", start: "top 80%", once: true },
        scale: 1.14, duration: 1.3, ease: "power2.out", stagger: 0.12,
      });
      gsap.from(".cat-footer-link", {
        scrollTrigger: { trigger: ".cat-footer", start: "top 95%", once: true },
        y: 18, opacity: 0, duration: 0.6, ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="categories" className="cat-section" ref={sectionRef}>
      <div className="cat-container">


        {/* Header — centered */}
        <div className="cat-header">
          <span className="cat-eyebrow">Our Collection</span>
          <h2 className="cat-title">Explore the Varieties</h2>
          <div className="cat-icon-sep">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b6f52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z"/>
            </svg>
          </div>
          <p className="cat-sub">
            Handcrafted favorites, made with love<br />and the finest ingredients.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="cat-grid">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="cat-card"
              onClick={() => navigate("/menu")}
            >
              {/* Full-bleed image */}
              <div className="cat-img-wrap">
                <img src={cat.image} alt={cat.alt} />
              </div>

              {/* Gradient overlay */}
              <div className="cat-overlay" />

              {/* Icon chip */}
              <div className="cat-chip">{cat.icon}</div>

              {/* Text content */}
              <div className="cat-content">
                <h3 className="cat-name">{cat.label}</h3>
                <p className="cat-desc">{cat.sub}</p>
                <div className="cat-footer-row">
                  <span className="cat-price">{cat.price}</span>
                  <button className="cat-arrow-btn" aria-label={`Explore ${cat.label}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12H19M13 6l6 6-6 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="cat-footer">
          <a
            href="/menu"
            className="cat-footer-link"
            onClick={(e) => { e.preventDefault(); navigate("/menu"); }}
          >
            View Full Menu
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12H19M13 6l6 6-6 6"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}