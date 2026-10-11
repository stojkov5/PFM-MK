// src/pages/Swimming/SwimmingLayout.jsx
// Shared layout of every swimming page: the photo hero with the section bar on
// its bottom edge, and the current page (latest, calendar, records, criteria…)
// rendered underneath. The pages are the child routes in routes.jsx.
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import SwimmingSubnav from "./SwimmingSubnav.jsx";
import "./SwimmingLayout.css";

const SwimmingLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-swimsec">
      <header className="pfm-swimhero">
        <img className="pfm-swimhero-img" src="/Swimming-hero.jpg" alt="" />

        <div className="pfm-swimhero-inner max-w-6xl mx-auto px-4 md:px-6">
          <Reveal>
            <span className="pfm-swimhero-kicker">{t("swimming.hero.kicker")}</span>
            <h1 className="pfm-swimhero-title">{t("swimming.hero.title")}</h1>
          </Reveal>
        </div>

        <div className="pfm-swimhero-subnav">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <SwimmingSubnav />
          </div>
        </div>
      </header>

      <div className="pfm-swimsec-body">
        <Outlet />
      </div>
    </div>
  );
};

export default SwimmingLayout;
