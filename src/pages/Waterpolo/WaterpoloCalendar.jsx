// src/pages/Waterpolo/WaterpoloCalendar.jsx
// The water polo competition calendar. Empty for now: how water polo
// competitions get into the calendar is still to be decided.
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import "../../components/competitions/competitions.css";

const WaterpoloCalendar = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-compcal pt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-compcal-head">
            <div>
              <div className="pfm-compcal-kicker">{t("competitions.kicker")}</div>
              <h2 className="pfm-compcal-title">{t("waterpolo.calendar.title")}</h2>
            </div>
          </div>
        </Reveal>
        <p className="pfm-compcal-empty">{t("waterpolo.calendar.empty")}</p>
      </div>
    </div>
  );
};

export default WaterpoloCalendar;
