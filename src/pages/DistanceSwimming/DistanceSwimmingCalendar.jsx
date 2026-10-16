// The DistanceSwimmingCalendar page: data from the federation's PDF calendar, shown by
// the shared ScheduleCalendar (table on wide screens, cards on phones).
import React from "react";
import { useTranslation } from "react-i18next";
import ScheduleCalendar from "../../components/ScheduleCalendar.jsx";

// Week labels for months that differ from Week 1–4.
const MONTH_WEEKS = {
  January: ["Week 1", "Week 2", "Week 3", "Week 4"],
  February: ["Week 1", "Week 2", "Week 3", "Week 4"],
  March: ["Week 1", "Week 2", "Week 3", "Week 4"],
  April: ["Week 1", "Week 2", "Week 3", "Week 4"],
  May: ["Week 1", "Week 2", "Week 3", "Week 4"],
  June: ["Week 1", "Week 2", "Week 3", "Week 4"],
  July: ["Week 1", "Week 2", "Week 3", "Week 4"],
  August: ["Week 1", "Week 2", "Week 3", "Week 5"],
  September: ["Week 1", "Week 2", "Week 3", "Week 4"],
  October: ["Week 1", "Week 2", "Week 3", "Week 4"],
  November: ["Week 1", "Week 2", "Week 3", "Week 4"],
  December: ["Week 1", "Week 2", "Week 3", "Week 4"],
};

const DATA = [
  {
    key: "jan-1",
    month: "January",
    week: "Week 3",
    event: "Nacionalno dalecinsko plivanje",
    date: "",
    location: "Skopje (MKD)",
    organizer: "NPF",
    competition: "SC",
    category: "OWS",
  },
  {
    key: "apr-1",
    month: "April",
    week: "Week 4",
    event: "Nacionalno dalecinsko plivanje",
    date: "",
    location: "Skopje (MKD)",
    organizer: "NPF",
    competition: "LC",
    category: "OWS",
  },
  {
    key: "jul-1",
    month: "July",
    week: "Week 1",
    event: "Struga na otvoreni vodi",
    date: "05",
    location: "Struga (MKD)",
    organizer: "3disciplini",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "jul-2",
    month: "July",
    week: "Week 2",
    event: "Kup 1 - Prespa",
    date: "11",
    location: "Resen (MKD)",
    organizer: "Aqua Spirit",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "jul-3",
    month: "July",
    week: "Week 3",
    event: "Kup 2 - Tose Proeski",
    date: "18",
    location: "Krusevo (MKD)",
    organizer: "Pirani",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "aug-1",
    month: "August",
    week: "Week 1",
    event: "Kup 3 - Ilindenski Maraton",
    date: "02",
    location: "Ohrid (MKD)",
    organizer: "Ohridski Branovi",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "aug-2",
    month: "August",
    week: "Week 4",
    event: "Klime Savin 25km",
    date: "22",
    location: "Ohrid (MKD)",
    organizer: "Ohridski Branovi",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "aug-3",
    month: "August",
    week: "Week 5",
    event: "Kup 4 - Delfin Open",
    date: "30",
    location: "Ohrid (MKD)",
    organizer: "Delfin",
    competition: "OWS",
    category: "OWS",
  },
];

const DistanceSwimmingCalendar = () => {
  const { t } = useTranslation();
  return (
    <ScheduleCalendar
      title={t("calendar.distanceSwimmingTitle")}
      pdf="/2026-DSW-Calendar.pdf"
      data={DATA}
      monthWeeks={MONTH_WEEKS}
    />
  );
};

export default DistanceSwimmingCalendar;
