// src/pages/DistanceSwimming/DistanceSwimmingCriteria.jsx
// Distance swimming criteria: the PDFs admins manage in the admin panel's
// Criteria tab.
import React from "react";
import { useTranslation } from "react-i18next";
import CriteriaPage from "../../components/CriteriaPage.jsx";

const DistanceSwimmingCriteria = () => {
  const { t } = useTranslation();
  return (
    <CriteriaPage
      sport="distance-swimming"
      kicker={t("distance.criteria.kicker")}
      title={t("distance.criteria.title")}
      subtitle={t("distance.criteria.subtitle")}
      emptyText={t("distance.criteria.empty")}
    />
  );
};

export default DistanceSwimmingCriteria;
