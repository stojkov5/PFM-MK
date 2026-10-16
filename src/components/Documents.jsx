// src/components/Documents.jsx
// /documents — the federation's documents as a plain list (see DocList).
import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "./fx/Reveal.jsx";
import DocList from "./DocList.jsx";
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

        <DocList
          items={DOCUMENTS.map((doc) => ({
            key: doc.key,
            href: doc.href,
            title: t(`documents.items.${doc.key}.title`),
            meta: t(`documents.items.${doc.key}.category`),
          }))}
        />
      </div>
    </section>
  );
};

export default Documents;
