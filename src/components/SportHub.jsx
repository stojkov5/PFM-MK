// src/components/SportHub.jsx
// Landing page layout shared by the sport pages and the calendar page:
// a hero (kicker, title, subtitle) followed by groups of link cards.
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Reveal from "./fx/Reveal.jsx";
import "../pages/Swimming/swimming.css";

const HubCard = ({ card }) => {
  const { t } = useTranslation();
  return (
    <NavLink to={card.to} className="pfm-swimming-card">
      <div className="pfm-swimming-card-top">
        <div className="pfm-swimming-card-icon">{card.icon}</div>
        <div className="pfm-swimming-card-title">{card.label}</div>
      </div>
      <div className="pfm-swimming-card-desc">{card.desc}</div>
      <div className="pfm-swimming-card-cta">
        {t("swimming.open")} <span className="pfm-swimming-card-arrow">→</span>
      </div>
    </NavLink>
  );
};

/**
 * @param groups  [{ key, title?, icon?, cards: [{ to, label, desc, icon }] }]
 *                Use a single group without a title for a plain card grid.
 */
const SportHub = ({ kicker, title, subtitle, groups }) => (
  <section className="pfm-swimming">
    <div className="pfm-swimming-hero">
      <div className="pfm-swimming-hero-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <span className="pfm-swimming-kicker">{kicker}</span>
          <h1 className="pfm-swimming-title pfm-lane-underline pfm-lane-underline-left">
            {title}
          </h1>
          <p className="pfm-swimming-sub">{subtitle}</p>
        </Reveal>

        {groups.map((group, i) => (
          <Reveal key={group.key} delay={0.1 + i * 0.06}>
            {group.title && (
              <h2 className="pfm-hub-group-title">
                {group.icon && <span className="pfm-hub-group-icon">{group.icon}</span>}
                {group.title}
              </h2>
            )}
            <div className="pfm-swimming-cardgrid">
              {group.cards.map((card) => (
                <HubCard key={card.to} card={card} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
    <div className="pfm-swimming-content" />
  </section>
);

export default SportHub;
