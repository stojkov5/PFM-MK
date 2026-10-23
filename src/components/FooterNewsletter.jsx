// src/components/FooterNewsletter.jsx
// The newsletter band at the top of the footer: a short pitch, then an email
// field + button. Only accounts can subscribe (the flag is stored on the
// account by POST /api/account/newsletter):
//   - signed out: the typed email opens Clerk's sign-in / sign-up with that
//     address filled in, and the account is subscribed once it's signed in;
//   - signed in: the field shows the account's email and the button subscribes;
//   - subscribed: a confirmation with an "Unsubscribe" link.
// Subscribers get an email for every article sent to "Subscribers".
// Only rendered when Clerk is configured (see Footer.jsx).
import React, { useEffect, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { SIGN_UP_REDIRECT } from "../lib/clerk.js";
import { useAuthedApi } from "../lib/useAuthedApi.js";
import { useMyAccount } from "../lib/useMyAccount.js";

// Set while the visitor signs in from here, so they're subscribed afterwards
// (sign-up passes through /welcome, so it has to survive a page change).
const PENDING_KEY = "pfm-newsletter-after-sign-in";
const pending = {
  get: () => {
    try {
      return sessionStorage.getItem(PENDING_KEY) === "1";
    } catch {
      return false;
    }
  },
  set: (on) => {
    try {
      if (on) sessionStorage.setItem(PENDING_KEY, "1");
      else sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // Private mode: they just press Subscribe again after signing in.
    }
  },
};

const FooterNewsletter = () => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const account = useMyAccount();
  const api = useAuthedApi();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState("");

  const toggle = useMutation({
    mutationFn: (subscribed) => api.post("/api/account/newsletter", { subscribed }),
    onSuccess: ({ newsletter }) =>
      queryClient.setQueryData(["my-account", userId], (old) => old && { ...old, newsletter }),
  });
  const { mutate } = toggle;

  const subscribed = !!account.data?.newsletter;

  // Back from signing in here: finish the subscription.
  useEffect(() => {
    if (!isSignedIn || !account.data || !pending.get()) return;
    pending.set(false);
    if (!account.data.newsletter) mutate(true);
  }, [isSignedIn, account.data, mutate]);

  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const submit = (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (isSignedIn) {
      if (account.data) mutate(true);
      return;
    }
    pending.set(true);
    clerk.openSignIn({
      initialValues: typed.trim() ? { emailAddress: typed.trim() } : undefined,
      signUpForceRedirectUrl: SIGN_UP_REDIRECT,
    });
  };

  return (
    <section className="pfm-footer-news" aria-labelledby="pfm-footer-news-title">
      <div className="pfm-footer-news-copy">
        <h2 id="pfm-footer-news-title" className="pfm-footer-heading">
          {t("footer.newsletter.title")}
        </h2>
        <p className="pfm-footer-news-text">{t("footer.newsletter.text")}</p>
      </div>

      {isSignedIn && subscribed ? (
        <p className="pfm-footer-news-done">
          <FiCheck /> {t("footer.newsletter.subscribed", { email: accountEmail })}
          <button
            type="button"
            className="pfm-footer-news-link"
            disabled={toggle.isPending}
            onClick={() => mutate(false)}
          >
            {t("footer.newsletter.unsubscribe")}
          </button>
        </p>
      ) : (
        <form className="pfm-footer-news-form" onSubmit={submit}>
          <input
            type="email"
            className="pfm-footer-news-input"
            aria-label={t("footer.newsletter.placeholder")}
            placeholder={t("footer.newsletter.placeholder")}
            value={isSignedIn ? accountEmail : typed}
            readOnly={isSignedIn}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="email"
          />
          <button
            type="submit"
            className="pfm-footer-news-btn"
            disabled={!isLoaded || toggle.isPending || (isSignedIn && !account.data)}
          >
            {t("footer.newsletter.subscribe")}
          </button>
        </form>
      )}

      {toggle.isError && (
        <p className="pfm-footer-news-error" role="alert">
          {t("footer.newsletter.error")}
        </p>
      )}
      {!isSignedIn && isLoaded && <p className="pfm-footer-news-hint">{t("footer.newsletter.hint")}</p>}
    </section>
  );
};

export default FooterNewsletter;
