// src/components/Navbar/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dropdown, Drawer, Button } from "antd";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";

import "./Navbar.css";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    {
      key: "home",
      label: "HOME",
      path: "/",
    },
    {
      key: "swimming",
      label: "SWIMMING",
      children: [
        { key: "swim-programs", label: "Programs", path: "/swimming/programs" },
        {
          key: "swim-cal-national",
          label: "Calendar – National",
          path: "/swimming/calendar-national",
        },
        {
          key: "swim-cal-international",
          label: "Calendar – International",
          path: "/swimming/calendar-international",
        },
        {
          key: "swim-records",
          label: "Record List",
          path: "/swimming/records",
        },
        {
          key: "swim-criteria",
          label: "Criteria",
          path: "/swimming/criteria",
        },
      ],
    },
    {
      key: "waterpolo",
      label: "WATERPOLO",
      children: [
        {
          key: "wp-programs",
          label: "Programs",
          path: "/waterpolo/programs",
        },
        {
          key: "wp-cal-national",
          label: "Calendar – National",
          path: "/waterpolo/calendar-national",
        },
        {
          key: "wp-cal-international",
          label: "Calendar – International",
          path: "/waterpolo/calendar-international",
        },
        {
          key: "wp-records",
          label: "Record List",
          path: "/waterpolo/records",
        },
        {
          key: "wp-criteria",
          label: "Criteria",
          path: "/waterpolo/criteria",
        },
      ],
    },
    {
      key: "news",
      label: "NEWS",
      path: "/news",
    },
    {
      key: "distance-swimming",
      label: "DISTANCE SWIMMING",
      children: [
        {
          key: "ds-cal",
          label: "Calendar",
          path: "/distance-swimming/calendar",
        },
        {
          key: "ds-ohrid",
          label: "Ohrid Swimming Marathon",
          path: "/distance-swimming/ohrid-marathon",
        },
        {
          key: "ds-news",
          label: "News",
          path: "/distance-swimming/news",
        },
      ],
    },
  ];

  const buildDropdownMenu = (section) => ({
    items: section.children.map((child) => ({
      key: child.key,
      label: (
        <NavLink
          to={child.path}
          className="block px-2 py-1 text-sm nav-dropdown-link"
        >
          {child.label}
        </NavLink>
      ),
    })),
  });

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
          <Dropdown
            key={item.key}
            menu={buildDropdownMenu(item)}
            trigger={["hover"]}
          >
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
    </nav>
  );

  const renderMobileNav = () => (
    <>
      {/* Burger ONLY on mobile + tablet: hidden on lg and up */}
      <button
        type="text"
        className="flex lg:hidden items-center justify-center p-0 text-xl mobile-burger-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <FiMenu />
      </button>

      <Drawer
        title={
          <div className="font-semibold tracking-wide text-base">
            Пливачка Федерација на Македонија
          </div>
        }
        placement="right"
        open={mobileOpen}
        onClose={closeMobile}
        closeIcon={<FiX className="text-xl" />}
        width="80%"
      >
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
    <header className="pfm-navbar-wrapper fixed top-0 left-0 w-full z-40">
      <div className="pfm-navbar mt-none lg:mt-4 rounded-none lg:rounded-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo / Title */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="pfm-logo flex items-center justify-center">
              <img src="/LOGO.png" className="pfm-logo-text" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="pfm-title-small">
                Пливачка Федерација на Македонија
              </span>
            </div>
          </button>

          {/* Desktop navigation (only lg and up) */}
          {renderDesktopNav()}

          {/* Mobile + tablet navigation (burger) */}
          {renderMobileNav()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
