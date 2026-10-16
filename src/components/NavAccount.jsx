// src/components/NavAccount.jsx
// The round account button in the navbar. Signed out: opens Clerk's sign-in /
// register dialog. Signed in: the user's avatar with Clerk's menu (manage
// account, sign out), plus "My club" for club accounts, "Admin panel" for
// admins, and "Choose account type" for accounts that skipped /welcome.
// Only rendered when Clerk is configured (see Navbar.jsx).
import React from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/react";
import { FiShield, FiUser, FiUserCheck, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { SIGN_UP_REDIRECT, accountTypeOfUser, clubLinkOfUser, isAdminUser } from "../lib/clerk.js";

const avatarAppearance = { elements: { avatarBox: { width: "36px", height: "36px" } } };

const NavAccount = () => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  let content = null; // empty circle while Clerk loads, so the navbar doesn't shift
  if (isLoaded && !isSignedIn) {
    content = (
      <SignInButton mode="modal" signUpForceRedirectUrl={SIGN_UP_REDIRECT}>
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
  } else if (isLoaded) {
    const isClub = !!clubLinkOfUser(user);
    const isAdmin = isAdminUser(user);
    const needsType = !isAdmin && !accountTypeOfUser(user);
    content = (
      <UserButton appearance={avatarAppearance}>
        {(isClub || isAdmin || needsType) && (
          <UserButton.MenuItems>
            {/* Actions with our own router call, not UserButton.Link: Clerk's
                link navigation did nothing on the deployed site. */}
            {isClub && (
              <UserButton.Action
                label={t("navbar.actions.myClub")}
                labelIcon={<FiUsers />}
                onClick={() => navigate("/club")}
              />
            )}
            {needsType && (
              <UserButton.Action
                label={t("navbar.actions.chooseAccountType")}
                labelIcon={<FiUserCheck />}
                onClick={() => navigate(SIGN_UP_REDIRECT)}
              />
            )}
            {isAdmin && (
              <UserButton.Action
                label={t("navbar.actions.adminPanel")}
                labelIcon={<FiShield />}
                onClick={() => navigate("/admin")}
              />
            )}
          </UserButton.MenuItems>
        )}
      </UserButton>
    );
  }

  return <div className="pfm-nav-account">{content}</div>;
};

export default NavAccount;
