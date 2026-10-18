// src/pages/Calendar/CalendarHub.jsx
// /calendar — the season calendar of every sport in one list, by month.
// The filter bar narrows it to one sport (kept in the URL: /calendar?sport=swimming).
import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Segmented, Spin } from "antd";
import { FiArrowRight, FiGrid } from "react-icons/fi";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import CompetitionCard from "../../components/competitions/CompetitionCard.jsx";
import RegistrationBanner from "../../components/competitions/RegistrationBanner.jsx";
import { useCompetitions } from "../../components/competitions/hooks.js";
import { groupByMonth, monthName } from "../../lib/competitions.js";
import "../../components/competitions/competitions.css";
import "./CalendarHub.css";

const SPORTS = [
  { key: "swimming", icon: <TbSwimming />, to: "/swimming/calendar-national" },
  { key: "waterpolo", icon: <TbWaterpolo />, to: "/waterpolo/calendar" },
  { key: "distance", icon: <TiWaves />, to: "/distance-swimming/calendar" },
];

const CalendarHub = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const thisYear = new Date().getFullYear();
  const [params, setParams] = useSearchParams();
  const sport = SPORTS.some((s) => s.key === params.get("sport")) ? params.get("sport") : "all";
  const [year, setYear] = useState(thisYear);
  const [openId, setOpenId] = useState(null);

  const swimming = useCompetitions("swimming");

  // Every competition of every sport, in date order. Only swimming has
  // competitions so far; water polo and distance swimming are still empty.
  const all = useMemo(
    () =>
      (swimming.data?.competitions ?? [])
        .map((c) => ({ ...c, sport: "swimming" }))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [swimming.data]
  );

  const years = useMemo(
    () => [...new Set([...all.map((c) => Number(c.startDate.slice(0, 4))), thisYear])].sort((a, b) => a - b),
    [all, thisYear]
  );

  const inYear = all.filter((c) => c.startDate.startsWith(`${year}-`));
  const countOf = (key) => (key === "all" ? inYear : inYear.filter((c) => c.sport === key)).length;
  const months = groupByMonth(sport === "all" ? inYear : inYear.filter((c) => c.sport === sport));

  const sportLabel = (key) => t(`navbar.sports.${key}.title`);
  const selected = SPORTS.find((s) => s.key === sport);

  const choose = (key) => {
    setParams(key === "all" ? {} : { sport: key }, { replace: true });
    setOpenId(null);
  };

  const filters = [{ key: "all", icon: <FiGrid />, label: t("calendarHub.filter.all") }].concat(
    SPORTS.map((s) => ({ key: s.key, icon: s.icon, label: sportLabel(s.key) }))
  );

  const loading = swimming.isLoading && (sport === "all" || sport === "swimming");

  return (
    <section className="pfm-calhub">
      <header className="pfm-calhub-hero">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <Reveal>
            <span className="pfm-calhub-kicker">{t("calendarHub.hero.kicker", { year })}</span>
            <h1 className="pfm-calhub-title">{t("calendarHub.hero.title")}</h1>
            <p className="pfm-calhub-sub">{t("calendarHub.hero.subtitle")}</p>
          </Reveal>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-calhub-bar">
          <div className="pfm-calhub-filters" role="group" aria-label={t("calendarHub.filter.label")}>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`pfm-calhub-filter is-${f.key} ${sport === f.key ? "is-active" : ""}`}
                aria-pressed={sport === f.key}
                onClick={() => choose(f.key)}
              >
                <span className="pfm-calhub-filter-icon">{f.icon}</span>
                {f.label}
                <span className="pfm-calhub-filter-count">{countOf(f.key)}</span>
              </button>
            ))}
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

        {(sport === "all" || sport === "swimming") && <RegistrationBanner />}

        {selected && (
          <Link to={selected.to} className="pfm-calhub-sportlink">
            {t("calendarHub.openSport", { sport: sportLabel(selected.key) })} <FiArrowRight />
          </Link>
        )}

        {loading ? (
          <div className="pfm-compcal-empty">
            <Spin />
          </div>
        ) : months.length === 0 ? (
          <p className="pfm-compcal-empty">
            {sport === "all" || sport === "swimming"
              ? t("competitions.empty", { year })
              : t(`${sport}.calendar.empty`)}
          </p>
        ) : (
          months.map((m) => (
            <section className="pfm-compcal-month" key={m.key}>
              <h2 className="pfm-compcal-month-title">
                {monthName(m.month, locale)} <span>{m.year}</span>
              </h2>
              <ol className="pfm-comp-list">
                {m.items.map((c) => (
                  <CompetitionCard
                    key={c.id}
                    competition={c}
                    sport={sport === "all" ? { key: c.sport, label: sportLabel(c.sport) } : undefined}
                    open={openId === c.id}
                    onToggle={() => setOpenId((id) => (id === c.id ? null : c.id))}
                  />
                ))}
              </ol>
            </section>
          ))
        )}

        {swimming.isError && sport !== "waterpolo" && sport !== "distance" && (
          <p className="pfm-compcal-empty">{t("competitions.loadFailed")}</p>
        )}
      </div>
    </section>
  );
};

export default CalendarHub;
