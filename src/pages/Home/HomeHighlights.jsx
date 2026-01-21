import React from "react";
import { Row, Col, Button, Table, Tag } from "antd";
import { FiArrowRight, FiCalendar, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./HomeHighlights.css";

const HomeHighlights = () => {
  const navigate = useNavigate();

  // ✅ Dummy data (replace later with API)
  const news = [
    {
      id: 1,
      title: "Објава на национален календар – Пливање (2026)",
      excerpt:
        "Објавен е прелиминарниот календар за национални натпревари, категории и локации.",
      date: "12.01.2026",
      tag: "SWIMMING",
      link: "/news",
    },
    {
      id: 2,
      title: "Критериуми за селекции и меѓународни настапи",
      excerpt:
        "Ажурирани критериуми за избор во селекции и услови за настап на меѓународни натпревари.",
      date: "08.01.2026",
      tag: "DOCUMENT",
      link: "/swimming/criteria",
    },
    {
      id: 3,
      title: "Информации за Охридски Пливачки Маратон",
      excerpt:
        "Отворени се информациите за дистанци, пријавување, безбедносни правила и протокол.",
      date: "04.01.2026",
      tag: "OPEN WATER",
      link: "/distance-swimming/ohrid-marathon",
    },
  ];

  const columns = [
    {
      title: "Датум",
      dataIndex: "date",
      key: "date",
      width: 110,
      render: (v) => <span className="pfm-table-date">{v}</span>,
    },
    {
      title: "Настан",
      dataIndex: "event",
      key: "event",
      render: (v) => <span className="pfm-table-event">{v}</span>,
    },
    {
      title: "Тип",
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

  const data = [
    {
      key: "1",
      date: "20.01.2026",
      event: "Куп натпревар – Пливање (Кадети/Јуниори)",
      type: "National",
    },
    {
      key: "2",
      date: "02.02.2026",
      event: "Државно првенство – Зима (25m)",
      type: "Championship",
    },
    {
      key: "3",
      date: "15.02.2026",
      event: "Ватерполо коло – Национална лига",
      type: "Waterpolo",
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
                  <FiBell /> Најнови вести
                </div>
                <Button
                  type="link"
                  className="pfm-link-btn"
                  onClick={() => navigate("/news")}
                >
                  Види повеќе <FiArrowRight />
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
                      Прочитај <FiArrowRight />
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
                  <FiCalendar /> Наредни настани
                </div>
                <Button
                  type="link"
                  className="pfm-link-btn"
                  onClick={() => navigate("/swimming/calendar-national")}
                >
                  Календар <FiArrowRight />
                </Button>
              </div>

              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                className="pfm-table"
                rowClassName={() => "pfm-table-row"}
              />

              <div className="pfm-events-foot">
                <Button
                  size="large"
                  className="pfm-btn-outline"
                  onClick={() => navigate("/swimming/calendar-national")}
                >
                  Отвори национален календар <FiArrowRight />
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
