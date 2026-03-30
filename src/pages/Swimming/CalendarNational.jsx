import React, { useState } from "react";
import { Input, Button, Tag } from "antd";
import { FiSearch, FiExternalLink } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Calendar.css";

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_ORDER = ["Week 1", "Week 2", "Week 3", "Week 4"];

const DATA = [
  {
    key: "feb-1",
    month: "February",
    week: "Week 3",
    event: "Delfin Kup",
    date: "21-22",
    location: "Skopje (MKD)",
    organizer: "Delfin",
    competition: "SC",
    category: "SW",
  },
  {
    key: "feb-2",
    month: "February",
    week: "Week 4",
    event: "Neptun Kup",
    date: "28-01.03",
    location: "Skopje (MKD)",
    organizer: "Neptun",
    competition: "SC",
    category: "SW",
  },
  {
    key: "may-1",
    month: "May",
    week: "Week 3",
    event: "Orion Kup",
    date: "24",
    location: "Skopje (MKD)",
    organizer: "Orion",
    competition: "LC",
    category: "SW",
  },
  {
    key: "jul-1",
    month: "July",
    week: "Week 1",
    event: "Nacionalno prvenstvo plivanje",
    date: "",
    location: "",
    organizer: "NPF",
    competition: "SW",
    category: "SW",
  },
  {
    key: "jul-2",
    month: "July",
    week: "Week 4",
    event: "Ohrid Open 2026",
    date: "25",
    location: "Ohrid (MKD)",
    organizer: "Aqua Spirit",
    competition: "LC",
    category: "SW",
  },
  {
    key: "aug-1",
    month: "August",
    week: "Week 4",
    event: "Ohrid Water Festival 2026",
    date: "22",
    location: "Ohrid (MKD)",
    organizer: "Aqua Spirit",
    competition: "LC",
    category: "SW",
  },
  {
    key: "aug-2",
    month: "August",
    week: "Week 4",
    event: "Imperator cup 2026",
    date: "23",
    location: "Bitola (MKD)",
    organizer: "Imperator",
    competition: "LC",
    category: "SW",
  },
  {
    key: "sep-1",
    month: "September",
    week: "Week 4",
    event: "Orion mini",
    date: "27",
    location: "Skopje (MKD)",
    organizer: "Orion",
    competition: "SC",
    category: "SW",
  },
  {
    key: "oct-1",
    month: "October",
    week: "Week 3",
    event: 'ISM "13 Noemvri"',
    date: "17-18",
    location: "Skopje (MKD)",
    organizer: "Beta Sharks",
    competition: "SC",
    category: "SW",
  },
  {
    key: "oct-2",
    month: "October",
    week: "Week 4",
    event: "Nemo kup",
    date: "24-25",
    location: "Skopje (MKD)",
    organizer: "Delfin",
    competition: "SC",
    category: "SW",
  },
  {
    key: "nov-1",
    month: "November",
    week: "Week 1",
    event: "Skopje Open",
    date: "07-08",
    location: "Skopje (MKD)",
    organizer: "Skopje",
    competition: "SC",
    category: "SW",
  },
  {
    key: "nov-2",
    month: "November",
    week: "Week 2",
    event: 'ISM "13 Noemvri"',
    date: "14-15",
    location: "Skopje (MKD)",
    organizer: "Beta Sharks",
    competition: "SC",
    category: "SW",
  },
  {
    key: "dec-1",
    month: "December",
    week: "Week 2",
    event: "Atlas Winter Cup",
    date: "12-13",
    location: "Skopje (MKD)",
    organizer: "Atlantida",
    competition: "SC",
    category: "SW",
  },
  {
    key: "dec-2",
    month: "December",
    week: "Week 3",
    event: "Nacionalno prvenstvo plivanje",
    date: "18-20",
    location: "",
    organizer: "NPF",
    competition: "SC",
    category: "SW",
  },
  {
    key: "dec-3",
    month: "December",
    week: "Week 4",
    event: "Talent Cup",
    date: "27",
    location: "Skopje (MKD)",
    organizer: "Aqua Pro",
    competition: "SC",
    category: "SW",
  },
];

const CalendarNational = () => {
  const { t } = useTranslation();
  const [q] = useState("");

  const filtered = DATA.filter((item) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;

    return [
      item.month,
      item.week,
      item.event,
      item.date,
      item.location,
      item.organizer,
      item.competition,
      item.category,
    ]
      .join(" ")
      .toLowerCase()
      .includes(s);
  });

  const groupedMonths = MONTH_ORDER.map((month) => {
    const monthRows = [];

    WEEK_ORDER.forEach((week, index) => {
      const weekEvents = filtered.filter(
        (item) => item.month === month && item.week === week
      );

      if (weekEvents.length > 0) {
        weekEvents.forEach((eventItem, eventIndex) => {
          monthRows.push({
            ...eventItem,
            key: eventItem.key || `${month}-${week}-${eventIndex}`,
            week: eventIndex === 0 ? week : "",
            isEmpty: false,
          });
        });
      } else {
        monthRows.push({
          key: `${month}-${week}-${index}`,
          month,
          week,
          event: "",
          date: "",
          location: "",
          organizer: "",
          competition: "",
          category: "",
          isEmpty: true,
        });
      }
    });

    return {
      month,
      rows: monthRows,
    };
  });

  const renderCell = (value, className = "") => {
    return <span className={className}>{value || ""}</span>;
  };

  const renderBadge = (value, type = "") => {
    if (!value) return "";
    return <span className={`pfm-mini-badge ${type}`}>{value}</span>;
  };

  return (
    <div className="pfm-cal pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-cal-head">
          <div className="pfm-cal-kicker">{t("calendar.kicker")}</div>
          <h2 className="pfm-cal-title">{t("calendar.nationalTitle")}</h2>

          <div className="pfm-cal-controls pb-3">
            

            <Button
              className="pfm-cal-open"
              icon={<FiExternalLink />}
              onClick={() =>
                window.open("/2026-Swimming-National-Calendar.pdf", "_blank", "noopener,noreferrer")
              }
            >
              {t("calendar.openPdf")}
            </Button>
          </div>
        </div>

        <div className="pfm-schedule-wrap">
          {groupedMonths.map((section) => (
            <div className="pfm-schedule-month" key={section.month}>
              <div className="pfm-schedule-month-bar">{section.month}</div>

              <div className="pfm-schedule-table-wrap">
                <table className="pfm-schedule-table">
                  <thead>
                    <tr>
                      <th>{t("calendar.columns.event")}</th>
                      <th>{t("calendar.columns.week")}</th>
                      <th>{t("calendar.columns.date")}</th>
                      <th>{t("calendar.columns.location")}</th>
                      <th>{t("calendar.columns.organizer")}</th>
                      <th>{t("calendar.columns.competition")}</th>
                      <th>{t("calendar.columns.category")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {section.rows.map((row) => (
                      <tr key={row.key} className={row.isEmpty ? "is-empty" : ""}>
                        <td>{renderCell(row.event, "pfm-cal-event")}</td>
                        <td>{renderCell(row.week, "pfm-week-cell")}</td>
                        <td>{renderCell(row.date, "pfm-cal-date")}</td>
                        <td>{renderCell(row.location)}</td>
                        <td>{renderCell(row.organizer)}</td>
                        <td>
                          {row.competition
                            ? renderBadge(row.competition, "competition")
                            : ""}
                        </td>
                        <td>
                          {row.category
                            ? renderBadge(row.category, "category")
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarNational;