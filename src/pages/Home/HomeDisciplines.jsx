import React from "react";
import { Row, Col, Button } from "antd";
import { FiArrowRight } from "react-icons/fi";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./HomeDisciplines.css";

const HomeDisciplines = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = [
    {
      key: "swimming",
      image: "/Images/Swim.webp",
      icon: <TbSwimming />,
      bulletsCount: 3,
      primaryTo: "/swimming",
      secondaryTo: "/swimming/records",
    },
    {
      key: "waterpolo",
      image: "/Images/Waterpolo.webp",
      icon: <TbWaterpolo />,
      bulletsCount: 3,
      primaryTo: "/waterpolo/programs",
      secondaryTo: "/waterpolo/calendar-national",
    },
    {
      key: "distance",
      image: "/Images/Distance.webp",
      icon: <TiWaves />,
      bulletsCount: 3,
      primaryTo: "/distance-swimming/calendar",
      secondaryTo: "/distance-swimming/ohrid-marathon",
    },
  ];

  return (
    <section className="pfm-disciplines-section">
      <div className="pfm-disciplines-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-disciplines-head">
          <div className="pfm-disciplines-kicker">{t("homeDisciplines.kicker")}</div>
          <h2 className="pfm-disciplines-title">{t("homeDisciplines.title")}</h2>
          <p className="pfm-disciplines-subtitle">{t("homeDisciplines.subtitle")}</p>
        </div>

        <Row gutter={[18, 18]} align="stretch">
          {items.map((it) => (
            <Col xs={24} lg={8} key={it.key}>
              <div className="pfm-discipline-card">
                <div
                  className="pfm-discipline-image"
                  style={{ backgroundImage: `url(${it.image})` }}
                >
                  <div className="pfm-discipline-image-overlay" />
                </div>

                <div className="pfm-discipline-top">
                  <div className="pfm-discipline-icon">{it.icon}</div>
                  <div className="pfm-discipline-title">
                    {t(`homeDisciplines.items.${it.key}.title`)}
                  </div>
                </div>

                <div className="pfm-discipline-desc">
                  {t(`homeDisciplines.items.${it.key}.desc`)}
                </div>

                <ul className="pfm-discipline-list">
                  {Array.from({ length: it.bulletsCount }).map((_, idx) => (
                    <li key={`${it.key}-${idx}`} className="pfm-discipline-li">
                      <span className="pfm-dot" />
                      <span>{t(`homeDisciplines.items.${it.key}.bullets.${idx}`)}</span>
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
                    {t(`homeDisciplines.items.${it.key}.primaryText`)} <FiArrowRight />
                  </Button>

                  <Button
                    size="large"
                    className="pfm-discipline-ghost"
                    onClick={() => navigate(it.secondaryTo)}
                  >
                    {t(`homeDisciplines.items.${it.key}.secondaryText`)} <FiArrowRight />
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
