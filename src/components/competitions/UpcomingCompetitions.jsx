// src/components/competitions/UpcomingCompetitions.jsx
// The next few approved swimming competitions, with a link to the full calendar.
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { TbSwimming } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import CompetitionCard from "./CompetitionCard.jsx";
import RegistrationBanner from "./RegistrationBanner.jsx";
import { useCompetitions } from "./hooks.js";
import { todayString } from "../../lib/competitions.js";
import "./competitions.css";

const UpcomingCompetitions = ({ limit = 5 }) => {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState(null);
  const { data } = useCompetitions();
  const today = todayString();
  const upcoming = (data?.competitions ?? []).filter((c) => c.endDate >= today).slice(0, limit);

  return (
    <section className="pfm-comp-upcoming">
      <div className="pfm-comp-upcoming-head">
        <h2 className="pfm-hub-group-title">
          <span className="pfm-hub-group-icon">
            <TbSwimming />
          </span>
          {t("competitions.upcoming.title")}
        </h2>
        <Link to="/swimming/calendar-national" className="pfm-comp-upcoming-link">
          {t("competitions.upcoming.all")} <FiArrowRight />
        </Link>
      </div>
      <RegistrationBanner />
      {upcoming.length === 0 ? (
        <p className="pfm-compcal-empty">{t("competitions.upcoming.empty")}</p>
      ) : (
        <ol className="pfm-comp-list">
          {upcoming.map((c) => (
            <CompetitionCard
              key={c.id}
              competition={c}
              open={openId === c.id}
              onToggle={() => setOpenId((id) => (id === c.id ? null : c.id))}
            />
          ))}
        </ol>
      )}
    </section>
  );
};

export default UpcomingCompetitions;
