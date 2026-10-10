import React from "react";
import { useTranslation } from "react-i18next";
import News from "../News/News.jsx";

// The news listing, limited to the distance swimming category.
const DistanceSwimmingNews = () => {
  const { t } = useTranslation();
  return (
    <News
      category="distance-swimming"
      title={t("news.distance.title")}
      subtitle={t("news.distance.subtitle")}
    />
  );
};

export default DistanceSwimmingNews;
