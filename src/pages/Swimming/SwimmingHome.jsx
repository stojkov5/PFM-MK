// src/pages/Swimming/SwimmingHome.jsx
// "Latest" — the first page of the swimming section: news from the swimming
// category, as published in the admin panel.
import React from "react";
import { useTranslation } from "react-i18next";
import News from "../News/News.jsx";

const SwimmingHome = () => {
  const { t } = useTranslation();

  return (
    <News
      embedded
      category="swimming"
      title={t("swimming.latest.title")}
      subtitle={t("swimming.latest.subtitle")}
    />
  );
};

export default SwimmingHome;
