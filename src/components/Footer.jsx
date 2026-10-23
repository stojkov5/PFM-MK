// src/components/Footer.jsx
// Full-width site footer: the newsletter band, brand + socials, then contact
// (left) and the federation's documents (right, from data/documents.js), then
// the copyright bar.
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiArrowUp, FiExternalLink, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { DOCUMENTS } from "../data/documents.js";
import { CLERK_PUBLISHABLE_KEY } from "../lib/clerk.js";
import FooterNewsletter from "./FooterNewsletter.jsx";
import "./Footer.css";

// The address from the federation's bank-account details. The email shown
// here is the federation's current mailbox; the site itself still sends from
// info@npf.mk. Switch this once the npf.mk mailboxes are live.
const CONTACT = {
  email: "nacionalnaplivackafederacija@yahoo.com",
  phone: "078 270 372",
  phoneHref: "tel:+38978270372",
};

const FOOTER_DOCUMENTS = DOCUMENTS.filter((doc) => doc.key !== "structure");

const SOCIALS = [
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/profile.php?id=61574990019250", Icon: FaFacebookF },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/nacionalna_plivacka_federacija/", Icon: FaInstagram },
];

const ContactItem = ({ icon, label, value, href }) => {
  const body = (
    <>
      <span className="pfm-footer-ico">{icon}</span>
      <span className="pfm-footer-contact-text">
        <span className="pfm-footer-label">{label}</span>
        <span className="pfm-footer-value">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a className="pfm-footer-row" href={href}>
          {body}
        </a>
      ) : (
        <div className="pfm-footer-row is-static">{body}</div>
      )}
    </li>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="pfm-footer">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {CLERK_PUBLISHABLE_KEY && <FooterNewsletter />}

        {/* Brand + socials */}
        <div className="pfm-footer-top">
          <Link to="/" className="pfm-footer-brand" aria-label={t("navbar.actions.goHome")}>
            <img src="/LOGO.png" alt={t("navbar.brand.logoAlt")} className="pfm-footer-logo" />
            <span className="pfm-footer-brand-name">{t("navbar.brand.fullName")}</span>
          </Link>

          <div className="pfm-footer-socials">
            <span className="pfm-footer-label">{t("footer.follow")}</span>
            {SOCIALS.map((social) => (
              <a
                key={social.key}
                className="pfm-footer-social"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
              >
                <social.Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="pfm-footer-grid">
          {/* Contact */}
          <section aria-labelledby="pfm-footer-contact">
            <h2 id="pfm-footer-contact" className="pfm-footer-heading">
              {t("footer.contact")}
            </h2>
            <ul className="pfm-footer-list">
              <ContactItem
                icon={<FiMail />}
                label={t("footer.email")}
                value={CONTACT.email}
                href={`mailto:${CONTACT.email}`}
              />
              <ContactItem
                icon={<FiPhone />}
                label={t("footer.phone")}
                value={CONTACT.phone}
                href={CONTACT.phoneHref}
              />
              <ContactItem icon={<FiMapPin />} label={t("footer.location")} value={t("footer.address")} />
            </ul>
          </section>

          {/* Documents: the PDFs from the /documents page (the organisational
              structure has its own page under "More") */}
          <section aria-labelledby="pfm-footer-docs">
            <h2 id="pfm-footer-docs" className="pfm-footer-heading">
              <Link to="/documents" className="pfm-footer-heading-link">
                {t("documents.footerTitle")} <FiArrowRight />
              </Link>
            </h2>
            <ul className="pfm-footer-list">
              {FOOTER_DOCUMENTS.map((doc) => (
                <li key={doc.key}>
                  <a
                    className="pfm-footer-row pfm-footer-doc"
                    href={encodeURI(doc.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="pfm-footer-ico is-small">
                      <doc.Icon />
                    </span>
                    <span className="pfm-footer-doc-title">{t(`documents.items.${doc.key}.title`)}</span>
                    <FiExternalLink className="pfm-footer-doc-go" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="pfm-footer-bottom">
        <div className="pfm-footer-bottom-inner max-w-6xl mx-auto px-4 md:px-6">
          <p>
            © {year} {t("navbar.brand.fullName")}. {t("footer.rights")}
          </p>
          <button
            type="button"
            className="pfm-footer-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t("footer.backToTop")} <FiArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
