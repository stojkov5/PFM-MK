// src/pages/Newsletter/Unsubscribe.jsx
// /newsletter/unsubscribe?token=… — the link at the bottom of every newsletter
// email. It asks for a click instead of unsubscribing on load, because some
// mail apps open links by themselves to check them.
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import { apiPost } from "../../lib/api.js";
import "../Clubs/Clubs.css";
import "../ClubAccount/ClubAccount.css";

const Unsubscribe = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const leave = useMutation({ mutationFn: () => apiPost("/api/newsletter/unsubscribe", { token }) });
  const gone = leave.isError && leave.error.status === 404;

  let title = t("newsletter.unsubscribe.title");
  let text = t("newsletter.unsubscribe.text");
  if (!token || gone) {
    title = t("newsletter.unsubscribe.goneTitle");
    text = t("newsletter.unsubscribe.goneText");
  } else if (leave.isSuccess) {
    title = t("newsletter.unsubscribe.doneTitle");
    text = t("newsletter.unsubscribe.doneText", { email: leave.data.email });
  }

  return (
    <div className="pfm-clubs pt-24">
      <div className="pfm-landing-inner max-w-4xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-clubs-head">
            <div className="pfm-clubs-kicker">{t("footer.newsletter.title")}</div>
            <h1 className="pfm-clubs-title">{title}</h1>
            <p className="pfm-clubs-sub">{text}</p>
          </header>
          <div className="pfm-clubacc-actions">
            {token && !gone && !leave.isSuccess && (
              <button
                type="button"
                className="pfm-clubacc-btn is-primary"
                disabled={leave.isPending}
                onClick={() => leave.mutate()}
              >
                {t("newsletter.unsubscribe.button")}
              </button>
            )}
            <Link to="/" className="pfm-clubacc-btn">
              {t("newsletter.unsubscribe.home")}
            </Link>
          </div>
          {leave.isError && !gone && (
            <p className="pfm-clubacc-note" role="alert">
              {t("footer.newsletter.error")}
            </p>
          )}
        </Reveal>
      </div>
    </div>
  );
};

export default Unsubscribe;
