// src/pages/Waterpolo/WaterpoloLayout.jsx
// The water polo section: same photo hero + section bar as swimming (see
// SportLayout), with the water polo pages underneath.
import React from "react";
import SportLayout from "../../components/sport/SportLayout.jsx";

const ITEMS = [
  { key: "latest", to: "/waterpolo", end: true },
  { key: "calendar", to: "/waterpolo/calendar" },
];

const WaterpoloLayout = () => <SportLayout image="/Waterpolo.jpg" ns="waterpolo" items={ITEMS} />;

export default WaterpoloLayout;
