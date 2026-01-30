// src/routes.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import AppLayout from "./layout/AppLayout.jsx";

// --- page imports (for now just simple placeholders) ---
import HomePage from "./pages/Home/HomePage.jsx";

import SwimmingLayout from "./pages/Swimming/SwimmingLayout.jsx";
import Clubs from "./pages/Swimming/Clubs.jsx";
import SwimmingCalendarNational from "./pages/Swimming/CalendarNational.jsx";
import SwimmingCalendarInternational from "./pages/Swimming/CalendarInternational.jsx";
import SwimmingRecords from "./pages/Swimming/Records.jsx";
import SwimmingCriteria from "./pages/Swimming/Criteria.jsx";

import WaterpoloPrograms from "./pages/Waterpolo/WaterpoloPrograms.jsx";
import WaterpoloCalendarNational from "./pages/Waterpolo/WaterpoloCalendarNational.jsx";
import WaterpoloCalendarInternational from "./pages/Waterpolo/WaterpoloCalendarInternational.jsx";
import WaterpoloRecords from "./pages/Waterpolo/WaterpoloRecords.jsx";
import WaterpoloCriteria from "./pages/Waterpolo/WaterpoloCriteria.jsx";

import DistanceSwimmingCalendar from "./pages/DistanceSwimming/DistanceSwimmingCalendar.jsx";
import OhridMarathon from "./pages/DistanceSwimming/OhridMarathon.jsx";
import DistanceSwimmingNews from "./pages/DistanceSwimming/DistanceSwimmingNews.jsx";

import NewsList from "./pages/News/NewsList.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // SWIMMING
      { path: "swimming", element: <SwimmingLayout /> },
      { path: "swimming/clubs", element: <Clubs /> },
      {
        path: "swimming/calendar-national",
        element: <SwimmingCalendarNational />,
      },
      {
        path: "swimming/calendar-international",
        element: <SwimmingCalendarInternational />,
      },
      { path: "swimming/records", element: <SwimmingRecords /> },
      { path: "swimming/criteria", element: <SwimmingCriteria /> },

      // WATERPOLO
      { path: "waterpolo/programs", element: <WaterpoloPrograms /> },
      {
        path: "waterpolo/calendar-national",
        element: <WaterpoloCalendarNational />,
      },
      {
        path: "waterpolo/calendar-international",
        element: <WaterpoloCalendarInternational />,
      },
      { path: "waterpolo/records", element: <WaterpoloRecords /> },
      { path: "waterpolo/criteria", element: <WaterpoloCriteria /> },

      // DISTANCE SWIMMING
      {
        path: "distance-swimming/calendar",
        element: <DistanceSwimmingCalendar />,
      },
      {
        path: "distance-swimming/ohrid-marathon",
        element: <OhridMarathon />,
      },
      {
        path: "distance-swimming/news",
        element: <DistanceSwimmingNews />,
      },

      // NEWS
      { path: "news", element: <NewsList /> },
    ],
  },
]);
