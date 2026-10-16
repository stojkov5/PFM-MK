// src/pages/DistanceSwimming/DistanceSwimmingLayout.jsx
// The distance swimming section: same photo hero + section bar as swimming
// and water polo (see SportLayout), with the distance swimming pages underneath.
import React from "react";
import SportLayout from "../../components/sport/SportLayout.jsx";

const ITEMS = [
  { key: "latest", to: "/distance-swimming", end: true },
  { key: "calendar", to: "/distance-swimming/calendar" },
  { key: "criteria", to: "/distance-swimming/criteria" },
];

const DistanceSwimmingLayout = () => (
  <SportLayout image="/Distance.jpg" ns="distance" items={ITEMS} />
);

export default DistanceSwimmingLayout;
