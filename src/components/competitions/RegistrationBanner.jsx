// src/components/competitions/RegistrationBanner.jsx
// Tells clubs whether they can register competitions right now, with a link
// to the form while the registration window is open. Hidden otherwise.
import React from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useRegistrationWindow } from "./hooks.js";
import { formatLongDate as fmt } from "../../lib/dates.js";

const RegistrationBanner = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const { data: w } = useRegistrationWindow();

  if (w?.status === "open") {
    return (
      <div className="pfm-comp-banner is-open">
        <span className="pfm-comp-banner-dot" aria-hidden="true" />
        <p>
          {t("competitions.window.open", { season: w.season, date: fmt(w.closesAt, locale) })}
        </p>
        <Link to="/swimming/calendar-national/submit" className="pfm-comp-banner-btn">
          <FiPlus /> {t("competitions.window.cta")}
        </Link>
      </div>
    );
  }
  if (w?.status === "upcoming") {
    return (
      <div className="pfm-comp-banner">
        <p>
          {t("competitions.window.upcoming", {
            season: w.season,
            from: fmt(w.opensAt, locale),
            to: fmt(w.closesAt, locale),
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default RegistrationBanner;
