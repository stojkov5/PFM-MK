// src/components/FooterNewsletter.jsx
// The footer's newsletter column: a short pitch, an email field + button, and
// the social links under it. Anyone can subscribe, no account needed (POST
// /api/newsletter); every newsletter email carries an unsubscribe link.
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { apiPost } from "../lib/api.js";

const FooterNewsletter = ({ socials }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const join = useMutation({ mutationFn: (address) => apiPost("/api/newsletter", { email: address }) });

  const submit = (e) => {
    e.preventDefault();
    if (email.trim()) join.mutate(email.trim());
  };

  return (
    <section className="pfm-footer-news" aria-labelledby="pfm-footer-news-title">
      <h2 id="pfm-footer-news-title" className="pfm-footer-heading">
        {t("footer.newsletter.title")}
      </h2>
      <p className="pfm-footer-news-text">{t("footer.newsletter.text")}</p>

      {join.isSuccess ? (
        <p className="pfm-footer-news-done" role="status">
          <FiCheck /> {t("footer.newsletter.done", { email: join.variables })}
        </p>
      ) : (
        <form className="pfm-footer-news-form" onSubmit={submit}>
          <input
            type="email"
            required
            className="pfm-footer-news-input"
            aria-label={t("footer.newsletter.placeholder")}
            placeholder={t("footer.newsletter.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button type="submit" className="pfm-footer-news-btn" disabled={join.isPending}>
            {t("footer.newsletter.subscribe")}
          </button>
        </form>
      )}
      {join.isError && (
        <p className="pfm-footer-news-error" role="alert">
          {t(join.error.status === 400 ? "footer.newsletter.invalid" : "footer.newsletter.error")}
        </p>
      )}

      <h2 className="pfm-footer-heading pfm-footer-follow">{t("footer.follow")}</h2>
      <div className="pfm-footer-socials">
        {socials.map((social) => (
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
    </section>
  );
};

export default FooterNewsletter;
