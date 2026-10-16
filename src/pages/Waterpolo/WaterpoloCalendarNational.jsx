// The WaterpoloCalendarNational page: data from the federation's PDF calendar, shown by
// the shared ScheduleCalendar (table on wide screens, cards on phones).
import React from "react";
import { useTranslation } from "react-i18next";
import ScheduleCalendar from "../../components/ScheduleCalendar.jsx";

const DATA = [
  {
    key: "jun-1",
    month: "June",
    week: "Week 3",
    event: "Letno drzavno vaterpolo",
    date: "20/27",
    location: "Skopje (MKD)",
    organizer: "NPF",
    competition: "WP",
    category: "WP",
  },
  {
    key: "oct-1",
    month: "October",
    week: "Week 2",
    event: "Vardar Cup (2010)",
    date: "10-11",
    location: "Skopje (MKD)",
    organizer: "Vardar 8",
    competition: "WP",
    category: "WP",
  },
  {
    key: "oct-2",
    month: "October",
    week: "Week 4",
    event: "Vardar Veteranj vaterpolo",
    date: "31-01.11",
    location: "Skopje (MKD)",
    organizer: "Vardar",
    competition: "WP",
    category: "WP",
  },
  {
    key: "nov-1",
    month: "November",
    week: "Week 3",
    event: "Vaterpolo turnir 13 Noemvri",
    date: "14-15",
    location: "Skopje (MKD)",
    organizer: "Lokomotiva",
    competition: "WP",
    category: "WP",
  },
  {
    key: "dec-1",
    month: "December",
    week: "Week 1",
    event: "Zimsko drzavno vaterpolo",
    date: "04-06",
    location: "Skopje (MKD)",
    organizer: "NPF",
    competition: "WP",
    category: "WP",
  },
];

const WaterpoloCalendarNational = () => {
  const { t } = useTranslation();
  return (
    <ScheduleCalendar
      title={t("calendar.waterpoloNationalTitle")}
      pdf="/2026-Waterpolo-Calendar.pdf"
      data={DATA}
    />
  );
};

export default WaterpoloCalendarNational;
