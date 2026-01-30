// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";
import { FiArrowRight, FiAward } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickLinks = [
    {
      key: "swimming",
      icon: <TbSwimming />,
      href: "/swimming",
      chips: ["programs", "calendar", "records"],
    },
    {
      key: "waterpolo",
      icon: <TbWaterpolo />,
      href: "/waterpolo/programs",
      chips: ["programs", "calendar", "criteria"],
    },
    {
      key: "distance",
      icon: <TiWaves />,
      href: "/distance-swimming/calendar",
      chips: ["calendar", "ohridMarathon", "news"],
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
                <span>{t("landing.badge")}</span>
              </div>

              <h1 className="pfm-hero-title">
                {t("landing.titleLine1")}
                <br />
                {t("landing.titleLine2")}
              </h1>

              <p className="pfm-hero-subtitle">{t("landing.subtitle")}</p>

              <div className="pfm-hero-actions">
                <Button
                  type="primary"
                  size="large"
                  className="pfm-btn-primary"
                  onClick={() => navigate("/news")}
                >
                  {t("landing.actions.news")} <FiArrowRight />
                </Button>

                <Button
                  size="large"
                  className="pfm-btn-ghost"
                  onClick={() =>
                    window.scrollTo({
                      top: window.innerHeight,
                      behavior: "smooth",
                    })
                  }
                >
                  {t("landing.actions.browse")}
                </Button>
              </div>

              <div className="pfm-hero-meta">
                <div className="pfm-hero-meta-item">
                  <div className="pfm-hero-meta-label">
                    {t("landing.meta.focusLabel")}
                  </div>
                  <div className="pfm-hero-meta-value">
                    {t("landing.meta.focusValue")}
                  </div>
                </div>
                <div className="pfm-hero-meta-item">
                  <div className="pfm-hero-meta-label">
                    {t("landing.meta.infoLabel")}
                  </div>
                  <div className="pfm-hero-meta-value">
                    {t("landing.meta.infoValue")}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} lg={11}>
            <div className="pfm-hero-right">
              <div className="pfm-hero-card">
                <div className="pfm-hero-card-top">
                  <div className="pfm-hero-card-title">
                    {t("landing.quickAccess.title")}
                  </div>
                  <div className="pfm-hero-card-sub">
                    {t("landing.quickAccess.subtitle")}
                  </div>
                </div>

                <div className="pfm-quick-grid">
                  {quickLinks.map((q) => (
                    <button
                      key={q.key}
                      type="button"
                      className="pfm-quick-item"
                      onClick={() => navigate(q.href)}
                    >
                      <div className="pfm-quick-icon">{q.icon}</div>

                      <div className="pfm-quick-body">
                        <div className="pfm-quick-title">
                          {t(`landing.quickLinks.${q.key}.title`)}
                        </div>
                        <div className="pfm-quick-desc">
                          {t(`landing.quickLinks.${q.key}.desc`)}
                        </div>

                        <div className="pfm-quick-chips">
                          {q.chips.map((c) => (
                            <span key={c} className="pfm-chip">
                              {t(`landing.quickLinks.chips.${c}`)}
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
