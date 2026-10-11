// src/pages/About/PartnersPage.jsx
// Logo grid of the federations and institutions we work with. Logos live in
// public/Partners — add an entry to PARTNERS for every new file.
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import AboutHero from "./AboutHero.jsx";

// Files with their own solid background fill the whole tile (`fit: "cover"`);
// the rest sit centred on `bg`. `zoom` evens out how much empty margin each
// file has around the logo.
const PARTNERS = [
  {
    key: "worldAquatics",
    file: "Svetska Plivacka federacija copy.png",
    bg: "#110e09",
    zoom: 1.1,
    url: "https://www.worldaquatics.com",
  },
  {
    key: "europeanAquatics",
    file: "European Aquatics copy.jpg",
    bg: "#ffffff",
    fit: "cover",
    url: "https://www.europeanaquatics.org",
  },
  { key: "olympicCommittee", file: "Olimiski Komitet copy.png", bg: "#ffffff", zoom: 0.72 },
  {
    key: "ministryOfSport",
    file: "Ministerstvo za Sport copy.jpg",
    bg: "#01b7c4",
    fit: "cover",
    zoom: 1.35,
  },
  {
    key: "sportsFederationsUnion",
    file: "Sojus na sportski federacii copy.jpg",
    bg: "#ffffff",
    fit: "cover",
  },
];

const PartnerTile = ({ partner, name }) => {
  const Tag = partner.url ? "a" : "div";
  const linkProps = partner.url
    ? { href: partner.url, target: "_blank", rel: "noopener noreferrer", title: name }
    : {};

  return (
    <Tag className="pfm-partner" {...linkProps}>
      <span className="pfm-partner-logo" style={{ background: partner.bg }}>
        <img
          src={`/Partners/${encodeURIComponent(partner.file)}`}
          alt={name}
          loading="lazy"
          style={{
            objectFit: partner.fit ?? "contain",
            transform: partner.zoom ? `scale(${partner.zoom})` : undefined,
          }}
        />
      </span>
    </Tag>
  );
};

const PartnersPage = () => {
  const { t } = useTranslation();

  return (
    <AboutHero
      kicker={t("about.partners.kicker")}
      title={t("about.partners.title")}
      subtitle={t("about.partners.subtitle")}
    >
      <Reveal>
        <ul className="pfm-partner-grid">
          {PARTNERS.map((partner) => (
            <li key={partner.key}>
              <PartnerTile partner={partner} name={t(`about.partners.items.${partner.key}`)} />
            </li>
          ))}
        </ul>
      </Reveal>
    </AboutHero>
  );
};

export default PartnersPage;
