// src/components/competitions/CompetitionCard.jsx
// One competition in the calendar list: date · club badge · name and place,
// opening into the full details (criteria, deadline, bulletin link…).
import React from "react";
import { FiArrowRight, FiExternalLink, FiMapPin } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { clubInitials, formatDay, formatRange, shortClubName, todayString } from "../../lib/competitions.js";

const Detail = ({ label, children, wide }) =>
  children ? (
    <div className={`pfm-comp-detail ${wide ? "is-wide" : ""}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  ) : null;

const CompetitionCard = ({ competition: c, open, onToggle }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const past = c.endDate < todayString();
  const place = [c.venue, c.city].filter(Boolean).join(", ");
  const panelId = `pfm-comp-panel-${c.id}`;

  const range = formatDay(c.startDate, locale) + (c.endDate !== c.startDate ? ` – ${formatDay(c.endDate, locale)}` : "");

  return (
    <li className={`pfm-comp-card ${open ? "is-open" : ""} ${past ? "is-past" : ""}`}>
      <button
        type="button"
        className="pfm-comp-row"
        aria-expanded={onToggle ? open : undefined}
        aria-controls={onToggle ? panelId : undefined}
        onClick={onToggle}
      >
        <span className="pfm-comp-date">{formatRange(c.startDate, c.endDate, locale)}</span>
        <span className="pfm-comp-badge" aria-hidden="true">{clubInitials(c.clubName)}</span>
        <span className="pfm-comp-main">
          <span className="pfm-comp-name">
            {c.name}
            <span className="pfm-comp-org"> · {shortClubName(c.clubName)}</span>
          </span>
          <span className="pfm-comp-meta">
            <FiMapPin /> {place}
            <span className={`pfm-comp-course is-${c.course.toLowerCase()}`}>
              {t(`competitions.courseShort.${c.course}`)}
            </span>
            {past && <span className="pfm-comp-past">{t("competitions.finished")}</span>}
          </span>
        </span>
        {onToggle && (
          <span className="pfm-comp-cta">
            <span className="pfm-comp-cta-text">
              {open ? t("competitions.hide") : t("competitions.details")}
            </span>
            <FiArrowRight />
          </span>
        )}
      </button>

      {onToggle && (
        <div className="pfm-comp-panel" id={panelId} role="region" aria-hidden={!open}>
          <div className="pfm-comp-panel-inner">
            <dl className="pfm-comp-details">
              <Detail label={t("competitions.labels.dates")}>
                {range}
                {c.startTime && ` · ${t("competitions.labels.startsAt", { time: c.startTime })}`}
              </Detail>
              <Detail label={t("competitions.labels.place")}>{place}</Detail>
              <Detail label={t("competitions.labels.organizer")}>{c.clubName}</Detail>
              <Detail label={t("competitions.labels.course")}>{t(`competitions.courses.${c.course}`)}</Detail>
              <Detail label={t("competitions.labels.entryDeadline")}>
                {c.entryDeadline && formatDay(c.entryDeadline, locale)}
              </Detail>
              <Detail label={t("competitions.labels.criteria")} wide>
                {c.criteria && <span className="pfm-comp-text">{c.criteria}</span>}
              </Detail>
              <Detail label={t("competitions.labels.description")} wide>
                {c.description && <span className="pfm-comp-text">{c.description}</span>}
              </Detail>
            </dl>
            {c.infoUrl && (
              <a
                className="pfm-comp-link"
                href={c.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
              >
                {t("competitions.labels.info")} <FiExternalLink />
              </a>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

export default CompetitionCard;
