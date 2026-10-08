// src/pages/Calendar/CalendarHub.jsx
// One place that links to every competition calendar, grouped by sport.
import React from "react";
import { FiCalendar, FiGlobe } from "react-icons/fi";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";
import { useTranslation } from "react-i18next";
import SportHub from "../../components/SportHub.jsx";

const CalendarHub = () => {
  const { t } = useTranslation();

  const national = (to) => ({
    to,
    icon: <FiCalendar />,
    label: t("calendarHub.national.title"),
    desc: t("calendarHub.national.desc"),
  });
  const international = (to) => ({
    to,
    icon: <FiGlobe />,
    label: t("calendarHub.international.title"),
    desc: t("calendarHub.international.desc"),
  });

  const groups = [
    {
      key: "swimming",
      title: t("navbar.sports.swimming.title"),
      icon: <TbSwimming />,
      cards: [
        national("/swimming/calendar-national"),
        international("/swimming/calendar-international"),
      ],
    },
    {
      key: "waterpolo",
      title: t("navbar.sports.waterpolo.title"),
      icon: <TbWaterpolo />,
      cards: [
        national("/waterpolo/calendar-national"),
        international("/waterpolo/calendar-international"),
      ],
    },
    {
      key: "distance",
      title: t("navbar.sports.distance.title"),
      icon: <TiWaves />,
      cards: [
        {
          to: "/distance-swimming/calendar",
          icon: <FiCalendar />,
          label: t("calendarHub.distance.title"),
          desc: t("calendarHub.distance.desc"),
        },
      ],
    },
  ];

  return (
    <SportHub
      kicker={t("calendarHub.hero.kicker")}
      title={t("calendarHub.hero.title")}
      subtitle={t("calendarHub.hero.subtitle")}
      groups={groups}
    />
  );
};

export default CalendarHub;
