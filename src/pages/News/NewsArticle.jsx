// src/pages/News/NewsArticle.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FiArrowLeft } from "react-icons/fi";
import { apiGet, apiUrl } from "../../lib/api.js";
import { categoryLabelKey, formatNewsDate } from "../../lib/news.js";
import RichContent from "./RichContent.jsx";
import "./News.css";

const NewsArticle = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();

  const article = useQuery({
    queryKey: ["news", "article", slug],
    queryFn: () => apiGet(`/api/news/${encodeURIComponent(slug)}`),
    retry: (count, err) => err.status !== 404 && count < 2,
  });

  const back = (
    <Link to="/news" className="pfm-article-back">
      <FiArrowLeft /> {t("news.back")}
    </Link>
  );

  if (article.isPending) {
    return (
      <section className="pfm-articles">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="pfm-articles-state">{t("news.loading")}</p>
        </div>
      </section>
    );
  }

  if (article.isError) {
    const missing = article.error.status === 404;
    return (
      <section className="pfm-articles">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {back}
          <div className="pfm-articles-state">
            <p>{missing ? t("news.notFound") : t("news.error")}</p>
            {!missing && (
              <button type="button" className="pfm-articles-more" onClick={() => article.refetch()}>
                {t("news.retry")}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const a = article.data;
  return (
    <section className="pfm-articles">
      <article className="max-w-4xl mx-auto px-4 md:px-6">
        {back}
        <header className="pfm-article-head">
          <div className="pfm-articles-meta">
            <Link to={`/news?category=${a.category}`} className="pfm-articles-tag">
              {t(categoryLabelKey(a.category))}
            </Link>
            <span className="pfm-articles-date">
              {formatNewsDate(a.publishedAt, i18n.resolvedLanguage)}
            </span>
          </div>
          <h1 className="pfm-article-title">{a.title}</h1>
        </header>

        <div className="pfm-article-paper">
          {a.coverImage && (
            <img className="pfm-article-cover" src={apiUrl(a.coverImage)} alt="" />
          )}
          <RichContent html={a.content} className="pfm-article-content" />
        </div>
      </article>
    </section>
  );
};

export default NewsArticle;
