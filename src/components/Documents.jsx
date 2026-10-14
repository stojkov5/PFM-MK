// src/components/Documents.jsx
// /documents — the federation's documents as a plain list: the title opens the
// PDF in a new tab, the arrow on the right downloads it.
import React from "react";
import { FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Reveal from "./fx/Reveal.jsx";
import { DOCUMENTS } from "../data/documents.js";
import "./Documents.css";

const Documents = () => {
  const { t } = useTranslation();

  return (
    <section className="pfm-documents-page">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-documents-hero">
            <span className="pfm-documents-kicker">{t("documents.hero.kicker")}</span>
            <h1 className="pfm-documents-title">{t("documents.hero.title")}</h1>
            <p className="pfm-documents-subtitle">{t("documents.hero.subtitle")}</p>
          </header>
        </Reveal>

        <ol className="pfm-doclist">
          {DOCUMENTS.map((doc, index) => {
            const href = encodeURI(doc.href);
            const title = t(`documents.items.${doc.key}.title`);
            return (
              <li key={doc.key} className="pfm-doclist-row" style={{ "--i": index }}>
                <a className="pfm-doclist-open" href={href} target="_blank" rel="noopener noreferrer">
                  <span className="pfm-doclist-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="pfm-doclist-text">
                    <span className="pfm-doclist-title">{title}</span>
                    <span className="pfm-doclist-meta">
                      {t(`documents.items.${doc.key}.category`)} · {t("documents.pdfLabel")}
                    </span>
                  </span>
                </a>
                <a
                  className="pfm-doclist-dl"
                  href={href}
                  download
                  aria-label={`${t("documents.actions.download")}: ${title}`}
                  title={t("documents.actions.download")}
                >
                  <FiDownload />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Documents;
