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

const WEEK_ORDER = ["Week 1", "Week 2", "Week 3", "Week 4"];

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

  const groupedMonths = MONTH_ORDER.map((month) => {
    const monthRows = [];

    WEEK_ORDER.forEach((week, index) => {
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
            {t("calendar.kicker", { defaultValue: "Waterpolo Calendar" })}
          </div>

          <h2 className="pfm-cal-title">
            {t("calendar.waterpoloNationalTitle", {
              defaultValue: "Waterpolo National Calendar",
            })}
          </h2>

          <div className="pfm-cal-controls pb-3">
            <Button
              className="pfm-cal-open"
              icon={<FiExternalLink />}
              onClick={() =>
                window.open(
                  "/2026-Waterpolo-Calendar.pdf",
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

export default WaterpoloCalendarNational;