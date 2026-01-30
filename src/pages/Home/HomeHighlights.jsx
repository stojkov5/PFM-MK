import React from "react";
import { Row, Col, Button, Table, Tag } from "antd";
import { FiArrowRight, FiCalendar, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./HomeHighlights.css";

const HomeHighlights = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ✅ Dummy data (replace later with API)
  const news = [
    {
      id: 1,
      title: t("homeHighlights.news.0.title"),
      excerpt: t("homeHighlights.news.0.excerpt"),
      date: "12.01.2026",
      tag: t("homeHighlights.news.0.tag"),
      link: "/news",
    },
    {
      id: 2,
      title: t("homeHighlights.news.1.title"),
      excerpt: t("homeHighlights.news.1.excerpt"),
      date: "08.01.2026",
      tag: t("homeHighlights.news.1.tag"),
      link: "/swimming/criteria",
    },
    {
      id: 3,
      title: t("homeHighlights.news.2.title"),
      excerpt: t("homeHighlights.news.2.excerpt"),
      date: "04.01.2026",
      tag: t("homeHighlights.news.2.tag"),
      link: "/distance-swimming/ohrid-marathon",
    },
  ];

  const columns = [
    {
      title: t("homeHighlights.table.date"),
      dataIndex: "date",
      key: "date",
      width: 110,
      render: (v) => <span className="pfm-table-date">{v}</span>,
    },
    {
      title: t("homeHighlights.table.event"),
      dataIndex: "event",
      key: "event",
      render: (v) => <span className="pfm-table-event">{v}</span>,
    },
    {
      title: t("homeHighlights.table.type"),
      dataIndex: "type",
      key: "type",
      width: 140,
      render: (v) => (
        <Tag className="pfm-tag" bordered={false}>
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <section className="pfm-home-section">
      <div className="pfm-home-inner max-w-6xl mx-auto px-4 md:px-6">
        <Row gutter={[22, 22]} align="stretch">
          {/* LEFT: Latest News */}
          <Col xs={24} lg={14}>
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
                {news.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="pfm-news-item"
                    onClick={() => navigate(n.link)}
                  >
                    <div className="pfm-news-top">
                      <span className="pfm-news-tag">{n.tag}</span>
                      <span className="pfm-news-date">{n.date}</span>
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
          </Col>

          {/* RIGHT: Upcoming Events */}
          <Col xs={24} lg={10}>
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

              <Table
                columns={columns}
                className="pfm-table"
                rowClassName={() => "pfm-table-row"}
              />

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
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeHighlights;
