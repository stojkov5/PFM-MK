import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
  FiTag,
  FiHome,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { useClubs } from "../../lib/clubs.js";
import Reveal from "../../components/fx/Reveal.jsx";
import "./Clubs.css";

// ПВК = water polo club; everything else (ПК / PK / ПСК) is a swimming club.
const isWaterpoloClub = (club) =>
  /^ПВК(\s|$)/i.test(club.name.trim()) || /ватерполо/i.test(club.type || "");

// Clubs are listed by their own name, without the club-type prefix.
const TYPE_PREFIX = /^(ПВК|ПСК|ПК|PK)\s+/i;
const displayName = (club) => club.name.trim().replace(TYPE_PREFIX, "");
// Leading quotes (e.g. „ВАРДАР“) must not affect the alphabetical order.
const sortKey = (name) => name.replace(/^[^\p{L}\p{N}]+/u, "");

const GROUPS = [
  { key: "swimming", icon: <TbSwimming />, test: (club) => !isWaterpoloClub(club) },
  { key: "waterpolo", icon: <TbWaterpolo />, test: isWaterpoloClub },
];

const DETAILS = [
  { field: "city", icon: <FiMapPin /> },
  { field: "type", icon: <FiTag /> },
  { field: "address", icon: <FiHome /> },
  { field: "phone", icon: <FiPhone />, href: (value) => `tel:${value.replace(/[^\d+]/g, "")}` },
  { field: "president", icon: <FiUser /> },
  { field: "email", icon: <FiMail />, href: (value) => `mailto:${value}` },
];

const ClubRow = ({ club, index, open, onToggle }) => {
  const { t } = useTranslation();
  const panelId = `pfm-club-panel-${club.id}`;

  return (
    <li className={`pfm-club-row ${open ? "is-open" : ""}`} style={{ "--i": index }}>
      <button
        type="button"
        className="pfm-club-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="pfm-club-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="pfm-club-name">{club.displayName}</span>
        <span className="pfm-club-icon">
          <FiPlus />
        </span>
      </button>

      <div className="pfm-club-panel" id={panelId} role="region" aria-hidden={!open}>
        <div className="pfm-club-panel-inner">
          <dl className="pfm-club-details">
            {DETAILS.map(({ field, icon, href }) => {
              const value = club[field];
              return (
                <div className="pfm-club-detail" key={field}>
                  <span className="pfm-club-detail-icon">{icon}</span>
                  <div className="pfm-club-detail-text">
                    <dt>{t(`clubs.labels.${field}`)}</dt>
                    <dd>
                      {value && href ? (
                        <a href={href(value)} tabIndex={open ? 0 : -1}>
                          {value}
                        </a>
                      ) : (
                        value || t("clubs.dash", { defaultValue: "—" })
                      )}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </li>
  );
};

const Clubs = () => {
  const { t } = useTranslation();

  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [tab, setTab] = useState(GROUPS[0].key);
  const [openId, setOpenId] = useState(null); // id of the expanded club
  const { data: clubsData, isLoading, isError } = useClubs();

  const clubs = useMemo(
    () =>
      (clubsData ?? [])
        .map((club) => ({ ...club, displayName: displayName(club) }))
        .sort((a, b) =>
          sortKey(a.displayName).localeCompare(sortKey(b.displayName), "mk", {
            sensitivity: "base",
          })
        ),
    [clubsData]
  );

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(clubs.map((club) => club.city).filter(Boolean))];
    return ["all", ...uniqueCities.sort((a, b) => a.localeCompare(b, "mk"))];
  }, [clubs]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return clubs.filter((club) => {
      const matchesCity = city === "all" ? true : club.city === city;

      const haystack = [
        club.name,
        club.city,
        club.type,
        club.address,
        club.email,
        club.phone,
        club.president
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search ? true : haystack.includes(search);

      return matchesCity && matchesSearch;
    });
  }, [clubs, q, city]);

  const groups = useMemo(
    () => GROUPS.map((group) => ({ ...group, clubs: filtered.filter(group.test) })),
    [filtered]
  );

  const active = groups.find((group) => group.key === tab);

  return (
    <div className="pfm-clubs pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-clubs-head">
            <div className="pfm-clubs-kicker">{t("clubs.kicker")}</div>
            <h1 className="pfm-clubs-title">{t("clubs.title")}</h1>
            <p className="pfm-clubs-sub">{t("clubs.subtitle")}</p>
          </header>

          <div className="pfm-clubs-bar">
            <div className="pfm-clubs-tabs" role="group" aria-label={t("clubs.title")}>
              {groups.map((group) => (
                <button
                  key={group.key}
                  type="button"
                  className={`pfm-clubs-tab ${group.key === tab ? "is-active" : ""}`}
                  aria-pressed={group.key === tab}
                  onClick={() => setTab(group.key)}
                >
                  <span className="pfm-clubs-tab-icon">{group.icon}</span>
                  <span className="pfm-clubs-tab-label">{t(`clubs.groups.${group.key}`)}</span>
                  <span className="pfm-clubs-tab-count">{group.clubs.length}</span>
                </button>
              ))}
            </div>

            <div className="pfm-clubs-filters">
              <label className="pfm-clubs-search">
                <FiSearch />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("clubs.searchPlaceholder")}
                  aria-label={t("clubs.searchPlaceholder")}
                />
              </label>

              <label className="pfm-clubs-select">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label={t("clubs.allCities")}
                >
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? t("clubs.allCities") : item}
                    </option>
                  ))}
                </select>
                <FiChevronDown />
              </label>
            </div>
          </div>
        </Reveal>

        {active.clubs.length ? (
          // Keyed by tab so the rows replay their entrance when the list changes.
          <ol className="pfm-club-list" key={tab}>
            {active.clubs.map((club, index) => (
              <ClubRow
                key={club.id}
                club={club}
                index={index}
                open={openId === club.id}
                onToggle={() => setOpenId((id) => (id === club.id ? null : club.id))}
              />
            ))}
          </ol>
        ) : (
          <p className="pfm-clubs-empty">
            {isLoading ? "…" : isError ? t("clubs.loadError") : t("clubs.empty")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Clubs;
