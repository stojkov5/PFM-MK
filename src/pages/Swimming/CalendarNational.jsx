// src/pages/Swimming/CalendarNational.jsx
// The swimming competition calendar (see CompetitionCalendar).
import React from "react";
import { useTranslation } from "react-i18next";
import CompetitionCalendar from "../../components/competitions/CompetitionCalendar.jsx";

const CalendarNational = () => {
  const { t } = useTranslation();
  return <CompetitionCalendar sport="swimming" title={t("competitions.title")} />;
};

export default CalendarNational;
