import React from "react";
import { Row, Col, Button } from "antd";
import { FiArrowRight, FiUsers, FiAward, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./HomeAbout.css";

const HomeAbout = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: <FiUsers />,
      value: "Клубови",
      label:
        "Регистрирани клубови и активни членки кои работат на развој на пливањето низ државата.",
    },
    {
      icon: <FiAward />,
      value: "Рекорди",
      label:
        "Официјална евиденција на национални рекорди по дисциплини, категории и базени (25м/50м).",
    },
    {
      icon: <FiMapPin />,
      value: "Натпревари",
      label:
        "Организација и санкционирање на национални натпревари, првенства и купови во текот на годината.",
    },
  ];

  return (
    <section className="pfm-about-section">
      <div className="pfm-about-inner max-w-6xl mx-auto px-4 md:px-6">
        <Row gutter={[22, 22]} align="middle">
          {/* LEFT: About text */}
          <Col xs={24} lg={13}>
            <div className="pfm-about-card">
              <div className="pfm-about-kicker">За федерацијата</div>

              <h2 className="pfm-about-title">
                Официјално национално тело за пливање, ватерполо и далечинско
                пливање
              </h2>

              <p className="pfm-about-text">
                Пливачката Федерација на Македонија работи на организација,
                развој и унапредување на пливачките спортови на национално ниво.
                Во соработка со клубовите, тренерите и стручните комисии,
                Федерацијата подготвува календар на натпревари, правилници,
                критериуми и официјални листи на рекорди, како и активности
                поврзани со репрезентативни селекции.
              </p>

              <div className="pfm-about-actions">
                <Button
                  type="primary"
                  size="large"
                  className="pfm-about-btn-primary"
                  onClick={() => navigate("/swimming/calendar-national")}
                >
                  Национален календар <FiArrowRight />
                </Button>

                <Button
                  size="large"
                  className="pfm-about-btn-ghost"
                  onClick={() => navigate("/swimming/records")}
                >
                  Национални рекорди <FiArrowRight />
                </Button>
              </div>

              <div className="pfm-about-note">
                Официјални документи и критериуми се објавуваат во соодветните
                секции по дисциплина (Swimming/Waterpolo/Distance Swimming).
              </div>
            </div>
          </Col>

          {/* RIGHT: Stats cards */}
          <Col xs={24} lg={11}>
            <div className="pfm-stats-wrap">
              {stats.map((s) => (
                <div key={s.value} className="pfm-stat">
                  <div className="pfm-stat-icon">{s.icon}</div>
                  <div className="pfm-stat-body">
                    <div className="pfm-stat-title">{s.value}</div>
                    <div className="pfm-stat-desc">{s.label}</div>
                  </div>
                </div>
              ))}

              <div className="pfm-stats-cta">
                <button
                  type="button"
                  className="pfm-stats-cta-btn"
                  onClick={() => navigate("/swimming/criteria")}
                >
                  Критериуми и правилници <FiArrowRight />
                </button>

                <button
                  type="button"
                  className="pfm-stats-cta-btn"
                  onClick={() => navigate("/news")}
                >
                  Соопштенија <FiArrowRight />
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeAbout;
