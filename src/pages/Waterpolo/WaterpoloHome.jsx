// src/pages/Waterpolo/WaterpoloHome.jsx
// "Latest" — the first page of the water polo section: news from the water
// polo category only, as published in the admin panel.
import React from "react";
import { useTranslation } from "react-i18next";
import News from "../News/News.jsx";

const WaterpoloHome = () => {
  const { t } = useTranslation();

  return (
    <News
      embedded
      category="waterpolo"
      title={t("waterpolo.latest.title")}
      subtitle={t("waterpolo.latest.subtitle")}
    />
  );
};

export default WaterpoloHome;
