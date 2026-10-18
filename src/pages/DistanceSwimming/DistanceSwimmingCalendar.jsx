// src/pages/DistanceSwimming/DistanceSwimmingCalendar.jsx
// The distance swimming season calendar. Empty for now: there are no
// competitions in it yet (the old 2026 PDF calendar was removed).
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import "../../components/competitions/competitions.css";

const DistanceSwimmingCalendar = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-compcal pt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-compcal-head">
            <div>
              <div className="pfm-compcal-kicker">{t("competitions.kicker")}</div>
              <h2 className="pfm-compcal-title">{t("distance.calendar.title")}</h2>
            </div>
          </div>
        </Reveal>
        <p className="pfm-compcal-empty">{t("distance.calendar.empty")}</p>
      </div>
    </div>
  );
};

export default DistanceSwimmingCalendar;
