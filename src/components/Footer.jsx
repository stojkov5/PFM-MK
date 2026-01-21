import React from "react";
import { Row, Col } from "antd";
import { NavLink } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiGlobe,
} from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  // ✅ Replace with real info later
  const contact = {
    email: "info@pfm.mk",
    phone: "+389 XX XXX XXX",
    address: "Скопје, Република Северна Македонија",
  };

  const year = new Date().getFullYear();

  return (
    <footer className="pfm-footer">
      <div className="pfm-footer-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-footer-card">
          <Row gutter={[22, 22]} align="top">
            {/* Links */}
            <Col xs={24} sm={12}>
              <div className="pfm-footer-col-title">Брзи линкови</div>
              <div className="pfm-footer-links">
                <NavLink className="pfm-footer-link" to="/news">
                  <span>Вести и соопштенија</span>
                  <FiArrowRight />
                </NavLink>

                <NavLink
                  className="pfm-footer-link"
                  to="/swimming/calendar-national"
                >
                  <span>Календар – National</span>
                  <FiArrowRight />
                </NavLink>

                <NavLink
                  className="pfm-footer-link"
                  to="/swimming/calendar-international"
                >
                  <span>Календар – International</span>
                  <FiArrowRight />
                </NavLink>

                <NavLink className="pfm-footer-link" to="/swimming/records">
                  <span>Record List</span>
                  <FiArrowRight />
                </NavLink>

                <NavLink className="pfm-footer-link" to="/swimming/criteria">
                  <span>Criteria / Документи</span>
                  <FiArrowRight />
                </NavLink>
              </div>
            </Col>

            {/* Contact */}
            <Col xs={24} sm={12}>
              <div className="pfm-footer-col-title">Контакт</div>

              <div className="pfm-footer-contact">
                <a
                  className="pfm-footer-contact-item"
                  href={`mailto:${contact.email}`}
                >
                  <span className="pfm-footer-ico">
                    <FiMail />
                  </span>
                  <span className="pfm-footer-contact-text">
                    <span className="pfm-footer-contact-label">Email</span>
                    <span className="pfm-footer-contact-value">
                      {contact.email}
                    </span>
                  </span>
                </a>

                <a
                  className="pfm-footer-contact-item"
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                >
                  <span className="pfm-footer-ico">
                    <FiPhone />
                  </span>
                  <span className="pfm-footer-contact-text">
                    <span className="pfm-footer-contact-label">Телефон</span>
                    <span className="pfm-footer-contact-value">
                      {contact.phone}
                    </span>
                  </span>
                </a>

                <div className="pfm-footer-contact-item pfm-footer-contact-static">
                  <span className="pfm-footer-ico">
                    <FiMapPin />
                  </span>
                  <span className="pfm-footer-contact-text">
                    <span className="pfm-footer-contact-label">Локација</span>
                    <span className="pfm-footer-contact-value">
                      {contact.address}
                    </span>
                  </span>
                </div>
              </div>

              <div className="pfm-footer-socials">
                <a
                  className="pfm-footer-social"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiGlobe />
                  <span>Facebook</span>
                </a>
                <a
                  className="pfm-footer-social"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiGlobe />
                  <span>Instagram</span>
                </a>
              </div>
            </Col>
          </Row>

          {/* Bottom bar */}
          <div className="pfm-footer-bottom text-center">
            <div className="pfm-footer-bottom-left text-center">
              © {year} Пливачка Федерација на Македонија. Сите права се
              задржани.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
