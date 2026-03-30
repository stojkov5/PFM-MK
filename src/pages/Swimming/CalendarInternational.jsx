import React from "react";
import { Button } from "antd";
import { FiExternalLink } from "react-icons/fi";
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
            {t("calendar.kicker", { defaultValue: "Swimming Calendar" })}
          </div>

          <h2 className="pfm-cal-title">
            {t("calendar.internationalTitle", {
              defaultValue: "International Calendar",
            })}
          </h2>

          <div className="pfm-cal-controls pb-3">
            <Button
              className="pfm-cal-open"
              icon={<FiExternalLink />}
              onClick={() =>
                window.open(
                  "/2026-Swimming-International-Calendar.pdf",
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
                      <th>
                        {t("calendar.columns.location", { defaultValue: "Location" })}
                      </th>
                      <th>
                        {t("calendar.columns.organizer", {
                          defaultValue: "Organizer",
                        })}
                      </th>
                      <th>
                        {t("calendar.columns.competition", {
                          defaultValue: "Competition",
                        })}
                      </th>
                      <th>
                        {t("calendar.columns.category", {
                          defaultValue: "Category",
                        })}
                      </th>
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

export default CalendarInternational;