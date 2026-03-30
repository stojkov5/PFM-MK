import React from "react";
import { Button } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "../Swimming/Calendar.css";

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

  const groupedMonths = MONTH_ORDER.map((month) => {
    const monthRows = [];
    const monthWeeks = MONTH_WEEKS[month] || ["Week 1", "Week 2", "Week 3", "Week 4"];

    monthWeeks.forEach((week, index) => {
      const weekEvents = DATA.filter(
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
          <div className="pfm-cal-kicker">
            {t("calendar.kicker", { defaultValue: "Distance Swimming Calendar" })}
          </div>

          <h2 className="pfm-cal-title">
            {t("calendar.distanceSwimmingTitle", {
              defaultValue: "Distance Swimming Calendar",
            })}
          </h2>

          <div className="pfm-cal-controls pb-3">
            <Button
              className="pfm-cal-open"
              icon={<FiExternalLink />}
              onClick={() =>
                window.open(
                  "/2026-DSW-Calendar.pdf",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              {t("calendar.openPdf", { defaultValue: "Open PDF" })}
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
                      <th>{t("calendar.columns.event", { defaultValue: "Event" })}</th>
                      <th>{t("calendar.columns.week", { defaultValue: "Week" })}</th>
                      <th>{t("calendar.columns.date", { defaultValue: "Date" })}</th>
                      <th>{t("calendar.columns.location", { defaultValue: "Location" })}</th>
                      <th>{t("calendar.columns.organizer", { defaultValue: "Organizer" })}</th>
                      <th>{t("calendar.columns.competition", { defaultValue: "Competition" })}</th>
                      <th>{t("calendar.columns.category", { defaultValue: "Category" })}</th>
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

export default DistanceSwimmingCalendar;