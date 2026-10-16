// src/pages/DistanceSwimming/DistanceSwimmingCriteria.jsx
// Distance swimming criteria as downloadable PDFs (same list as the swimming
// criteria and Documents pages). None are published yet: put the PDF in
// public/criteria/ and add it to CRITERIA_DOCS, with its title and description
// under distance.criteria.docs.<key> in the locales.
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import DocList from "../../components/DocList.jsx";
import "../Swimming/Records.css";
import "../News/News.css";

const CRITERIA_DOCS = [];

const DistanceSwimmingCriteria = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-rec pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-rec-head">
            <div className="pfm-rec-kicker">{t("distance.criteria.kicker")}</div>
            <h2 className="pfm-rec-title">{t("distance.criteria.title")}</h2>
            <p className="pfm-rec-sub">{t("distance.criteria.subtitle")}</p>
          </header>
        </Reveal>

        {CRITERIA_DOCS.length === 0 ? (
          <p className="pfm-articles-state">{t("distance.criteria.empty")}</p>
        ) : (
          <DocList
            items={CRITERIA_DOCS.map((doc) => ({
              key: doc.key,
              href: doc.href,
              title: t(`distance.criteria.docs.${doc.key}.title`),
              meta: t(`distance.criteria.docs.${doc.key}.subtitle`),
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default DistanceSwimmingCriteria;
