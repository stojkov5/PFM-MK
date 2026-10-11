// src/components/NavAccount.jsx
// The round account button in the navbar. Signed out: opens Clerk's sign-in /
// register dialog. Signed in: the user's avatar with Clerk's menu (manage
// account, sign out), plus an "Admin panel" link for admins.
// Only rendered when Clerk is configured (see Navbar.jsx).
import React from "react";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/react";
import { FiShield, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { isAdminUser } from "../lib/clerk.js";

const avatarAppearance = { elements: { avatarBox: { width: "36px", height: "36px" } } };

const NavAccount = () => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  let content = null; // empty circle while Clerk loads, so the navbar doesn't shift
  if (isLoaded && !isSignedIn) {
    content = (
      <SignInButton mode="modal">
        <button
          type="button"
          className="pfm-nav-account-btn"
          aria-label={t("navbar.actions.signIn")}
          title={t("navbar.actions.signIn")}
        >
          <FiUser />
        </button>
      </SignInButton>
    );
  } else if (isLoaded && isAdminUser(user)) {
    content = (
      <UserButton appearance={avatarAppearance}>
        <UserButton.MenuItems>
          <UserButton.Link
            label={t("navbar.actions.adminPanel")}
            labelIcon={<FiShield />}
            href="/admin"
          />
        </UserButton.MenuItems>
      </UserButton>
    );
  } else if (isLoaded) {
    content = <UserButton appearance={avatarAppearance} />;
  }

  return <div className="pfm-nav-account">{content}</div>;
};

export default NavAccount;
