// src/pages/Swimming/SwimmingLayout.jsx
// The swimming section: photo hero + section bar (see SportLayout), with the
// swimming pages (latest, calendar, records, criteria…) underneath.
import React from "react";
import SportLayout from "../../components/sport/SportLayout.jsx";

const ITEMS = [
  { key: "latest", to: "/swimming", end: true },
  { key: "calendar", to: "/swimming/calendar-national" },
  { key: "records", to: "/swimming/records" },
  { key: "criteria", to: "/swimming/criteria" },
];

const SwimmingLayout = () => <SportLayout image="/Swimming-hero.jpg" ns="swimming" items={ITEMS} />;

export default SwimmingLayout;
