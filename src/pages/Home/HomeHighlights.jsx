import React from "react";
import { Row, Col, Button } from "antd";
import { FiArrowRight, FiCalendar, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../lib/api.js";
import { categoryLabelKey, formatNewsDate } from "../../lib/news.js";
import Reveal from "../../components/fx/Reveal.jsx";
import { useCompetitions } from "../../components/competitions/hooks.js";
import { formatRange, todayString } from "../../lib/competitions.js";
import "./HomeHighlights.css";

const HomeHighlights = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // The three most recent published articles.
  const latest = useQuery({
    queryKey: ["news", "latest"],
    queryFn: () => apiGet("/api/news?limit=3"),
  });
  const news = latest.data?.items ?? [];

  // The next few approved competitions from the calendar.
  const competitions = useCompetitions();
  const today = todayString();
  const upcoming = (competitions.data?.competitions ?? [])
    .filter((c) => c.endDate >= today)
    .slice(0, 4);

  return (
    <section className="pfm-home-section">
      <div className="pfm-home-inner max-w-6xl mx-auto px-4 md:px-6">
        <Row gutter={[22, 22]} align="stretch">
          {/* LEFT: Latest News */}
          <Col xs={24} lg={14}>
            <Reveal className="pfm-card-reveal">
            <div className="pfm-card pfm-card-news">
              <div className="pfm-card-head">
                <div className="pfm-card-title">
                  <FiBell /> {t("homeHighlights.latestNews")}
                </div>
                <Button
                  type="link"
                  className="pfm-link-btn"
                  onClick={() => navigate("/news")}
                >
                  {t("homeHighlights.viewMore")} <FiArrowRight />
                </Button>
              </div>

              <div className="pfm-news-grid">
                {news.length === 0 && (
                  <p className="pfm-news-excerpt">
                    {latest.isPending
                      ? t("news.loading")
                      : latest.isError
                        ? t("news.error")
                        : t("news.empty")}
                  </p>
                )}
                {news.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="pfm-news-item"
                    onClick={() => navigate(`/news/${n.slug}`)}
                  >
                    <div className="pfm-news-top">
                      <span className="pfm-news-tag">{t(categoryLabelKey(n.category))}</span>
                      <span className="pfm-news-date">
                        {formatNewsDate(n.publishedAt, i18n.resolvedLanguage)}
                      </span>
                    </div>

                    <div className="pfm-news-title">{n.title}</div>
                    <div className="pfm-news-excerpt">{n.excerpt}</div>

                    <div className="pfm-news-cta">
                      {t("homeHighlights.read")} <FiArrowRight />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            </Reveal>
          </Col>

          {/* RIGHT: Upcoming Events */}
          <Col xs={24} lg={10}>
            <Reveal delay={0.12} className="pfm-card-reveal">
            <div className="pfm-card pfm-card-events">
              <div className="pfm-card-head">
                <div className="pfm-card-title">
                  <FiCalendar /> {t("homeHighlights.upcomingEvents")}
                </div>
                <Button
                  type="link"
                  className="pfm-link-btn"
                  onClick={() => navigate("/swimming/calendar-national")}
                >
                  {t("homeHighlights.calendar")} <FiArrowRight />
                </Button>
              </div>

              {upcoming.length === 0 ? (
                <p className="pfm-news-excerpt">
                  {competitions.isPending ? "…" : t("competitions.upcoming.empty")}
                </p>
              ) : (
                <ul className="pfm-events-list">
                  {upcoming.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="pfm-event-item"
                        onClick={() => navigate("/swimming/calendar-national")}
                      >
                        <span className="pfm-event-date">
                          {formatRange(c.startDate, c.endDate, i18n.resolvedLanguage)}
                        </span>
                        <span className="pfm-event-main">
                          <span className="pfm-event-name">{c.name}</span>
                          <span className="pfm-event-meta">
                            {c.city} · {t(`competitions.courses.${c.course}`)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pfm-events-foot">
                <Button
                  size="large"
                  className="pfm-btn-outline"
                  onClick={() => navigate("/swimming/calendar-national")}
                >
                  {t("homeHighlights.openNationalCalendar")} <FiArrowRight />
                </Button>
              </div>
            </div>
            </Reveal>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeHighlights;
