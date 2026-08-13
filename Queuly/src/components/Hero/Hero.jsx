import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import heroBg from "./hero.png";
import cupImg from "./cup.png";
import spoonImg from "./spoon.png";
import cubesImg from "./cubes.png";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const navRef = useRef(null);
  const wordRef = useRef(null);
  const cupRef = useRef(null);
  const spoonRef = useRef(null);
  const cubesRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const bottomRef = useRef(null);


  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(wordRef.current, { opacity: 0, filter: "blur(20px)", scale: 0.95, duration: 1.4 })
        .from(spoonRef.current, { x: -140, opacity: 0, rotate: 10, duration: 1.2 }, "-=1.0")
        .from(cubesRef.current, { x: 140, opacity: 0, rotate: 30, duration: 1.2 }, "-=1.1")
        .from(cupRef.current, { y: 80, opacity: 0, duration: 1.3 }, "-=1.0")
        .from(leftPanelRef.current, { opacity: 0, x: -20, duration: 0.9 }, "-=0.7")
        .from(rightPanelRef.current, { opacity: 0, x: 20, duration: 0.9 }, "-=0.7");



      /* ── SCROLL PARALLAX ── */
      gsap.to(cupRef.current, {
        y: -50,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(wordRef.current, {
        y: -35,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={heroRef}>

      {/* Background */}
      <div className="hero__bg" ref={bgRef}>
        <div className="hero__bg-solid" />
      </div>

      {/* Giant background word */}
      <div className="hero__word-container">
        <h1 className="hero__word" ref={wordRef} aria-hidden="true">MOCHA</h1>
      </div>

      {/* Floating spoon — upper left */}
      <img
        src={spoonImg}
        alt="Coffee beans on wooden spoon"
        className="hero__spoon"
        ref={spoonRef}
      />

      {/* Floating cubes — upper right */}
      <img
        src={cubesImg}
        alt="Chocolate cubes"
        className="hero__cubes"
        ref={cubesRef}
      />

      {/* Left panel */}
      <div className="hero__left" ref={leftPanelRef}>
        <p className="hero__eyebrow">BOLD. SMOOTH. TIMELESS.</p>
        <h2 className="hero__title">Brewed for<br />your moments</h2>
        <a href="#menu" className="hero__explore-link">Explore Our Menu &rarr;</a>
      </div>

      {/* Right panel */}
      <div className="hero__right" ref={rightPanelRef}>
        <div className="hero__signature-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#7a6555" strokeWidth="1.2"/>
            <circle cx="12" cy="12" r="3" stroke="#7a6555" strokeWidth="1.2"/>
          </svg>
        </div>
        <hr className="hero__divider" />
        <div className="hero__signature-label">SIGNATURE BLEND</div>
        <p className="hero__desc">
          A harmonious blend of premium beans, rich flavors, and expert craftsmanship.
        </p>
        <hr className="hero__divider" />
      </div>

      {/* Hero cup — centrepiece */}
      <img
        src={cupImg}
        alt="Velvet Pour cup"
        className="hero__cup"
        ref={cupRef}
      />

    </section>
  );
}