import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiGlobe,
  FiFileText,
  FiAward,
  FiEdit3,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import "./swimming.css";

const SwimmingLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const cards = [
    {
      to: "/swimming/clubs",
      label: t("swimming.cards.clubs.title"),
      desc: t("swimming.cards.clubs.desc"),
      icon: <FiUsers />,
    },
    {
      to: "/swimming/calendar-national",
      label: t("swimming.cards.calendarNational.title"),
      desc: t("swimming.cards.calendarNational.desc"),
      icon: <FiCalendar />,
    },
    {
      to: "/swimming/calendar-international",
      label: t("swimming.cards.calendarInternational.title"),
      desc: t("swimming.cards.calendarInternational.desc"),
      icon: <FiGlobe />,
    },
    {
      to: "/swimming/criteria",
      label: t("swimming.cards.criteria.title"),
      desc: t("swimming.cards.criteria.desc"),
      icon: <FiFileText />,
    },
    {
      to: "/swimming/records",
      label: t("swimming.cards.records.title"),
      desc: t("swimming.cards.records.desc"),
      icon: <FiAward />,
    },
    {
      to: "/swimming/record-application",
      label: t("swimming.cards.recordApplication.title"),
      desc: t("swimming.cards.recordApplication.desc"),
      icon: <FiEdit3 />,
    },
  ];

  return (
    <section className="pfm-swimming">
      {/* Header / Hero */}
      <div className="pfm-swimming-hero">
        <div className="pfm-swimming-hero-inner max-w-6xl mx-auto px-4 md:px-6">
          <Reveal>
            <span className="pfm-swimming-kicker">
              {t("swimming.hero.kicker")}
            </span>
            <h1 className="pfm-swimming-title pfm-lane-underline pfm-lane-underline-left">
              {t("swimming.hero.title")}
            </h1>
            <p className="pfm-swimming-sub">
              {t("swimming.hero.subtitle")}
            </p>
          </Reveal>

          {/* Cards nav */}
          <Reveal delay={0.1}>
          <div className="pfm-swimming-cardgrid">
            {cards.map((c) => {
              const isActive = location.pathname.startsWith(c.to);

              return (
                <NavLink
                  key={c.to}
                  to={c.to}
                  className={`pfm-swimming-card ${isActive ? "active" : ""}`}
                >
                  <div className="pfm-swimming-card-top">
                    <div className="pfm-swimming-card-icon">{c.icon}</div>
                    <div className="pfm-swimming-card-title">
                      {c.label}
                    </div>
                  </div>

                  <div className="pfm-swimming-card-desc">
                    {c.desc}
                  </div>

                  <div className="pfm-swimming-card-cta">
                    {t("swimming.open")}{" "}
                    <span className="pfm-swimming-card-arrow">→</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
          </Reveal>
        </div>
      </div>

      {/* Page content */}
      <div className="pfm-swimming-content max-w-6xl mx-auto px-4 md:px-6">
        <Outlet />
      </div>
    </section>
  );
};

export default SwimmingLayout;
