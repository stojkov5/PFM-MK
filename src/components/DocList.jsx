// src/components/DocList.jsx
// A plain numbered list of PDF documents (the /documents and swimming
// criteria pages): the title opens the PDF in a new tab, the arrow on the
// right downloads it.
// items: [{ key, title, meta?, href, downloadHref? }] — downloadHref when the
// file needs a different link to be saved (files served by the API).
import React from "react";
import { FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Documents.css";

const DocList = ({ items }) => {
  const { t } = useTranslation();

  return (
    <ol className="pfm-doclist">
      {items.map((doc, index) => {
        const href = encodeURI(doc.href);
        const downloadHref = doc.downloadHref ? encodeURI(doc.downloadHref) : href;
        return (
          <li key={doc.key} className="pfm-doclist-row" style={{ "--i": index }}>
            <a className="pfm-doclist-open" href={href} target="_blank" rel="noopener noreferrer">
              <span className="pfm-doclist-num">{String(index + 1).padStart(2, "0")}</span>
              <span className="pfm-doclist-text">
                <span className="pfm-doclist-title">{doc.title}</span>
                <span className="pfm-doclist-meta">
                  {[doc.meta, t("documents.pdfLabel")].filter(Boolean).join(" · ")}
                </span>
              </span>
            </a>
            <a
              className="pfm-doclist-dl"
              href={downloadHref}
              download
              aria-label={`${t("documents.actions.download")}: ${doc.title}`}
              title={t("documents.actions.download")}
            >
              <FiDownload />
            </a>
          </li>
        );
      })}
    </ol>
  );
};

export default DocList;
