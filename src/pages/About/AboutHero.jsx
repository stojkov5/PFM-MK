// src/pages/About/AboutHero.jsx
// Shared page header for the About section (same look as the sport hubs).
import React from "react";
import Reveal from "../../components/fx/Reveal.jsx";
import "../Swimming/swimming.css";
import "./about.css";

const AboutHero = ({ kicker, title, subtitle, children }) => (
  <section className="pfm-swimming">
    <div className="pfm-swimming-hero">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <span className="pfm-swimming-kicker">{kicker}</span>
          <h1 className="pfm-swimming-title pfm-lane-underline pfm-lane-underline-left">
            {title}
          </h1>
          {subtitle && <p className="pfm-swimming-sub">{subtitle}</p>}
        </Reveal>
      </div>
    </div>
    <div className="pfm-aboutpg-body max-w-6xl mx-auto px-4 md:px-6">{children}</div>
  </section>
);

export default AboutHero;
