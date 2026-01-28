// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { FiArrowRight, FiCalendar, FiDroplet, FiWind, FiAward } from "react-icons/fi";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "SWIMMING",
      desc: "Програми, календари, рекорди и критериуми.",
      icon: <FiDroplet />,
      href: "/swimming",
      chips: ["Programs", "Calendar", "Records"],
    },
    {
      title: "WATERPOLO",
      desc: "Програми и официјални информации за ватерполо натпревари.",
      icon: <FiWind />,
      href: "/waterpolo/programs",
      chips: ["Programs", "Calendar", "Criteria"],
    },
    {
      title: "DISTANCE SWIMMING",
      desc: "Маратони и настани на отворени води, календар и новости.",
      icon: <FiCalendar />,
      href: "/distance-swimming/calendar",
      chips: ["Calendar", "Ohrid Marathon", "News"],
    },
  ];

  return (
    <section className="pfm-landing pfm-landing-bg pt-24">
      {/* background overlays */}
      <div className="pfm-landing-overlay" aria-hidden="true" />
      <div className="pfm-landing-vignette" aria-hidden="true" />

      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Row gutter={[24, 24]} align="middle" className="pfm-landing-row">
          {/* LEFT */}
          <Col xs={24} lg={13}>
            <div className="pfm-hero-left">
              <div className="pfm-hero-badge">
                <FiAward className="pfm-hero-badge-icon" />
                <span>Официјална спортска федерација</span>
              </div>

              <h1 className="pfm-hero-title">
                Пливачка Федерација
                <br />
                на Македонија
              </h1>

              <p className="pfm-hero-subtitle">
                Национално тело за организација, развој и унапредување на пливачките спортови —
                пливање, ватерполо и далечинско пливање. Овде ќе ги најдеш календарите,
                критериумите, рекордите и официјалните соопштенија.
              </p>

              <div className="pfm-hero-actions">
                <Button
                  type="primary"
                  size="large"
                  className="pfm-btn-primary"
                  onClick={() => navigate("/news")}
                >
                  Вести и соопштенија <FiArrowRight />
                </Button>

                <Button
                  size="large"
                  className="pfm-btn-ghost"
                  onClick={() =>
                    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
                  }
                >
                  Прегледај содржина
                </Button>
              </div>

              <div className="pfm-hero-meta">
                <div className="pfm-hero-meta-item">
                  <div className="pfm-hero-meta-label">Фокус</div>
                  <div className="pfm-hero-meta-value">Натпревари • Рекорди • Развој</div>
                </div>
                <div className="pfm-hero-meta-item">
                  <div className="pfm-hero-meta-label">Информации</div>
                  <div className="pfm-hero-meta-value">Календар • Документи • Новости</div>
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} lg={11}>
            <div className="pfm-hero-right">
              <div className="pfm-hero-card">
                <div className="pfm-hero-card-top">
                  <div className="pfm-hero-card-title">Брз пристап</div>
                  <div className="pfm-hero-card-sub">
                    Избери област за да продолжиш.
                  </div>
                </div>

                <div className="pfm-quick-grid">
                  {quickLinks.map((q) => (
                    <button
                      key={q.title}
                      type="button"
                      className="pfm-quick-item"
                      onClick={() => navigate(q.href)}
                    >
                      <div className="pfm-quick-icon">{q.icon}</div>

                      <div className="pfm-quick-body">
                        <div className="pfm-quick-title">{q.title}</div>
                        <div className="pfm-quick-desc">{q.desc}</div>

                        <div className="pfm-quick-chips">
                          {q.chips.map((c) => (
                            <span key={c} className="pfm-chip">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <FiArrowRight className="pfm-quick-arrow" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pfm-hero-glow" aria-hidden="true" />
            </div>
          </Col>
        </Row>

        <div className="pfm-scroll-indicator" aria-hidden="true">
          <div className="pfm-scroll-dot" />
          <div className="pfm-scroll-line" />
        </div>
      </div>
    </section>
  );
};

export default Landing;
