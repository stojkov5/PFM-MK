// src/pages/About/PartnersPage.jsx
// Membership in the international federations, plus a section for
// partners/sponsors — add entries to PARTNERS as they are confirmed.
import React from "react";
import { FiGlobe, FiExternalLink } from "react-icons/fi";
import { PiHandshake } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import AboutHero from "./AboutHero.jsx";

const MEMBERSHIPS = [
  { key: "worldAquatics", name: "World Aquatics", url: "https://www.worldaquatics.com" },
  { key: "europeanAquatics", name: "European Aquatics", url: "https://www.europeanaquatics.org" },
];

// Example entry: { name: "Company", url: "https://...", logo: "/partners/company.png" }
const PARTNERS = [];

const PartnerCard = ({ name, desc, url, logo, icon }) => (
  <a className="pfm-partner" href={url} target="_blank" rel="noopener noreferrer">
    <span className="pfm-partner-logo">
      {logo ? <img src={logo} alt={name} /> : icon}
    </span>
    <span className="pfm-partner-text">
      <span className="pfm-partner-name">
        {name} <FiExternalLink />
      </span>
      {desc && <span className="pfm-partner-desc">{desc}</span>}
    </span>
  </a>
);

const PartnersPage = () => {
  const { t } = useTranslation();

  return (
    <AboutHero
      kicker={t("about.partners.kicker")}
      title={t("about.partners.title")}
      subtitle={t("about.partners.subtitle")}
    >
      <Reveal>
        <h2 className="pfm-hub-group-title">{t("about.partners.memberships")}</h2>
        <div className="pfm-partner-grid">
          {MEMBERSHIPS.map((m) => (
            <PartnerCard
              key={m.key}
              name={m.name}
              url={m.url}
              icon={<FiGlobe />}
              desc={t(`about.partners.items.${m.key}`)}
            />
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="pfm-hub-group-title">{t("about.partners.sponsors")}</h2>
        {PARTNERS.length ? (
          <div className="pfm-partner-grid">
            {PARTNERS.map((p) => (
              <PartnerCard key={p.name} {...p} icon={<PiHandshake />} />
            ))}
          </div>
        ) : (
          <div className="pfm-aboutpg-panel pfm-aboutpg-empty">
            <PiHandshake />
            <p>{t("about.partners.empty")}</p>
          </div>
        )}
      </Reveal>
    </AboutHero>
  );
};

export default PartnersPage;
