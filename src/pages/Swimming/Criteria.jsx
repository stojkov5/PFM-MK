// src/pages/Swimming/Criteria.jsx
// Swimming criteria: the PDFs admins manage in the admin panel's Criteria tab.
import React from "react";
import { useTranslation } from "react-i18next";
import CriteriaPage from "../../components/CriteriaPage.jsx";

const Criteria = () => {
  const { t } = useTranslation();
  return (
    <CriteriaPage
      sport="swimming"
      kicker={t("criteria.kicker")}
      title={t("criteria.title")}
      subtitle={t("criteria.subtitle")}
      emptyText={t("criteria.empty")}
    />
  );
};

export default Criteria;
