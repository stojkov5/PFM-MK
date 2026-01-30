import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiGlobe,
  FiFileText,
  FiAward,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
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
  ];

  return (
    <section className="pfm-swimming">
      {/* Header / Hero */}
      <div className="pfm-swimming-hero">
        <div className="pfm-swimming-hero-inner max-w-6xl mx-auto px-4 md:px-6">
          <span className="pfm-swimming-kicker">
            {t("swimming.hero.kicker")}
          </span>
          <h1 className="pfm-swimming-title">
            {t("swimming.hero.title")}
          </h1>
          <p className="pfm-swimming-sub">
            {t("swimming.hero.subtitle")}
          </p>

          {/* Cards nav */}
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
