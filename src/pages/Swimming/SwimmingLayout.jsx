import React from "react";
import {
  FiUsers,
  FiCalendar,
  FiGlobe,
  FiFileText,
  FiAward,
  FiEdit3,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import SportHub from "../../components/SportHub.jsx";

const SwimmingLayout = () => {
  const { t } = useTranslation();

  const cards = [
    { to: "/swimming/clubs", key: "clubs", icon: <FiUsers /> },
    { to: "/swimming/calendar-national", key: "calendarNational", icon: <FiCalendar /> },
    { to: "/swimming/calendar-international", key: "calendarInternational", icon: <FiGlobe /> },
    { to: "/swimming/criteria", key: "criteria", icon: <FiFileText /> },
    { to: "/swimming/records", key: "records", icon: <FiAward /> },
    { to: "/swimming/record-application", key: "recordApplication", icon: <FiEdit3 /> },
  ].map((c) => ({
    ...c,
    label: t(`swimming.cards.${c.key}.title`),
    desc: t(`swimming.cards.${c.key}.desc`),
  }));

  return (
    <SportHub
      kicker={t("swimming.hero.kicker")}
      title={t("swimming.hero.title")}
      subtitle={t("swimming.hero.subtitle")}
      groups={[{ key: "main", cards }]}
    />
  );
};

export default SwimmingLayout;
