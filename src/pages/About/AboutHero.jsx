// src/pages/About/AboutHero.jsx
// Shared page header for the About section (same look as the sport hubs).
import React from "react";
import Reveal from "../../components/fx/Reveal.jsx";
import "../Swimming/swimming.css";
import "./about.css";

const AboutHero = ({ kicker, title, subtitle, wide = false, children }) => {
  // `wide` gives content-heavy pages (the org chart) more room on big screens.
  const width = wide ? "max-w-[1440px]" : "max-w-6xl";
  return (
    <section className="pfm-swimming">
      <div className="pfm-swimming-hero">
        <div className={`${width} mx-auto px-4 md:px-6`}>
          <Reveal>
            <span className="pfm-swimming-kicker">{kicker}</span>
            <h1 className="pfm-swimming-title pfm-lane-underline pfm-lane-underline-left">
              {title}
            </h1>
            {subtitle && <p className="pfm-swimming-sub">{subtitle}</p>}
          </Reveal>
        </div>
      </div>
      <div className={`pfm-aboutpg-body ${width} mx-auto px-4 md:px-6`}>{children}</div>
    </section>
  );
};

export default AboutHero;
