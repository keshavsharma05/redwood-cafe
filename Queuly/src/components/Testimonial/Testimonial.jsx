import { useState, useEffect, useRef, useCallback } from "react";
import "./Testimonial.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "The kind of place where you forget to check the time.",
    author: "Ananya Sharma",
    role: "Weekend regular",
    location: "Jaipur",
  },
  {
    quote: "Every single visit feels like the first sip of the morning.",
    author: "Rohan Mehta",
    role: "Daily visitor",
    location: "Bangalore",
  },
  {
    quote: "Redwood isn't just a café — it's a feeling you carry home.",
    author: "Priya Nair",
    role: "Coffee enthusiast",
    location: "Mumbai",
  },
  {
    quote: "The warmth here is in the cups and in the people.",
    author: "Arjun Kapoor",
    role: "Remote worker",
    location: "Delhi",
  },
];

export default function Testimonial() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const sectionRef = useRef();
  const quoteRef = useRef();
  const authorRef = useRef();

  const animateOut = useCallback((onDone) => {
    gsap.to([quoteRef.current, authorRef.current], {
      opacity: 0,
      y: dir * -20,
      duration: 0.35,
      ease: "power2.in",
      onComplete: onDone,
    });
  }, [dir]);

  const animateIn = useCallback(() => {
    gsap.fromTo(
      [quoteRef.current, authorRef.current],
      { opacity: 0, y: dir * 30 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.08 }
    );
  }, [dir]);

  const goTo = (index, direction) => {
    if (index === active) return;
    setDir(direction);
    animateOut(() => {
      setActive(index);
    });
  };

  const prev = () => goTo((active - 1 + testimonials.length) % testimonials.length, -1);
  const next = () => goTo((active + 1) % testimonials.length, 1);

  // Animate in whenever active changes
  useEffect(() => {
    animateIn();
  }, [active]);

  // Section entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([".tm-eyebrow-wrap", ".tm-title", ".tm-sub"], {
        scrollTrigger: { trigger: ".tm-header", start: "top 82%", once: true },
        y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
      });
      gsap.from(".tm-nav", {
        scrollTrigger: { trigger: ".tm-nav", start: "top 95%", once: true },
        y: 16, opacity: 0, duration: 0.5, ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const t = testimonials[active];
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section id="testimonials" className="tm-section" ref={sectionRef}>
      {/* Header */}
      <div className="tm-header">
        <div className="tm-eyebrow-wrap">
          <span className="tm-eyebrow-line" />
          <span className="tm-eyebrow-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8H19C20.6569 8 22 9.34315 22 11C22 12.6569 20.6569 14 19 14H18M4 8H18V15C18 16.1046 17.1046 17 16 17H6C4.89543 17 4 16.1046 4 15V8Z"/>
            </svg>
          </span>
          <span className="tm-eyebrow">FROM THE TABLE</span>
          <span className="tm-eyebrow-line" />
        </div>

        <h2 className="tm-title">
          A few words from<br />our guests.
        </h2>
        <p className="tm-sub">The kind worth passing along over coffee.</p>
      </div>

      {/* Quote block */}
      <div className="tm-quote-block">
        <span className="tm-curly tm-curly--open">"</span>

        <div className="tm-quote-inner" ref={quoteRef}>
          <p className="tm-quote-text">{t.quote}</p>
          <div ref={authorRef} className="tm-author-block">
            <div className="tm-author-line" />
            <span className="tm-author-name">{t.author}</span>
            <span className="tm-author-meta">
              <em>{t.role}</em>&nbsp;·&nbsp;{t.location}
            </span>
          </div>
        </div>

        <span className="tm-curly tm-curly--close">"</span>
      </div>

      {/* Navigation */}
      <div className="tm-nav">
        <button className="tm-arrow" onClick={prev} aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="tm-counter-wrap">
          <span className="tm-counter">
            <span className="tm-counter-active">{pad(active + 1)}</span>
            <span className="tm-counter-sep"> / </span>
            <span className="tm-counter-total">{pad(testimonials.length)}</span>
          </span>
          <div className="tm-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`tm-dot${i === active ? " tm-dot--active" : ""}`}
                onClick={() => goTo(i, i > active ? 1 : -1)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button className="tm-arrow" onClick={next} aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
