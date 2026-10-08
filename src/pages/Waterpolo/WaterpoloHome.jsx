import React from "react";
import { FiBookOpen, FiCalendar, FiGlobe, FiAward, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import SportHub from "../../components/SportHub.jsx";

const WaterpoloHome = () => {
  const { t } = useTranslation();

  const cards = [
    { to: "/waterpolo/programs", key: "programs", icon: <FiBookOpen /> },
    { to: "/waterpolo/calendar-national", key: "calendarNational", icon: <FiCalendar /> },
    { to: "/waterpolo/calendar-international", key: "calendarInternational", icon: <FiGlobe /> },
    { to: "/waterpolo/records", key: "records", icon: <FiAward /> },
    { to: "/waterpolo/criteria", key: "criteria", icon: <FiFileText /> },
  ].map((c) => ({
    ...c,
    label: t(`waterpolo.cards.${c.key}.title`),
    desc: t(`waterpolo.cards.${c.key}.desc`),
  }));

  return (
    <SportHub
      kicker={t("waterpolo.hero.kicker")}
      title={t("waterpolo.hero.title")}
      subtitle={t("waterpolo.hero.subtitle")}
      groups={[{ key: "main", cards }]}
    />
  );
};

export default WaterpoloHome;
