// src/components/CriteriaPage.jsx
// A sport's Criteria page: the criteria PDFs an admin added in the Criteria
// tab, as a list where each one can be opened or downloaded.
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "./fx/Reveal.jsx";
import DocList from "./DocList.jsx";
import { apiUrl } from "../lib/api.js";
import { useCriteria } from "../lib/criteria.js";
import "../pages/Swimming/Records.css";
import "../pages/News/News.css";

const CriteriaPage = ({ sport, kicker, title, subtitle, emptyText }) => {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useCriteria(sport);

  let body;
  if (isPending) {
    body = <p className="pfm-articles-state">{t("news.loading")}</p>;
  } else if (isError) {
    body = (
      <div className="pfm-articles-state">
        <p>{t("criteria.loadError")}</p>
        <button type="button" className="pfm-articles-more" onClick={() => refetch()}>
          {t("news.retry")}
        </button>
      </div>
    );
  } else if (data.length === 0) {
    body = <p className="pfm-articles-state">{emptyText}</p>;
  } else {
    body = (
      <DocList
        items={data.map((doc) => ({
          key: doc.id,
          title: doc.title,
          meta: doc.description,
          href: apiUrl(doc.url),
          downloadHref: apiUrl(`${doc.url}?download=1`),
        }))}
      />
    );
  }

  return (
    <div className="pfm-rec pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-rec-head">
            <div className="pfm-rec-kicker">{kicker}</div>
            <h2 className="pfm-rec-title">{title}</h2>
            <p className="pfm-rec-sub">{subtitle}</p>
          </header>
        </Reveal>
        {body}
      </div>
    </div>
  );
};

export default CriteriaPage;
