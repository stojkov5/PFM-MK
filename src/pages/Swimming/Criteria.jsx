// src/pages/Swimming/Criteria.jsx
// Swimming criteria: qualification norms for international competitions (one
// accordion row per competition, with its document) and the national
// championship limits (pool / gender switches). Shares the Records page look —
// its header, switches, buttons and accordion rows come from Records.css.
import React, { useState } from "react";
import { FiDownload, FiExternalLink, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import criteriaData from "../../data/criteriaData.json";
import Reveal from "../../components/fx/Reveal.jsx";
import PillSwitch from "./PillSwitch.jsx";
import "./Records.css";
import "./Criteria.css";

// The source data mixes "00:28,83", "27,72" and "02:19.24"; show them all the
// way the records list does: "28.83", "27.72", "2:19.24".
const formatTime = (v) => {
  if (!v || v === "—" || v === "/") return "—";
  return v
    .trim()
    .replace(",", ".")
    .replace(/^00:/, "")
    .replace(/^0(\d:)/, "$1");
};

// "машки: 2011 - 2013" → { gender: "male", years: "2011 – 2013" }
const parseBirth = (s) => {
  const m = s.match(/^\s*(машки|женски)\s*:\s*(.+)$/i);
  if (!m) return { gender: null, years: s };
  return { gender: /^м/i.test(m[1]) ? "male" : "female", years: m[2].replace(/\s*-\s*/, " – ") };
};

const topPlaces = (noteKey) => Number(noteKey.match(/top(\d+)/)?.[1]) || null;

const DocActions = ({ file, tabIndex }) => {
  const { t } = useTranslation();
  const href = encodeURI(file);
  return (
    <div className="pfm-crit-docs">
      <a className="pfm-rec-btn" href={href} target="_blank" rel="noopener noreferrer" tabIndex={tabIndex}>
        <FiExternalLink /> {t("criteria.openPdf")}
      </a>
      <a className="pfm-rec-btn is-primary" href={href} download tabIndex={tabIndex}>
        <FiDownload /> {t("criteria.downloadPdf")}
      </a>
    </div>
  );
};

// Women B · A | Men A · B, as in the federation's documents.
const NormTable = ({ rows }) => {
  const { t } = useTranslation();
  return (
    <div className="pfm-crit-scroll">
      <table className="pfm-crit-table">
        <thead>
          <tr className="pfm-crit-group">
            <th rowSpan={2} scope="col" className="pfm-crit-sticky">
              {t("criteria.table.discipline")}
            </th>
            <th colSpan={2} scope="colgroup">{t("criteria.table.female")}</th>
            <th colSpan={2} scope="colgroup" className="pfm-crit-split">{t("criteria.table.male")}</th>
          </tr>
          <tr>
            <th scope="col">{t("criteria.table.bNorm")}</th>
            <th scope="col">{t("criteria.table.aNorm")}</th>
            <th scope="col" className="pfm-crit-split">{t("criteria.table.aNorm")}</th>
            <th scope="col">{t("criteria.table.bNorm")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="pfm-crit-sticky pfm-crit-discipline">{r.discipline}</th>
              <td>{formatTime(r.femaleB)}</td>
              <td className="pfm-crit-a">{formatTime(r.femaleA)}</td>
              <td className="pfm-crit-a pfm-crit-split">{formatTime(r.maleA)}</td>
              <td>{formatTime(r.maleB)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EventRow = ({ event, index, open, onToggle }) => {
  const { t } = useTranslation();
  const panelId = `pfm-crit-panel-${event.id}`;
  const top = topPlaces(event.noteKey);
  const tab = open ? 0 : -1;

  return (
    <li className={`pfm-rec-row ${open ? "is-open" : ""}`} style={{ "--i": index }}>
      <button
        type="button"
        className="pfm-rec-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="pfm-rec-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="pfm-rec-name">
          {t(event.titleKey)}
          <span className="pfm-crit-sub">{t(event.subtitleKey)}</span>
        </span>
        {top && <span className="pfm-rec-count">{t("criteria.topChip", { n: top })}</span>}
        <span className="pfm-rec-icon">
          <FiPlus />
        </span>
      </button>

      <div className="pfm-rec-panel" id={panelId} role="region" aria-hidden={!open}>
        <div className="pfm-rec-panel-inner">
          <div className="pfm-crit-body">
            <div className="pfm-crit-facts">
              <dl className="pfm-crit-birth">
                {event.birth.map(parseBirth).map((b, i) => (
                  <div key={i}>
                    <dt>
                      {b.gender ? t(`criteria.table.${b.gender}`) : t("criteria.birthGroups")}
                      <span> · {t("criteria.birthYears")}</span>
                    </dt>
                    <dd>{b.years}</dd>
                  </div>
                ))}
              </dl>
              <p className="pfm-crit-note">
                <strong>{t("criteria.eligibilityTitle")}</strong> {t(event.noteKey)}
              </p>
              <DocActions file={event.file} tabIndex={tab} />
            </div>
            <NormTable rows={event.rows} />
          </div>
        </div>
      </div>
    </li>
  );
};

const POOLS = ["25", "50"];
const GENDERS = ["female", "male"];
const LIMIT_SECTION = { "25-female": "women25", "25-male": "men25", "50-female": "women50", "50-male": "men50" };
const AGE_COLUMNS = [
  ["c1", "youngerPioneers"],
  ["c2", "olderPioneers"],
  ["c3", "cadets"],
  ["c4", "juniors"],
  ["c5", "seniors"],
];

const NationalLimits = () => {
  const { t } = useTranslation();
  const [pool, setPool] = useState("50");
  const [gender, setGender] = useState("female");
  const section = criteriaData.nationalLimits.find((s) => s.id === LIMIT_SECTION[`${pool}-${gender}`]);

  return (
    <section className="pfm-crit-section">
      <h3 className="pfm-crit-title">{t("criteria.national.title")}</h3>
      <p className="pfm-rec-sub">{t("criteria.national.subtitle")}</p>

      <div className="pfm-rec-bar">
        <div className="pfm-rec-filters">
          <PillSwitch
            label={t("criteria.national.poolLabel")}
            value={pool}
            onChange={setPool}
            options={POOLS.map((value) => ({ value, label: `${value}m` }))}
          />
          <PillSwitch
            label={t("criteria.national.genderLabel")}
            value={gender}
            onChange={setGender}
            options={GENDERS.map((value) => ({ value, label: t(`criteria.table.${value}`) }))}
          />
        </div>
        {section && <DocActions file={section.file} />}
      </div>

      {section && (
        <div className="pfm-crit-card" key={section.id}>
          <div className="pfm-crit-scroll">
            <table className="pfm-crit-table is-limits">
              <thead>
                <tr>
                  <th scope="col" className="pfm-crit-sticky">{t("criteria.table.discipline")}</th>
                  {AGE_COLUMNS.map(([key, label]) => (
                    <th scope="col" key={key}>{t(`criteria.national.columns.${label}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((r) => (
                  <tr key={r.key}>
                    <th scope="row" className="pfm-crit-sticky pfm-crit-discipline">{r.discipline}</th>
                    {AGE_COLUMNS.map(([key]) => (
                      <td key={key}>{formatTime(r[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pfm-crit-provisions">
        <h4 className="pfm-crit-provisions-title">{t("criteria.national.additionalProvisions")}</h4>
        <ol>
          {criteriaData.nationalExtraNotesKeys.map((key, i) => (
            <li key={key}>
              <span className="pfm-rec-num">{String(i + 1).padStart(2, "0")}</span>
              <p>{t(key)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const Criteria = () => {
  const { t } = useTranslation();
  const events = criteriaData.officialEvents;
  // id of the expanded competition; undefined = the first one, null = none.
  const [openId, setOpenId] = useState(undefined);
  const activeId = openId === undefined ? events[0]?.id : openId;

  return (
    <div className="pfm-rec pfm-crit pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-rec-head">
            <div className="pfm-rec-kicker">{t("criteria.kicker")}</div>
            <h2 className="pfm-rec-title">{t("criteria.title")}</h2>
            <p className="pfm-rec-sub">{t("criteria.subtitle")}</p>
          </header>
        </Reveal>

        <section className="pfm-crit-section">
          <h3 className="pfm-crit-title">{t("criteria.international.title")}</h3>
          <p className="pfm-rec-sub">{t("criteria.international.subtitle")}</p>
          <ol className="pfm-rec-list">
            {events.map((event, index) => (
              <EventRow
                key={event.id}
                event={event}
                index={index}
                open={activeId === event.id}
                onToggle={() => setOpenId(activeId === event.id ? null : event.id)}
              />
            ))}
          </ol>
        </section>

        <Reveal>
          <NationalLimits />
        </Reveal>
      </div>
    </div>
  );
};

export default Criteria;
