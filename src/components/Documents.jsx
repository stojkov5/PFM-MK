import React from "react";
import {
  FiFileText,
  FiEye,
  FiDownload,
  FiShield,
  FiUsers,
  FiBookOpen,
  FiClipboard,
  FiGitBranch,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Documents.css";
const Documents = () => {
  const { t } = useTranslation();

  const documents = [
    {
      id: 1,
      title: t("documents.items.statute.title"),
      category: t("documents.items.statute.category"),
      description: t("documents.items.statute.description"),
      icon: <FiBookOpen />,
      href: "/documents/Статут-Национална-Пливачка-Федерација.pdf",
      accent: "blue",
    },
    {
      id: 2,
      title: t("documents.items.registration.title"),
      category: t("documents.items.registration.category"),
      description: t("documents.items.registration.description"),
      icon: <FiClipboard />,
      href: "/documents/Регистрационен Правилник.pdf",
      accent: "emerald",
    },
    {
      id: 3,
      title: t("documents.items.disciplinary.title"),
      category: t("documents.items.disciplinary.category"),
      description: t("documents.items.disciplinary.description"),
      icon: <FiShield />,
      href: "/documents/Дисциплински Правилник.pdf",
      accent: "rose",
    },
    {
      id: 4,
      title: t("documents.items.championships.title"),
      category: t("documents.items.championships.category"),
      description: t("documents.items.championships.description"),
      icon: <FiUsers />,
      href: "/documents/Правилник за Национални првенства НПФ (1).pdf",
      accent: "amber",
    },
    {
      id: 5,
      title: t("documents.items.structure.title"),
      category: t("documents.items.structure.category"),
      description: t("documents.items.structure.description"),
      icon: <FiGitBranch />,
      href: "/documents/Организациска Структура.pdf",
      accent: "violet",
    },
  ];

  return (
    <section className="pfm-documents-page">
      <div className="pfm-documents-hero">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <span className="pfm-documents-kicker">
            {t("documents.hero.kicker")}
          </span>

          <h1 className="pfm-documents-title">
            {t("documents.hero.title")}
          </h1>

          <p className="pfm-documents-subtitle">
            {t("documents.hero.subtitle")}
          </p>

          <div className="pfm-documents-stats">
            <div className="pfm-documents-stat">
              <strong>{t("documents.stats.documents.value")}</strong>
              <span>{t("documents.stats.documents.label")}</span>
            </div>

            <div className="pfm-documents-stat">
              <strong>{t("documents.stats.format.value")}</strong>
              <span>{t("documents.stats.format.label")}</span>
            </div>

            <div className="pfm-documents-stat">
              <strong>{t("documents.stats.source.value")}</strong>
              <span>{t("documents.stats.source.label")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pfm-documents-body max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-documents-grid">
          {documents.map((doc) => (
            <article
              key={doc.id}
              className={`pfm-document-card pfm-document-card--${doc.accent}`}
            >
              <div className="pfm-document-card-top">
                <div className="pfm-document-icon-wrap">{doc.icon}</div>

                <div className="pfm-document-meta">
                  <span className="pfm-document-badge">{doc.category}</span>
                  <h3>{doc.title}</h3>
                </div>
              </div>

              <p className="pfm-document-desc">{doc.description}</p>

              <div className="pfm-document-footer">
                <div className="pfm-document-filetype">
                  <FiFileText />
                  <span>{t("documents.pdfLabel")}</span>
                </div>

                <div className="pfm-document-actions">
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noreferrer"
                    className="pfm-document-btn pfm-document-btn-primary"
                  >
                    <FiEye />
                    <span>{t("documents.actions.preview")}</span>
                  </a>

                  <a
                    href={doc.href}
                    download
                    className="pfm-document-btn pfm-document-btn-secondary"
                  >
                    <FiDownload />
                    <span>{t("documents.actions.download")}</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Documents;