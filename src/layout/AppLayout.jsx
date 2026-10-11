// src/layout/AppLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import Navbar from "../components/Navbar.jsx";
import "../App.css";
import Footer from "../components/Footer.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import PageTransition from "../components/fx/PageTransition.jsx";
import ClickRipple from "../components/fx/ClickRipple.jsx";
import { CLERK_PUBLISHABLE_KEY, clerkAppearance } from "../lib/clerk.js";

// Accounts for the whole site: the navbar's account button and the admin panel
// share this one Clerk session. Without a key the site simply has no accounts.
const AccountsProvider = ({ children }) => {
  const navigate = useNavigate();
  if (!CLERK_PUBLISHABLE_KEY) return children;

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      afterSignOutUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
};

const AppLayout = () => {
  return (
    <AccountsProvider>
      <div className=" pfm-site min-h-screen bg-slate-50 text-slate-900">
        <ScrollToTop />
        <ClickRipple />
        <Navbar />
        <main className="pfm-site-main ">
          <PageTransition />
        </main>
        <Footer />
      </div>
    </AccountsProvider>
  );
};

export default AppLayout;
