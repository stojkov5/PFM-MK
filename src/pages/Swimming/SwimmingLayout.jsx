import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./swimming.css";

const tabs = [
  { to: "/swimming/programs", label: "Programs" },
  { to: "/swimming/calendar-national", label: "Calendar – National" },
  { to: "/swimming/calendar-international", label: "Calendar – International" },
  { to: "/swimming/records", label: "Record List" },
  { to: "/swimming/criteria", label: "Criteria" },
];

const SwimmingLayout = () => {
  return (
    <section className="pfm-swimming">
      {/* Header */}
      <div className="pfm-swimming-hero">
        <div className="pfm-swimming-hero-inner max-w-6xl mx-auto px-4 md:px-6">
          <span className="pfm-swimming-kicker">Discipline</span>
          <h1 className="pfm-swimming-title">Swimming</h1>
          <p className="pfm-swimming-sub">
            Официјални информации за пливачки програми, календари, рекорди и
            критериуми под надлежност на Пливачката Федерација.
          </p>

          {/* Tabs */}
          <div className="pfm-swimming-tabs">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `pfm-swimming-tab ${isActive ? "active" : ""}`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="pfm-swimming-content max-w-6xl mx-auto px-4 md:px-6">
        <Outlet />
      </div>
    </section>
  );
};

export default SwimmingLayout;
