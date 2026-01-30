import React from "react";
import { Row, Col, Button } from "antd";
import { FiArrowRight, FiUsers, FiAward, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./HomeAbout.css";
import { Link } from "react-router-dom";

const HomeAbout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats = [
    {
      icon: <FiUsers />,
      value: t("homeAbout.stats.0.value"),
      label: t("homeAbout.stats.0.label"),
      to: "/swimming/clubs",
    },
    {
      icon: <FiAward />,
      value: t("homeAbout.stats.1.value"),
      label: t("homeAbout.stats.1.label"),
      to: "/swimming/records",
    },
    {
      icon: <FiMapPin />,
      value: t("homeAbout.stats.2.value"),
      label: t("homeAbout.stats.2.label"),
      to: "/swimming/calendar-national",
    },
  ];

  return (
    <section className="pfm-about-section">
      <div className="pfm-about-inner max-w-6xl mx-auto px-4 md:px-6">
        <Row gutter={[22, 22]} align="middle">
          {/* LEFT: About text */}
          <Col xs={24} lg={13}>
            <div className="pfm-about-card">
              <div className="pfm-about-kicker">{t("homeAbout.kicker")}</div>

              <h2 className="pfm-about-title">{t("homeAbout.title")}</h2>

              <p className="pfm-about-text">{t("homeAbout.text")}</p>

              <div className="pfm-about-actions">
                <Button
                  type="primary"
                  size="large"
                  className="pfm-about-btn-primary"
                  onClick={() => navigate("/swimming/calendar-national")}
                >
                  {t("homeAbout.actions.nationalCalendar")} <FiArrowRight />
                </Button>

                <Button
                  size="large"
                  className="pfm-about-btn-ghost"
                  onClick={() => navigate("/swimming/records")}
                >
                  {t("homeAbout.actions.nationalRecords")} <FiArrowRight />
                </Button>
              </div>

              <div className="pfm-about-note">{t("homeAbout.note")}</div>
            </div>
          </Col>

          {/* RIGHT: Stats cards */}
          <Col xs={24} lg={11}>
            <div className="pfm-stats-wrap">
              {stats.map((s) => (
                <Link key={s.to} to={s.to} className="pfm-stat-link">
                  <div className="pfm-stat">
                    <div className="pfm-stat-icon">{s.icon}</div>
                    <div className="pfm-stat-body">
                      <div className="pfm-stat-title">{s.value}</div>
                      <div className="pfm-stat-desc">{s.label}</div>
                    </div>
                  </div>
                </Link>
              ))}

              <div className="pfm-stats-cta">
                <button
                  type="button"
                  className="pfm-stats-cta-btn"
                  onClick={() => navigate("/swimming/criteria")}
                >
                  {t("homeAbout.actions.criteriaRules")} <FiArrowRight />
                </button>

                <button
                  type="button"
                  className="pfm-stats-cta-btn"
                  onClick={() => navigate("/news")}
                >
                  {t("homeAbout.actions.announcements")} <FiArrowRight />
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
