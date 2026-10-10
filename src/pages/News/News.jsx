// src/pages/News/News.jsx
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { TiWaves } from "react-icons/ti";
import Reveal from "../../components/fx/Reveal.jsx";
import { apiGet, apiUrl } from "../../lib/api.js";
import { NEWS_CATEGORIES, categoryLabelKey, formatNewsDate } from "../../lib/news.js";
import "./News.css";

const PAGE_SIZE = 9;

export const ArticleCard = ({ article }) => {
  const { t, i18n } = useTranslation();
  return (
    <Link to={`/news/${article.slug}`} className="pfm-articles-card">
      <div className="pfm-articles-cover">
        {article.coverImage ? (
          <img src={apiUrl(article.coverImage)} alt="" loading="lazy" />
        ) : (
          <TiWaves className="pfm-articles-cover-icon" />
        )}
      </div>
      <div className="pfm-articles-body">
        <div className="pfm-articles-meta">
          <span className="pfm-articles-tag">{t(categoryLabelKey(article.category))}</span>
          <span className="pfm-articles-date">
            {formatNewsDate(article.publishedAt, i18n.resolvedLanguage)}
          </span>
        </div>
        <h2 className="pfm-articles-card-title">{article.title}</h2>
        {article.excerpt && <p className="pfm-articles-excerpt">{article.excerpt}</p>}
        <span className="pfm-articles-cta">
          {t("news.readMore")} <FiArrowRight />
        </span>
      </div>
    </Link>
  );
};

/**
 * The news listing. Pass `category` to lock it to one category (used by the
 * distance swimming section); otherwise visitors can filter with the chips.
 */
const News = ({ category: fixedCategory, title, subtitle }) => {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const picked = params.get("category");
  const category = fixedCategory ?? (NEWS_CATEGORIES.includes(picked) ? picked : null);

  const news = useInfiniteQuery({
    queryKey: ["news", "list", category],
    queryFn: ({ pageParam }) =>
      apiGet(
        `/api/news?limit=${PAGE_SIZE}&offset=${pageParam}${category ? `&category=${category}` : ""}`
      ),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });

  const articles = news.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <section className="pfm-articles">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <span className="pfm-articles-kicker">{t("news.kicker")}</span>
          <h1 className="pfm-articles-title pfm-lane-underline pfm-lane-underline-left">
            {title ?? t("news.title")}
          </h1>
          <p className="pfm-articles-sub">{subtitle ?? t("news.subtitle")}</p>
        </Reveal>

        {!fixedCategory && (
          <div className="pfm-articles-filters" role="group" aria-label={t("news.filterLabel")}>
            {[null, ...NEWS_CATEGORIES].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                className={`pfm-articles-chip ${category === c ? "is-active" : ""}`}
                aria-pressed={category === c}
                onClick={() => setParams(c ? { category: c } : {}, { replace: true })}
              >
                {c ? t(categoryLabelKey(c)) : t("news.all")}
              </button>
            ))}
          </div>
        )}

        {news.isPending ? (
          <p className="pfm-articles-state">{t("news.loading")}</p>
        ) : news.isError ? (
          <div className="pfm-articles-state">
            <p>{t("news.error")}</p>
            <button type="button" className="pfm-articles-more" onClick={() => news.refetch()}>
              {t("news.retry")}
            </button>
          </div>
        ) : articles.length === 0 ? (
          <p className="pfm-articles-state">
            {category ? t("news.emptyCategory") : t("news.empty")}
          </p>
        ) : (
          <>
            <div className="pfm-articles-grid">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            {news.hasNextPage && (
              <div className="pfm-articles-more-wrap">
                <button
                  type="button"
                  className="pfm-articles-more"
                  disabled={news.isFetchingNextPage}
                  onClick={() => news.fetchNextPage()}
                >
                  {news.isFetchingNextPage ? t("news.loading") : t("news.loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default News;
