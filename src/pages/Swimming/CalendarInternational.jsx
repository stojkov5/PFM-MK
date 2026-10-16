// The CalendarInternational page: data from the federation's PDF calendar, shown by
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
  August: ["Week 1", "Week 2", "Week 3", "Week 4/5"],
  September: ["Week 1", "Week 2", "Week 3", "Week 4"],
  October: ["Week 1", "Week 2", "Week 3", "Week 5"],
  November: ["Week 1", "Week 2", "Week 3", "Week 4"],
  December: ["Week 1", "Week 2", "Week 3", "Week 4"],
};

const DATA = [
  {
    key: "mar-1",
    month: "March",
    week: "Week 4",
    event: "Multi-Nations Meet",
    date: "28-29",
    location: "Graz (AUT) / Prague (CZE)",
    organizer: "",
    competition: "LC",
    category: "SW",
  },
  {
    key: "jun-1",
    month: "June",
    week: "Week 3",
    event: "Comen cup",
    date: "19-21",
    location: "Belgrade (SRB)",
    organizer: "",
    competition: "LC",
    category: "SW",
  },
  {
    key: "jul-1",
    month: "July",
    week: "Week 2",
    event: "Junior Swimming Championships",
    date: "07-12",
    location: "(GER)",
    organizer: "EA",
    competition: "LC",
    category: "SW",
  },
  {
    key: "jul-2",
    month: "July",
    week: "Week 3",
    event: "CEEJP",
    date: "17-19",
    location: "(SLO)",
    organizer: "",
    competition: "LC",
    category: "SW",
  },
  {
    key: "jul-3",
    month: "July",
    week: "Week 4",
    event: "Jr. Open Water Swimming Championships",
    date: "23-26",
    location: "Velence (HUN)",
    organizer: "EA",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "aug-1",
    month: "August",
    week: "Week 2",
    event: "European Aquatics Championships",
    date: "10-16",
    location: "Paris (FRA)",
    organizer: "EA",
    competition: "LC",
    category: "SW",
  },
  {
    key: "aug-2",
    month: "August",
    week: "Week 4/5",
    event: "Mediterranean Games",
    date: "21-03.09",
    location: "Taranto (ITA)",
    organizer: "",
    competition: "LC",
    category: "SW",
  },
  {
    key: "sep-1",
    month: "September",
    week: "Week 1",
    event: "WA Jr. Open Water Swimming Championship",
    date: "3-6",
    location: "Santa Fe (ARG)",
    organizer: "WA",
    competition: "OWS",
    category: "OWS",
  },
  {
    key: "oct-1",
    month: "October",
    week: "Week 5",
    event: "Summer Youth Olympics",
    date: "31-13.11",
    location: "Dakar (SEN)",
    organizer: "IOC",
    competition: "LC",
    category: "SW",
  },
  {
    key: "dec-1",
    month: "December",
    week: "Week 1",
    event: "WA Swimming Championships",
    date: "1-6",
    location: "Beijin (CHN)",
    organizer: "WA",
    competition: "SC",
    category: "SW",
  },
];

const CalendarInternational = () => {
  const { t } = useTranslation();
  return (
    <ScheduleCalendar
      title={t("calendar.internationalTitle")}
      pdf="/2026-Swimming-International-Calendar.pdf"
      data={DATA}
      monthWeeks={MONTH_WEEKS}
    />
  );
};

export default CalendarInternational;
