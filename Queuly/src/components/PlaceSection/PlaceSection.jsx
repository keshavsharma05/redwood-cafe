import "./PlaceSection.css";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PlaceSection() {
  const sectionRef = useRef();
  const tabsRef = useRef();
  const textRef = useRef();
  const headingRef = useRef();
  const subRef = useRef();

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

  /*
   * Initial section animation
   * ONLY animates text + tabs.
   * Background image is completely untouched.
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });

      tl.from(tabsRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      })
        .from(
          headingRef.current,
          {
            y: 45,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.35"
        )
        .from(
          subRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.45"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const switchTab = (tab) => {
    const key = tab.toLowerCase();

    if (key === activeTab) return;

    /*
     * Animate ONLY the text out.
     * Image stays completely static.
     */
    gsap.to([headingRef.current, subRef.current], {
      y: 12,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setActiveTab(key);

        gsap.fromTo(
          [headingRef.current, subRef.current],
          {
            y: 16,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: "power3.out",
          }
        );
      },
    });
  };

  const current = content[activeTab];

  return (
    <section
      id="cafe"
      className="place-section"
      ref={sectionRef}
    >
      {/* Tabs */}
      <div className="place-tabs" ref={tabsRef}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`place-tab${
              activeTab === tab.toLowerCase()
                ? " place-tab--active"
                : ""
            }`}
            onClick={() => switchTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Background image
          NO GSAP
          NO opacity animation
          NO transform animation
      */}
      <div className="place-image-wrap">
        <img
          src={current.src}
          alt={current.heading}
          className="place-image"
        />

        <div className="place-overlay" />
      </div>

      {/* Text */}
      <div className="place-overlay-text" ref={textRef}>
        <h2
          className="place-heading"
          ref={headingRef}
        >
          {current.heading.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h2>

        <p
          className="place-sub"
          ref={subRef}
        >
          {current.sub.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}