// src/components/competitions/CompetitionCalendar.jsx
// One sport's competition calendar (swimming, water polo): approved
// competitions grouped by month, one year at a time. Clubs add competitions
// through the form linked from the registration banner (while the
// federation's registration window for that sport is open).
import React, { useMemo, useState } from "react";
import { Segmented, Spin } from "antd";
import { useTranslation } from "react-i18next";
import Reveal from "../fx/Reveal.jsx";
import CompetitionCard from "./CompetitionCard.jsx";
import RegistrationBanner from "./RegistrationBanner.jsx";
import { useCompetitions } from "./hooks.js";
import { groupByMonth, monthName } from "../../lib/competitions.js";
import "./competitions.css";

// `title` and `empty` are the page heading and the no-competitions text.
const CompetitionCalendar = ({ sport = "swimming", title, empty }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [openId, setOpenId] = useState(null);
  const { data, isLoading, isError } = useCompetitions(sport);

  const years = useMemo(
    () => [...new Set([...(data?.years ?? []), thisYear])].sort((a, b) => a - b),
    [data, thisYear]
  );
  const months = useMemo(
    () => groupByMonth((data?.competitions ?? []).filter((c) => c.startDate.startsWith(`${year}-`))),
    [data, year]
  );

  return (
    <div className="pfm-compcal pt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-compcal-head">
            <div>
              <div className="pfm-compcal-kicker">{t("competitions.kicker")}</div>
              <h2 className="pfm-compcal-title">{title}</h2>
            </div>
            {years.length > 1 && (
              <Segmented
                className="pfm-compcal-years"
                value={year}
                onChange={(y) => {
                  setYear(y);
                  setOpenId(null);
                }}
                options={years}
              />
            )}
          </div>
        </Reveal>

        <RegistrationBanner sport={sport} />

        {isLoading ? (
          <div className="pfm-compcal-empty">
            <Spin />
          </div>
        ) : isError ? (
          <p className="pfm-compcal-empty">{t("competitions.loadFailed")}</p>
        ) : months.length === 0 ? (
          <p className="pfm-compcal-empty">{empty ?? t("competitions.empty", { year })}</p>
        ) : (
          months.map((m) => (
            <section className="pfm-compcal-month" key={m.key}>
              <h3 className="pfm-compcal-month-title">
                {monthName(m.month, locale)} <span>{m.year}</span>
              </h3>
              <ol className="pfm-comp-list">
                {m.items.map((c) => (
                  <CompetitionCard
                    key={c.id}
                    competition={c}
                    open={openId === c.id}
                    onToggle={() => setOpenId((id) => (id === c.id ? null : c.id))}
                  />
                ))}
              </ol>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default CompetitionCalendar;
