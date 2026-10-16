// src/components/sport/SportLayout.jsx
// Shared layout of a sport section (swimming, water polo): the photo hero with
// the section bar on its bottom edge, and the current page rendered underneath.
// The pages are the section's child routes in routes.jsx.
//   image  — hero photo in public/
//   ns     — translation namespace: <ns>.hero.kicker / .title, <ns>.subnav.*
//   items  — section bar links: [{ key, to, end? }], labelled <ns>.subnav.<key>
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Reveal from "../fx/Reveal.jsx";
import "./SportLayout.css";
import "./SportSubnav.css";

const SportLayout = ({ image, ns, items }) => {
  const { t } = useTranslation();

  return (
    // On phones the section bar shows two links per row; one row needs less height.
    <div className={`pfm-swimsec ${items.length <= 2 ? "is-one-row" : ""}`}>
      <header className="pfm-swimhero">
        <img className="pfm-swimhero-img" src={image} alt="" />

        <div className="pfm-swimhero-inner max-w-6xl mx-auto px-4 md:px-6">
          <Reveal>
            <span className="pfm-swimhero-kicker">{t(`${ns}.hero.kicker`)}</span>
            <h1 className="pfm-swimhero-title">{t(`${ns}.hero.title`)}</h1>
          </Reveal>
        </div>

        <div className="pfm-swimhero-subnav">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <nav className="pfm-subnav" aria-label={t(`${ns}.subnav.label`)}>
              {items.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `pfm-subnav-link ${isActive ? "is-active" : ""}`}
                >
                  {t(`${ns}.subnav.${item.key}`)}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="pfm-swimsec-body">
        <Outlet />
      </div>
    </div>
  );
};

export default SportLayout;
