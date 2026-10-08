// src/pages/About/AboutPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FiFlag,
  FiCalendar,
  FiAward,
  FiUsers,
  FiGitBranch,
  FiFileText,
  FiArrowRight,
} from "react-icons/fi";
import { PiHandshake } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import AboutHero from "./AboutHero.jsx";

const AboutPage = () => {
  const { t } = useTranslation();

  const pillars = [
    { key: "competitions", icon: <FiFlag /> },
    { key: "calendars", icon: <FiCalendar /> },
    { key: "records", icon: <FiAward /> },
    { key: "national", icon: <FiUsers /> },
  ];

  const more = [
    { to: "/about/structure", key: "structure", icon: <FiGitBranch /> },
    { to: "/about/partners", key: "partners", icon: <PiHandshake /> },
    { to: "/documents", key: "documents", icon: <FiFileText /> },
  ];

  return (
    <AboutHero
      kicker={t("about.hero.kicker")}
      title={t("about.hero.title")}
      subtitle={t("about.hero.subtitle")}
    >
      <Reveal>
        <div className="pfm-aboutpg-panel">
          <p className="pfm-aboutpg-lead">{t("homeAbout.text")}</p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="pfm-hub-group-title">{t("about.pillars.title")}</h2>
        <div className="pfm-aboutpg-pillars">
          {pillars.map((p) => (
            <div key={p.key} className="pfm-aboutpg-pillar">
              <span className="pfm-swimming-card-icon">{p.icon}</span>
              <div>
                <div className="pfm-aboutpg-pillar-title">{t(`about.pillars.${p.key}.title`)}</div>
                <div className="pfm-aboutpg-pillar-desc">{t(`about.pillars.${p.key}.desc`)}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <h2 className="pfm-hub-group-title">{t("about.more.title")}</h2>
        <div className="pfm-swimming-cardgrid">
          {more.map((m) => (
            <Link key={m.to} to={m.to} className="pfm-swimming-card">
              <div className="pfm-swimming-card-top">
                <div className="pfm-swimming-card-icon">{m.icon}</div>
                <div className="pfm-swimming-card-title">{t(`about.more.${m.key}.title`)}</div>
              </div>
              <div className="pfm-swimming-card-desc">{t(`about.more.${m.key}.desc`)}</div>
              <div className="pfm-swimming-card-cta">
                {t("swimming.open")} <FiArrowRight />
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </AboutHero>
  );
};

export default AboutPage;
