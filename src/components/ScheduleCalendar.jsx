// src/components/ScheduleCalendar.jsx
// The month-by-month calendars copied from the federation's PDF calendars
// (swimming international, water polo national, distance swimming).
// Wide screens: one table per month listing every week, like the PDF.
// Phones: only the month's events, as cards (styles in Swimming/Calendar.css).
import React from "react";
import { Button } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Reveal from "./fx/Reveal.jsx";
import { monthName } from "../lib/competitions.js";
import "../pages/Swimming/Calendar.css";

const MONTHS = [
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
const DEFAULT_WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4"];

/**
 * data: [{ key, month: "July", week: "Week 2", event, date, location,
 *          organizer, competition, category }]
 * monthWeeks: optional { July: ["Week 1", …, "Week 4/5"] } when a month's
 *             week labels differ from Week 1–4.
 */
const ScheduleCalendar = ({ title, pdf, data, monthWeeks = {} }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  // "Week 4/5" → "Недела 4/5"
  const weekLabel = (week) => week.replace(/^Week/, t("calendar.columns.week"));

  const months = MONTHS.map((month, index) => {
    const events = data.filter((item) => item.month === month);
    const rows = [];
    (monthWeeks[month] ?? DEFAULT_WEEKS).forEach((week) => {
      const weekEvents = events.filter((item) => item.week === week);
      if (weekEvents.length === 0) {
        rows.push({ key: `${month}-${week}`, week, isEmpty: true });
      } else {
        weekEvents.forEach((item, i) => rows.push({ ...item, week: i === 0 ? week : "" }));
      }
    });
    return { month, name: monthName(index, locale), events, rows };
  });

  const badge = (value, type) => value && <span className={`pfm-mini-badge ${type}`}>{value}</span>;

  return (
    <div className="pfm-cal pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-cal-head">
            <div className="pfm-cal-kicker">{t("calendar.kicker")}</div>
            <h2 className="pfm-cal-title">{title}</h2>
            <div className="pfm-cal-controls pb-3">
              <Button
                className="pfm-cal-open"
                icon={<FiExternalLink />}
                onClick={() => window.open(pdf, "_blank", "noopener,noreferrer")}
              >
                {t("calendar.openPdf")}
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pfm-schedule-wrap">
            {months.map((section) => (
              <div className="pfm-schedule-month" key={section.month}>
                <div className="pfm-schedule-month-bar">{section.name}</div>

                <div className="pfm-schedule-table-wrap">
                  <table className="pfm-schedule-table">
                    {/* Same column widths in every month, so the tables line up. */}
                    <colgroup>
                      <col style={{ width: "24%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "19%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "12%" }} />
                    </colgroup>
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
                          <td>
                            <span className="pfm-cal-event">{row.event}</span>
                          </td>
                          <td>
                            <span className="pfm-week-cell">{row.week && weekLabel(row.week)}</span>
                          </td>
                          <td>
                            <span className="pfm-cal-date">{row.date}</span>
                          </td>
                          <td>{row.location}</td>
                          <td>{row.organizer}</td>
                          <td>{badge(row.competition, "competition")}</td>
                          <td>{badge(row.category, "category")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Phones */}
                {section.events.length === 0 ? (
                  <p className="pfm-schedule-none">{t("calendar.noEventsMonth")}</p>
                ) : (
                  <ul className="pfm-schedule-cards">
                    {section.events.map((item) => (
                      <li key={item.key} className="pfm-schedule-card">
                        <div className="pfm-schedule-card-when">
                          {weekLabel(item.week)}
                          {item.date && ` · ${item.date}`}
                        </div>
                        <div className="pfm-schedule-card-name">{item.event}</div>
                        <div className="pfm-schedule-card-meta">
                          {[item.location, item.organizer].filter(Boolean).join(" · ")}
                        </div>
                        {(item.competition || item.category) && (
                          <div className="pfm-schedule-card-badges">
                            {badge(item.competition, "competition")}
                            {item.category !== item.competition && badge(item.category, "category")}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
