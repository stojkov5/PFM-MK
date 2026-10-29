// src/pages/ClubAccount/ClubAccount.jsx
// /club — the home page of a club account (linked from the navbar's account
// menu). Shows the club's competitions and their review status, the club's
// details, and how to change the password. While a club that signed up waits
// for approval, it shows the details it sent. Federation-made accounts come
// from `npm run clubs:create`; see clubLinkOf in server/auth/clerk.js for how
// an account is tied to a club.
import React from "react";
import { Link } from "react-router-dom";
import { SignInButton, useAuth, useClerk } from "@clerk/react";
import { FiCalendar, FiEdit2, FiEye, FiHome, FiKey, FiMail, FiMapPin, FiPhone, FiTag, FiUser } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import { CLERK_PUBLISHABLE_KEY, SIGN_UP_REDIRECT } from "../../lib/clerk.js";
import { useMyAccount } from "../../lib/useMyAccount.js";
import { CALENDAR_SPORTS, formatDay, sportPaths } from "../../lib/competitions.js";
import { useAuthedApi } from "../../lib/useAuthedApi.js";
import "../Clubs/Clubs.css";
import "./ClubAccount.css";

const DETAILS = [
  { field: "city", icon: <FiMapPin /> },
  { field: "type", icon: <FiTag /> },
  { field: "address", icon: <FiHome /> },
  { field: "phone", icon: <FiPhone /> },
  { field: "president", icon: <FiUser /> },
  { field: "email", icon: <FiMail /> },
];

const Shell = ({ title, subtitle, children }) => {
  const { t } = useTranslation();
  return (
    <div className="pfm-clubs pfm-clubacc pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-clubs-head">
            <div className="pfm-clubs-kicker">{t("clubAccount.kicker")}</div>
            <h1 className="pfm-clubs-title">{title}</h1>
            {subtitle && <p className="pfm-clubs-sub">{subtitle}</p>}
          </header>
          {children}
        </Reveal>
      </div>
    </div>
  );
};

const dateRange = (c, locale) =>
  c.startDate === c.endDate
    ? formatDay(c.startDate, locale)
    : `${formatDay(c.startDate, locale)} – ${formatDay(c.endDate, locale)}`;

// Everything the club has registered, with the federation's latest message.
const ClubCompetitions = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const api = useAuthedApi();
  const { data, isLoading, error } = useQuery({
    queryKey: ["club-competitions"],
    queryFn: () => api.get("/api/competitions/mine"),
  });

  const list = data?.competitions ?? [];
  return (
    <section className="pfm-clubacc-card">
      <h2 className="pfm-clubacc-h">{t("clubAccount.competitions.title")}</h2>
      {isLoading && <p className="pfm-clubacc-note">…</p>}
      {error && <p className="pfm-clubacc-note">{error.message}</p>}
      {data && list.length === 0 && (
        <p className="pfm-clubacc-note">{t("clubAccount.competitions.empty")}</p>
      )}
      {list.length > 0 && (
        <ul className="pfm-clubacc-list">
          {list.map((c) => (
            <li key={c.id} className="pfm-clubacc-comp">
              <div className="pfm-clubacc-comp-main">
                <div className="pfm-clubacc-comp-name">{c.name}</div>
                <div className="pfm-clubacc-comp-meta">
                  {t(`navbar.sports.${c.sport}.title`)} · {dateRange(c, locale)} · {c.city}
                </div>
                {c.messages[0] && (
                  <p className="pfm-clubacc-comp-msg">
                    <b>{t("competitions.form.messageFromFederation")}:</b> {c.messages[0].body}
                  </p>
                )}
              </div>
              <span className={`pfm-clubacc-status is-${c.status}`}>
                {t(`competitions.form.status.${c.status}`)}
              </span>
              <Link
                to={`${sportPaths(c.sport).submit}?edit=${c.id}`}
                className="pfm-clubacc-btn is-small"
              >
                {c.canEdit ? <FiEdit2 /> : <FiEye />}{" "}
                {c.canEdit ? t("clubAccount.competitions.edit") : t("clubAccount.competitions.view")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const ClubDetails = ({ club }) => {
  const { t } = useTranslation();
  return (
    <section className="pfm-clubacc-card">
      <h2 className="pfm-clubacc-h">{t("clubAccount.detailsTitle")}</h2>
      <dl className="pfm-club-details">
        {DETAILS.map(({ field, icon }) => (
          <div className="pfm-club-detail" key={field}>
            <span className="pfm-club-detail-icon">{icon}</span>
            <div className="pfm-club-detail-text">
              <dt>{t(`clubs.labels.${field}`)}</dt>
              <dd>{club[field] || "—"}</dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="pfm-clubacc-note">{t("clubAccount.detailsNote")}</p>
    </section>
  );
};

const ClubAccountInner = () => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { openUserProfile } = useClerk();
  const account = useMyAccount();

  if (!isLoaded) return <Shell title="…" />;

  if (!isSignedIn) {
    return (
      <Shell title={t("clubAccount.signedOut.title")} subtitle={t("clubAccount.signedOut.text")}>
        <div className="pfm-clubacc-actions">
          <SignInButton mode="modal" signUpForceRedirectUrl={SIGN_UP_REDIRECT}>
            <button type="button" className="pfm-clubacc-btn is-primary">
              {t("clubAccount.signedOut.button")}
            </button>
          </SignInButton>
        </div>
      </Shell>
    );
  }

  if (account.isPending) return <Shell title="…" />;
  if (account.isError) return <Shell title={account.error.message} />;

  const { accountType, club } = account.data;
  if (!club) {
    return (
      <Shell title={t("clubAccount.notClub.title")} subtitle={t("clubAccount.notClub.text")}>
        {!accountType && (
          <div className="pfm-clubacc-actions">
            <Link to={SIGN_UP_REDIRECT} className="pfm-clubacc-btn is-primary">
              {t("navbar.actions.chooseAccountType")}
            </Link>
          </div>
        )}
      </Shell>
    );
  }

  if (club.status !== "approved" || club.accountStatus !== "approved") {
    return (
      <Shell title={club.name} subtitle={t("clubAccount.pending.text")}>
        <p className="pfm-clubacc-badge is-pending">{t("clubAccount.pending.badge")}</p>
        <ClubDetails club={club} />
      </Shell>
    );
  }

  return (
    <Shell title={club.name} subtitle={t("clubAccount.subtitle")}>
      <p className="pfm-clubacc-badge">{t("clubAccount.approvedBadge")}</p>

      <div className="pfm-clubacc-actions">
        {Object.entries(CALENDAR_SPORTS).map(([sport, paths]) => (
          <Link key={sport} to={paths.submit} className="pfm-clubacc-btn is-primary">
            <FiCalendar /> {t("clubAccount.submitCompetition")} — {t(`navbar.sports.${sport}.title`)}
          </Link>
        ))}
        <button type="button" className="pfm-clubacc-btn" onClick={() => openUserProfile()}>
          <FiKey /> {t("clubAccount.changePassword")}
        </button>
      </div>

      <ClubCompetitions />
      <ClubDetails club={club} />
    </Shell>
  );
};

const ClubAccount = () => {
  const { t } = useTranslation();
  // Without Clerk there are no accounts (and Clerk's hooks would throw).
  if (!CLERK_PUBLISHABLE_KEY) {
    return <Shell title={t("clubAccount.notClub.title")} />;
  }
  return <ClubAccountInner />;
};

export default ClubAccount;
