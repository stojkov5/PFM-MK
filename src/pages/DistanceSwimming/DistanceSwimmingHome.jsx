import React from "react";
import { FiCalendar, FiFlag, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import SportHub from "../../components/SportHub.jsx";

const DistanceSwimmingHome = () => {
  const { t } = useTranslation();

  const cards = [
    { to: "/distance-swimming/calendar", key: "calendar", icon: <FiCalendar /> },
    { to: "/distance-swimming/ohrid-marathon", key: "ohridMarathon", icon: <FiFlag /> },
    { to: "/distance-swimming/news", key: "news", icon: <FiFileText /> },
  ].map((c) => ({
    ...c,
    label: t(`distance.cards.${c.key}.title`),
    desc: t(`distance.cards.${c.key}.desc`),
  }));

  return (
    <SportHub
      kicker={t("distance.hero.kicker")}
      title={t("distance.hero.title")}
      subtitle={t("distance.hero.subtitle")}
      groups={[{ key: "main", cards }]}
    />
  );
};

export default DistanceSwimmingHome;
