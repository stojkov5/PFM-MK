import React from "react";
import { Row, Col, Button } from "antd";
import { FiArrowRight, FiDroplet, FiWind, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./HomeDisciplines.css";

const HomeDisciplines = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: "SWIMMING",
      icon: <FiDroplet />,
      desc:
        "Информации за програми, натпревари, национален и меѓународен календар, рекорди и критериуми за настап.",
      bullets: [
        "Национален календар и првенства",
        "Официјална листа на рекорди",
        "Критериуми и документи",
      ],
      primaryText: "Отвори Swimming",
      primaryTo: "/swimming/programs",
      secondaryText: "Рекорди",
      secondaryTo: "/swimming/records",
    },
    {
      title: "WATERPOLO",
      icon: <FiWind />,
      desc:
        "Програми и официјални информации за ватерполо натпревари, како и календар за национални и меѓународни настани.",
      bullets: [
        "Календар – Национален",
        "Календар – Меѓународен",
        "Критериуми / правилници",
      ],
      primaryText: "Отвори Waterpolo",
      primaryTo: "/waterpolo/programs",
      secondaryText: "Календар",
      secondaryTo: "/waterpolo/calendar-national",
    },
    {
      title: "DISTANCE SWIMMING",
      icon: <FiCalendar />,
      desc:
        "Далечинско пливање (open water) со календар на маратони, информации за настани и официјални новости.",
      bullets: [
        "Календар на маратони",
        "Охридски пливачки маратон",
        "Новости и известувања",
      ],
      primaryText: "Отвори Distance Swimming",
      primaryTo: "/distance-swimming/calendar",
      secondaryText: "Охрид маратон",
      secondaryTo: "/distance-swimming/ohrid-marathon",
    },
  ];

  return (
    <section className="pfm-disciplines-section">
      <div className="pfm-disciplines-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-disciplines-head">
          <div className="pfm-disciplines-kicker">Дисциплини</div>
          <h2 className="pfm-disciplines-title">
            Пливање, ватерполо и далечинско пливање
          </h2>
          <p className="pfm-disciplines-subtitle">
            Брз пристап до најважните информации по дисциплина: програми, календари,
            документи и официјални листи.
          </p>
        </div>

        <Row gutter={[18, 18]} align="stretch">
          {items.map((it) => (
            <Col xs={24} lg={8} key={it.title}>
              <div className="pfm-discipline-card">
                <div className="pfm-discipline-top">
                  <div className="pfm-discipline-icon">{it.icon}</div>
                  <div className="pfm-discipline-title">{it.title}</div>
                </div>

                <div className="pfm-discipline-desc">{it.desc}</div>

                <ul className="pfm-discipline-list">
                  {it.bullets.map((b) => (
                    <li key={b} className="pfm-discipline-li">
                      <span className="pfm-dot" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pfm-discipline-actions">
                  <Button
                    type="primary"
                    size="large"
                    className="pfm-discipline-primary"
                    onClick={() => navigate(it.primaryTo)}
                  >
                    {it.primaryText} <FiArrowRight />
                  </Button>

                  <Button
                    size="large"
                    className="pfm-discipline-ghost"
                    onClick={() => navigate(it.secondaryTo)}
                  >
                    {it.secondaryText} <FiArrowRight />
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default HomeDisciplines;
