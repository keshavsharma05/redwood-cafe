import "./PreOrder.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Walk In",
    desc: "Step into our space and find your perfect spot.",
    img: "/interior.png",
    alt: "Café interior",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Order from Phone",
    desc: "Scan the QR code, explore the menu and place your order effortlessly.",
    img: "/process-2.png",
    alt: "Ordering from phone",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Freshly Prepared",
    desc: "Our baristas prepare your order with care, using the finest ingredients.",
    img: "/process-3.png",
    alt: "Barista preparing coffee",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z" />
        <path d="M6 21H18" /><path d="M12 17V21" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Enjoy",
    desc: "We'll bring it to you. Sit back, relax and enjoy every sip.",
    img: "/process-4.png",
    alt: "Enjoying coffee",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

const tabs = [
  {
    key: "cafe",
    label: "At The Café",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z" />
      </svg>
    ),
  },
  {
    key: "pickup",
    label: "Pre-Order & Pickup",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
];

export default function PreOrder() {
  const navigate = useNavigate();
  const sectionRef = useRef();
  const [activeTab, setActiveTab] = useState("cafe");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([".po-eyebrow", ".po-title", ".po-icon-sep", ".po-tabs"], {
        scrollTrigger: { trigger: ".po-header", start: "top 85%" },
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
      });
      gsap.from(".po-step", {
        scrollTrigger: { trigger: ".po-grid", start: "top 80%" },
        y: 50, opacity: 0, duration: 0.9,
        stagger: 0.14, ease: "back.out(1.2)",
      });
      gsap.from(".po-img img", {
        scrollTrigger: { trigger: ".po-grid", start: "top 80%" },
        scale: 1.12, duration: 1.2, ease: "power2.out", stagger: 0.14,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="preorder" className="po-section" ref={sectionRef}>
      <div className="po-inner">

        {/* HEADER */}
        <div className="po-header">
          <span className="po-eyebrow">HOW IT WORKS</span>
          <h2 className="po-title">Your Coffee, Your Way</h2>
          <div className="po-icon-sep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b6f52" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z" />
            </svg>
          </div>

          {/* Tabs */}
          <div className="po-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`po-tab${activeTab === tab.key ? " po-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-STEP GRID */}
        <div className="po-grid">
          {steps.map((step, i) => (
            <div className="po-step" key={step.num}>

              {/* Photo */}
              <div className="po-img">
                <img src={step.img} alt={step.alt} />
              </div>

              {/* Step number badge — outside overflow:hidden image */}
              <div className="po-badge">{step.num}</div>

              {/* Content */}
              <div className="po-content">
                <div className="po-step-icon">{step.icon}</div>
                <h3 className="po-step-title">{step.title}</h3>
                <p className="po-step-desc">{step.desc}</p>
                <div className="po-step-line" />
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}