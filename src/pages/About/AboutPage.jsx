// src/pages/About/AboutPage.jsx
// /about — who the federation is: an intro beside photos of the three
// disciplines, what we do, our memberships and partners,
// and links to the structure, partners and documents pages.
import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiFileText,
  FiFlag,
  FiGitBranch,
  FiUsers,
} from "react-icons/fi";
import { PiHandshake } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import PartnerTile from "./PartnerTile.jsx";
import { PARTNERS } from "../../data/partners.js";
import "./about.css";
import "./AboutPage.css";

const PHOTOS = [
  { key: "swimming", src: "/Images/Swim.webp" },
  { key: "waterpolo", src: "/Images/Waterpolo.webp" },
  { key: "distance", src: "/Images/Distance.webp" },
];

const PILLARS = [
  { key: "competitions", icon: <FiFlag /> },
  { key: "calendars", icon: <FiCalendar /> },
  { key: "records", icon: <FiAward /> },
  { key: "national", icon: <FiUsers /> },
];

const MORE = [
  { to: "/about/structure", key: "structure", icon: <FiGitBranch /> },
  { to: "/about/partners", key: "partners", icon: <PiHandshake /> },
  { to: "/documents", key: "documents", icon: <FiFileText /> },
];

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-ab pt-24">
      {/* Intro + photos */}
      <section className="pfm-ab-hero max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <span className="pfm-ab-kicker">{t("about.hero.kicker")}</span>
          <h1 className="pfm-ab-title">{t("about.hero.title")}</h1>
          <p className="pfm-ab-subtitle">{t("about.hero.subtitle")}</p>
          <p className="pfm-ab-lead">{t("about.lead")}</p>
          <div className="pfm-ab-actions">
            <Link to="/about/structure" className="pfm-ab-btn is-primary">
              {t("about.more.structure.title")} <FiArrowRight />
            </Link>
            <Link to="/documents" className="pfm-ab-btn">
              {t("about.more.documents.title")}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="pfm-ab-collage">
            {PHOTOS.map((p) => (
              <figure key={p.key} className={`pfm-ab-photo is-${p.key}`}>
                <img src={p.src} alt="" loading="lazy" />
                <figcaption>{t(`home.sports.${p.key}.title`)}</figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      {/* What we do */}
      <section className="pfm-ab-section max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="pfm-ab-h2">{t("about.pillars.title")}</h2>
        </Reveal>
        <ol className="pfm-ab-pillars">
          {PILLARS.map((p, i) => (
            <li key={p.key}>
              <Reveal delay={i * 0.06}>
                <div className="pfm-ab-pillar">
                  <div className="pfm-ab-pillar-top">
                    <span className="pfm-ab-pillar-icon">{p.icon}</span>
                    <span className="pfm-ab-pillar-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{t(`about.pillars.${p.key}.title`)}</h3>
                  <p>{t(`about.pillars.${p.key}.desc`)}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Memberships and partners */}
      <section className="pfm-ab-section max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-ab-head">
            <h2 className="pfm-ab-h2">{t("about.partnersStrip.title")}</h2>
            <Link to="/about/partners" className="pfm-ab-more">
              {t("about.partnersStrip.all")} <FiArrowRight />
            </Link>
          </div>
          <ul className="pfm-ab-logos">
            {PARTNERS.map((p) => (
              <li key={p.key}>
                <PartnerTile partner={p} name={t(`about.partners.items.${p.key}`)} />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* More */}
      <section className="pfm-ab-section pfm-ab-section-last max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="pfm-ab-h2">{t("about.more.title")}</h2>
          <div className="pfm-ab-links">
            {MORE.map((m) => (
              <Link key={m.to} to={m.to} className="pfm-ab-link">
                <span className="pfm-ab-link-icon">{m.icon}</span>
                <span className="pfm-ab-link-text">
                  <span className="pfm-ab-link-title">{t(`about.more.${m.key}.title`)}</span>
                  <span className="pfm-ab-link-desc">{t(`about.more.${m.key}.desc`)}</span>
                </span>
                <FiArrowRight className="pfm-ab-link-arrow" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default AboutPage;
