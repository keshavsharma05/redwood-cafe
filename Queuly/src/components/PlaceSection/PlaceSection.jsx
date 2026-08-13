import "./PlaceSection.css";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PlaceSection() {
  const sectionRef = useRef();
  const imageRef = useRef();
  const textRef = useRef();
  const [activeTab, setActiveTab] = useState("interior");

  const tabs = ["Interior", "Exterior"];

  const content = {
    interior: {
      src: "/interior.png",
      heading: "A space\ndesigned for you.",
      sub: "Warm corners, soft light,\nand a cup that feels just right.",
    },
    exterior: {
      src: "/exterior.png",
      heading: "Sunlit seating,\nopen air.",
      sub: "Step outside, breathe easy,\nand let the world slow down.",
    },
  };

  const switchTab = (tab) => {
    const key = tab.toLowerCase();
    if (key === activeTab) return;

    gsap.to(imageRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setActiveTab(key);
        gsap.to(imageRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });
      },
    });

    gsap.fromTo(
      textRef.current,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.3 }
    );
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const current = content[activeTab];

  return (
    <section id="cafe" className="place-section" ref={sectionRef}>

      {/* Tab switcher */}
      <div className="place-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`place-tab${activeTab === tab.toLowerCase() ? " place-tab--active" : ""}`}
            onClick={() => switchTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Full-bleed image */}
      <div className="place-image-wrap" ref={imageRef}>
        <img src={current.src} alt={current.heading} className="place-image" />
        <div className="place-overlay" />
      </div>

      {/* Text overlay */}
      <div className="place-overlay-text" ref={textRef}>
        <h2 className="place-heading">
          {current.heading.split("\n").map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </h2>
        <p className="place-sub">
          {current.sub.split("\n").map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>
      </div>

    </section>
  );
}