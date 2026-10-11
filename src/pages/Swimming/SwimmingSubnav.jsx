// src/pages/Swimming/SwimmingSubnav.jsx
// Section navigation for the swimming pages: a bar of links that sits on the
// bottom edge of the swimming hero. Add entries to ITEMS as sections are built.
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./SwimmingSubnav.css";

// The international calendar page (/swimming/calendar-international) still
// exists but is not linked here for now.
const ITEMS = [
  { key: "latest", to: "/swimming", end: true },
  { key: "calendar", to: "/swimming/calendar-national" },
  { key: "records", to: "/swimming/records" },
  { key: "criteria", to: "/swimming/criteria" },
];

const SwimmingSubnav = () => {
  const { t } = useTranslation();

  return (
    <nav className="pfm-subnav" aria-label={t("swimming.subnav.label")}>
      {ITEMS.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `pfm-subnav-link ${isActive ? "is-active" : ""}`}
        >
          {t(`swimming.subnav.${item.key}`)}
        </NavLink>
      ))}
    </nav>
  );
};

export default SwimmingSubnav;
