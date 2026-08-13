import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Popular.css";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: 1,
    title: "Sustainably Sourced",
    desc: "Ethically sourced beans for a better tomorrow.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
        <circle cx="12" cy="9" r="2.5" />
        <path d="M8.5 6.5 Q10 4 12 3.5" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Crafted with Care",
    desc: "Every cup is crafted with passion and precision.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18" />
        <path d="M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z" />
        <path d="M6 21H18" />
        <path d="M12 17V21" />
        <path d="M7 5 Q8.5 3 10 5" />
        <path d="M11 4 Q12.5 2 14 4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Community First",
    desc: "A space to connect, unwind, and belong.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Made for You",
    desc: "Personalized experiences, made just the way you like.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Popular() {
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([".mtjc-eyebrow", ".mtjc-title", ".mtjc-sep", ".mtjc-sub"], {
        scrollTrigger: { trigger: ".mtjc-header", start: "top 82%", once: true },
        y: 28, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
      });

      gsap.from(".mtjc-card", {
        scrollTrigger: { trigger: ".mtjc-grid", start: "top 80%", once: true },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: "back.out(1.2)",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="popular" className="mtjc-section" ref={sectionRef}>

      <div className="mtjc-inner">
        {/* HEADER */}
        <div className="mtjc-header">
          <h2 className="mtjc-title">More Than Just Coffee</h2>

          {/* Icon separator */}
          <div className="mtjc-sep">
            <span className="mtjc-sep-line" />
            <span className="mtjc-sep-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9c7c5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18" />
                <path d="M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z" />
                <path d="M6 21H18" />
                <path d="M12 17V21" />
              </svg>
            </span>
            <span className="mtjc-sep-line" />
          </div>

          <p className="mtjc-sub">
            Thoughtfully sourced. Beautifully crafted.<br />
            Made to be more than a moment.
          </p>
        </div>

        {/* FEATURE GRID */}
        <div className="mtjc-grid">
          {features.map((feat, i) => (
            <div className="mtjc-card" key={feat.id}>
              <div className="mtjc-card-icon">
                {feat.icon}
              </div>
              <h3 className="mtjc-card-title">{feat.title}</h3>
              <p className="mtjc-card-desc">{feat.desc}</p>
              <div className="mtjc-card-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
