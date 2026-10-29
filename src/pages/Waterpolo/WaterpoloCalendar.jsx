// src/pages/Waterpolo/WaterpoloCalendar.jsx
// The water polo competition calendar (see CompetitionCalendar). Clubs
// register water polo competitions the same way as swimming ones.
import React from "react";
import { useTranslation } from "react-i18next";
import CompetitionCalendar from "../../components/competitions/CompetitionCalendar.jsx";

const WaterpoloCalendar = () => {
  const { t } = useTranslation();
  return (
    <CompetitionCalendar
      sport="waterpolo"
      title={t("waterpolo.calendar.title")}
      empty={t("waterpolo.calendar.empty")}
    />
  );
};

export default WaterpoloCalendar;
