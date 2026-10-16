// src/pages/About/PartnersPage.jsx
// Logo grid of the federations and institutions we work with
// (src/data/partners.js).
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import AboutHero from "./AboutHero.jsx";
import PartnerTile from "./PartnerTile.jsx";
import { PARTNERS } from "../../data/partners.js";

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
