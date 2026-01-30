// src/components/Navbar/Navbar.jsx
import React, { useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Dropdown, Drawer } from "antd";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import "./Navbar.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "mk", label: "MK" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const closeMobile = () => setMobileOpen(false);

  const isHome = location.pathname === "/";

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLangLabel =
    LANGUAGES.find((l) => l.code === i18n.language)?.label ||
    LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage || ""))?.label ||
    "EN";

  const navItems = useMemo(
    () => [
      { key: "home", label: t("navbar.items.home"), path: "/" },
      {
        key: "swimming",
        label: t("navbar.items.swimming"),
        children: [
          { key: "swim-home", label: t("navbar.swimming.home"), path: "/swimming" },
          { key: "swim-clubs", label: t("navbar.swimming.clubs"), path: "/swimming/clubs" },
          { key: "swim-cal-national", label: t("navbar.common.calendarNational"), path: "/swimming/calendar-national" },
          { key: "swim-cal-international", label: t("navbar.common.calendarInternational"), path: "/swimming/calendar-international" },
          { key: "swim-records", label: t("navbar.common.recordList"), path: "/swimming/records" },
          { key: "swim-criteria", label: t("navbar.common.criteria"), path: "/swimming/criteria" },
        ],
      },
      {
        key: "waterpolo",
        label: t("navbar.items.waterpolo"),
        children: [
          { key: "wp-programs", label: t("navbar.waterpolo.programs"), path: "/waterpolo/programs" },
          { key: "wp-cal-national", label: t("navbar.common.calendarNational"), path: "/waterpolo/calendar-national" },
          { key: "wp-cal-international", label: t("navbar.common.calendarInternational"), path: "/waterpolo/calendar-international" },
          { key: "wp-records", label: t("navbar.common.recordList"), path: "/waterpolo/records" },
          { key: "wp-criteria", label: t("navbar.common.criteria"), path: "/waterpolo/criteria" },
        ],
      },
      { key: "news", label: t("navbar.items.news"), path: "/news" },
      {
        key: "distance-swimming",
        label: t("navbar.items.distanceSwimming"),
        children: [
          { key: "ds-cal", label: t("navbar.distance.calendar"), path: "/distance-swimming/calendar" },
          { key: "ds-ohrid", label: t("navbar.distance.ohridMarathon"), path: "/distance-swimming/ohrid-marathon" },
          { key: "ds-news", label: t("navbar.items.news"), path: "/distance-swimming/news" },
        ],
      },
    ],
    [t]
  );

  const buildDropdownMenu = (section) => ({
    className: "pfm-dd-menu",
    items: section.children.map((child) => ({
      key: child.key,
      label: (
        <NavLink to={child.path} className="pfm-dd-link" onClick={closeMobile}>
          {child.label}
        </NavLink>
      ),
    })),
  });

  const languageMenu = {
    className: "pfm-dd-menu",
    items: LANGUAGES.map((lng) => ({
      key: lng.code,
      label: (
        <button
          type="button"
          className="pfm-dd-link w-full text-left"
          onClick={() => changeLanguage(lng.code)}
        >
          {lng.label}
        </button>
      ),
    })),
  };

  const renderDesktopNav = () => (
    <nav className="hidden lg:flex items-center gap-6">
      {navItems.map((item) => {
        if (!item.children) {
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          );
        }

        return (
          <Dropdown key={item.key} menu={buildDropdownMenu(item)} trigger={["hover"]}>
            <button
              type="button"
              className="nav-link-base nav-trigger flex items-center gap-1"
            >
              {item.label}
              <FiChevronDown className="chevron-icon" />
            </button>
          </Dropdown>
        );
      })}

      {/* ✅ Language switcher (desktop) */}
      <Dropdown menu={languageMenu} trigger={["click"]} placement="bottomRight">
        <button
          type="button"
          className="nav-link-base nav-trigger flex items-center gap-1"
          aria-label={t("navbar.actions.changeLanguage")}
        >
          {currentLangLabel}
          <FiChevronDown className="chevron-icon" />
        </button>
      </Dropdown>
    </nav>
  );

  const renderMobileNav = () => (
    <>
      <button
        type="button"
        className="flex lg:hidden items-center justify-center p-0 text-xl mobile-burger-btn"
        onClick={() => setMobileOpen(true)}
        aria-label={t("navbar.actions.openMenu")}
      >
        <FiMenu />
      </button>

      <Drawer
        title={<div className="pfm-drawer-title">{t("navbar.brand.fullName")}</div>}
        placement="right"
        open={mobileOpen}
        onClose={closeMobile}
        closeIcon={<FiX className="text-xl" />}
        width="82%"
        className="pfm-drawer"
      >
        {/* ✅ Language switcher (mobile) */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm opacity-80">{t("navbar.actions.language")}</div>
          <div className="flex gap-2">
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => changeLanguage(lng.code)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  (i18n.resolvedLanguage || i18n.language) === lng.code
                    ? "nav-link-mobile-active"
                    : "nav-link-mobile"
                }`}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            if (!item.children) {
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `nav-link-mobile block py-1 ${
                      isActive ? "nav-link-mobile-active" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              );
            }

            return (
              <div key={item.key}>
                <div className="nav-mobile-section-title">{item.label}</div>
                <div className="flex flex-col gap-1 ml-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.key}
                      to={child.path}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `nav-link-mobile block ${
                          isActive ? "nav-link-mobile-active" : ""
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </Drawer>
    </>
  );

  return (
    <header
      className={`pfm-navbar-wrapper fixed top-0 left-0 w-full z-40 ${
        isHome ? "pfm-navbar-home" : ""
      }`}
    >
      <div className="pfm-navbar max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
            aria-label={t("navbar.actions.goHome")}
          >
            <div className="pfm-logo flex items-center justify-center">
              <img src="/LOGO.png" alt={t("navbar.brand.logoAlt")} className="pfm-logo-img" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="pfm-title-small">{t("navbar.brand.fullName")}</span>
            </div>
          </button>

          {renderDesktopNav()}
          {renderMobileNav()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
