// src/pages/DistanceSwimming/DistanceSwimmingHome.jsx
// "Latest" — the first page of the distance swimming section: news from the
// distance swimming category only, as published in the admin panel.
import React from "react";
import { useTranslation } from "react-i18next";
import News from "../News/News.jsx";

const DistanceSwimmingHome = () => {
  const { t } = useTranslation();

  return (
    <News
      embedded
      category="distance-swimming"
      title={t("distance.latest.title")}
      subtitle={t("distance.latest.subtitle")}
    />
  );
};

export default DistanceSwimmingHome;
