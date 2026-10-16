// src/pages/Swimming/Criteria.jsx
// Swimming criteria: the federation's criteria documents as a plain list of
// PDFs (same list as the Documents page) — qualification norms for each
// international competition and the national championship limits.
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import DocList from "../../components/DocList.jsx";
import "./Records.css";

// The PDFs in public/criteria/. Titles and descriptions are translated:
// criteria.events.<key>.title / .subtitle in the locales.
const CRITERIA_DOCS = [
  { key: "graz", href: "/criteria/МУЛТИНАЦИИ АВСТРИЈА, ГРАЦ 50м.pdf" },
  { key: "prague", href: "/criteria/МУЛТИНАЦИИ ПРАГА, ЧЕШКА.pdf" },
  { key: "comen", href: "/criteria/КОМЕН Куп СРБИЈА, Белград 50м.pdf" },
  { key: "ljubljana", href: "/criteria/ЦЕНТРАЛНО ЕВРОПСКО ПРВЕНСТВО СЛОВЕНИЈА, ЉУБЉАНА 50м.pdf" },
  { key: "juniors", href: "/criteria/ЕВРОПСКО ПРВЕНСТВО ВО ПЛИВАЊЕ 50м - Јуниори ГЕРМАНИЈА.pdf" },
  { key: "seniors", href: "/criteria/ЕВРОПСКО ПРВЕНСТВО ВО ПЛИВАЊЕ 50м - Сениори ПАРИЗ.pdf" },
  { key: "national", href: "/criteria/ДРЖАВНО ПРВЕНСТВО, ЛИМИТИ_1.pdf" },
];

const Criteria = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-rec pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-rec-head">
            <div className="pfm-rec-kicker">{t("criteria.kicker")}</div>
            <h2 className="pfm-rec-title">{t("criteria.title")}</h2>
            <p className="pfm-rec-sub">{t("criteria.subtitle")}</p>
          </header>
        </Reveal>

        <DocList
          items={CRITERIA_DOCS.map((doc) => ({
            key: doc.key,
            href: doc.href,
            title: t(`criteria.events.${doc.key}.title`),
            meta: t(`criteria.events.${doc.key}.subtitle`),
          }))}
        />
      </div>
    </div>
  );
};

export default Criteria;
