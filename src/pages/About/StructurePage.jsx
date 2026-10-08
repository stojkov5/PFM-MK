// src/pages/About/StructurePage.jsx
// Shows the official organisational-structure PDF (the same file listed on
// the Documents page) with open/download buttons.
import React from "react";
import { FiEye, FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import AboutHero from "./AboutHero.jsx";

const PDF = encodeURI("/documents/Организациска Структура.pdf");

const StructurePage = () => {
  const { t } = useTranslation();

  return (
    <AboutHero
      kicker={t("about.structure.kicker")}
      title={t("about.structure.title")}
      subtitle={t("about.structure.subtitle")}
    >
      <Reveal>
        <div className="pfm-aboutpg-actions">
          <a className="pfm-aboutpg-btn is-primary" href={PDF} target="_blank" rel="noopener noreferrer">
            <FiEye /> {t("documents.actions.preview")}
          </a>
          <a className="pfm-aboutpg-btn" href={PDF} download>
            <FiDownload /> {t("documents.actions.download")}
          </a>
        </div>

        <div className="pfm-aboutpg-pdf">
          <iframe src={`${PDF}#view=FitH`} title={t("about.structure.title")} loading="lazy" />
        </div>
        <p className="pfm-aboutpg-hint">{t("about.structure.hint")}</p>
      </Reveal>
    </AboutHero>
  );
};

export default StructurePage;
