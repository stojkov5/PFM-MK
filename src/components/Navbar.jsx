// src/components/Navbar.jsx
// Layout inspired by worldaquatics.com: full-width bar, brand on the left,
// dropdowns + plain links, language switch on the far right.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiArrowRight,
  FiInfo,
  FiGitBranch,
} from "react-icons/fi";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";
import { PiHandshake } from "react-icons/pi";
import { useTranslation } from "react-i18next";

import "./Navbar.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "mk", label: "MK" },
];

const LanguageSwitch = ({ className = "" }) => {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language;
  return (
    <div
      className={`pfm-lang ${className}`}
      role="group"
      aria-label={t("navbar.actions.changeLanguage")}
    >
      {LANGUAGES.map((lng) => (
        <button
          key={lng.code}
          type="button"
          className={`pfm-lang-btn ${current === lng.code ? "is-active" : ""}`}
          aria-pressed={current === lng.code}
          onClick={() => i18n.changeLanguage(lng.code)}
        >
          {lng.label}
        </button>
      ))}
    </div>
  );
};

const MenuItem = ({ item, showArrow }) => (
  <NavLink
    to={item.path}
    end
    className={({ isActive }) => `pfm-nav-item ${isActive ? "is-active" : ""}`}
  >
    <span className="pfm-nav-item-icon">{item.icon}</span>
    <span className="pfm-nav-item-text">
      <span className="pfm-nav-item-title">{item.label}</span>
      <span className="pfm-nav-item-desc">{item.desc}</span>
    </span>
    {showArrow && <FiArrowRight className="pfm-nav-item-arrow" />}
  </NavLink>
);

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null); // key of the open dropdown
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const hoverTimer = useRef(null);

  const isHome = location.pathname === "/";

  const menus = useMemo(
    () => [
      {
        key: "sports",
        label: t("navbar.items.sports"),
        match: ["/swimming", "/waterpolo", "/distance-swimming"],
        items: [
          { key: "swimming", path: "/swimming", icon: <TbSwimming /> },
          { key: "waterpolo", path: "/waterpolo", icon: <TbWaterpolo /> },
          { key: "distance", path: "/distance-swimming", icon: <TiWaves /> },
        ].map((i) => ({
          ...i,
          label: t(`navbar.sports.${i.key}.title`),
          desc: t(`navbar.sports.${i.key}.desc`),
        })),
      },
      { key: "news", label: t("navbar.items.news"), path: "/news" },
      { key: "calendar", label: t("navbar.items.calendar"), path: "/calendar" },
      {
        key: "about",
        label: t("navbar.items.about"),
        match: ["/about"],
        items: [
          { key: "about", path: "/about", icon: <FiInfo /> },
          { key: "structure", path: "/about/structure", icon: <FiGitBranch /> },
          { key: "partners", path: "/about/partners", icon: <PiHandshake /> },
        ].map((i) => ({
          ...i,
          label: t(`navbar.about.${i.key}.title`),
          desc: t(`navbar.about.${i.key}.desc`),
        })),
      },
    ],
    [t]
  );

  // Close menus whenever the page changes.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  // Transparent over the home hero, solid once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close an open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e) => {
      if (!navRef.current?.contains(e.target)) setOpenMenu(null);
    };
    const onKey = (e) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  // Lock page scroll behind the mobile menu.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Hover opens instantly; leaving waits a moment so the cursor can travel
  // from the button into the panel without it closing.
  const hoverOpen = (key) => {
    clearTimeout(hoverTimer.current);
    setOpenMenu(key);
  };
  const hoverClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  const isMenuActive = (menu) => menu.match.some((p) => location.pathname.startsWith(p));
  const solid = !isHome || scrolled || mobileOpen;

  return (
    <header className={`pfm-nav ${solid ? "is-solid" : ""}`}>
      <div className="pfm-nav-bar">
        <div className="pfm-nav-inner max-w-6xl mx-auto px-4 md:px-6">
          {/* Brand */}
          <Link to="/" className="pfm-nav-brand" aria-label={t("navbar.actions.goHome")}>
            <img src="/LOGO.png" alt={t("navbar.brand.logoAlt")} className="pfm-nav-brand-logo" />
            <span className="pfm-nav-brand-name">{t("navbar.brand.fullName")}</span>
          </Link>

          {/* Desktop links */}
          <nav className="pfm-nav-links" aria-label="Main" ref={navRef}>
            {menus.map((menu) =>
              menu.items ? (
                <div
                  key={menu.key}
                  className="pfm-nav-dd"
                  onMouseEnter={() => hoverOpen(menu.key)}
                  onMouseLeave={hoverClose}
                >
                  <button
                    type="button"
                    className={`pfm-nav-link ${isMenuActive(menu) ? "is-active" : ""}`}
                    aria-expanded={openMenu === menu.key}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu((o) => (o === menu.key ? null : menu.key))}
                  >
                    {menu.label}
                    <FiChevronDown
                      className={`pfm-nav-chevron ${openMenu === menu.key ? "is-open" : ""}`}
                    />
                  </button>
                  <div className={`pfm-nav-panel ${openMenu === menu.key ? "is-open" : ""}`}>
                    {menu.items.map((item) => (
                      <MenuItem key={item.key} item={item} showArrow />
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  key={menu.key}
                  to={menu.path}
                  className={({ isActive }) => `pfm-nav-link ${isActive ? "is-active" : ""}`}
                >
                  {menu.label}
                </NavLink>
              )
            )}
          </nav>

          <LanguageSwitch className="pfm-lang-desktop" />

          {/* Mobile burger */}
          <button
            type="button"
            className="pfm-nav-burger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t("navbar.actions.openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`pfm-nav-mobile ${mobileOpen ? "is-open" : ""}`}>
        <div className="pfm-nav-mobile-inner">
          {menus.map((menu) =>
            menu.items ? (
              <div key={menu.key} className="pfm-nav-mobile-group">
                <div className="pfm-nav-mobile-title">{menu.label}</div>
                {menu.items.map((item) => (
                  <MenuItem key={item.key} item={item} />
                ))}
              </div>
            ) : (
              <NavLink
                key={menu.key}
                to={menu.path}
                className={({ isActive }) => `pfm-nav-mobile-link ${isActive ? "is-active" : ""}`}
              >
                {menu.label}
                <FiArrowRight />
              </NavLink>
            )
          )}

          <div className="pfm-nav-mobile-lang">
            <span>{t("navbar.actions.language")}</span>
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
