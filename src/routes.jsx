// src/routes.jsx
import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";

import AppLayout from "./layout/AppLayout.jsx";

// --- page imports (for now just simple placeholders) ---
import HomePage from "./pages/Home/HomePage.jsx";

import SwimmingLayout from "./pages/Swimming/SwimmingLayout.jsx";
import SwimmingHome from "./pages/Swimming/SwimmingHome.jsx";
import SwimmingCalendarNational from "./pages/Swimming/CalendarNational.jsx";
import SwimmingCalendarInternational from "./pages/Swimming/CalendarInternational.jsx";
import SwimmingRecords from "./pages/Swimming/Records.jsx";
import SwimmingCriteria from "./pages/Swimming/Criteria.jsx";
import RecordApplication from "./pages/Swimming/RecordApplication.jsx";

import WaterpoloHome from "./pages/Waterpolo/WaterpoloHome.jsx";
import WaterpoloPrograms from "./pages/Waterpolo/WaterpoloPrograms.jsx";
import WaterpoloCalendarNational from "./pages/Waterpolo/WaterpoloCalendarNational.jsx";
import WaterpoloCalendarInternational from "./pages/Waterpolo/WaterpoloCalendarInternational.jsx";
import WaterpoloRecords from "./pages/Waterpolo/WaterpoloRecords.jsx";
import WaterpoloCriteria from "./pages/Waterpolo/WaterpoloCriteria.jsx";

import DistanceSwimmingHome from "./pages/DistanceSwimming/DistanceSwimmingHome.jsx";
import DistanceSwimmingCalendar from "./pages/DistanceSwimming/DistanceSwimmingCalendar.jsx";
import OhridMarathon from "./pages/DistanceSwimming/OhridMarathon.jsx";
import DistanceSwimmingNews from "./pages/DistanceSwimming/DistanceSwimmingNews.jsx";

import News from "./pages/News/News.jsx";
import NewsArticle from "./pages/News/NewsArticle.jsx";
import CalendarHub from "./pages/Calendar/CalendarHub.jsx";
import Clubs from "./pages/Clubs/Clubs.jsx";
import AboutPage from "./pages/About/AboutPage.jsx";
import StructurePage from "./pages/About/StructurePage.jsx";
import PartnersPage from "./pages/About/PartnersPage.jsx";
import Documents from "./components/Documents.jsx";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // SWIMMING — every page renders under the shared hero + section bar
      {
        path: "swimming",
        element: <SwimmingLayout />,
        children: [
          { index: true, element: <SwimmingHome /> },
          { path: "calendar-national", element: <SwimmingCalendarNational /> },
          { path: "calendar-international", element: <SwimmingCalendarInternational /> },
          { path: "records", element: <SwimmingRecords /> },
          { path: "criteria", element: <SwimmingCriteria /> },
          { path: "record-application", element: <RecordApplication /> },
          // Old clubs URL, kept so existing links still land on /clubs.
          { path: "clubs", loader: () => redirect("/clubs") },
        ],
      },

      // WATERPOLO
      { path: "waterpolo", element: <WaterpoloHome /> },
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
      { path: "distance-swimming", element: <DistanceSwimmingHome /> },
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

      // ADMIN (admins get a link in the navbar's account menu). Lazy so the
      // admin UI is only downloaded when someone opens /admin.
      {
        path: "admin/*",
        lazy: async () => ({
          Component: (await import("./pages/Admin/AdminRoot.jsx")).default,
        }),
      },

      // NEWS
      { path: "news", element: <News /> },
      { path: "news/:slug", element: <NewsArticle /> },
      // CALENDAR (all sports)
      { path: "calendar", element: <CalendarHub /> },
      // ABOUT US
      { path: "about", element: <AboutPage /> },
      { path: "about/structure", element: <StructurePage /> },
      { path: "about/partners", element: <PartnersPage /> },
      // CLUBS (swimming + water polo)
      { path: "clubs", element: <Clubs /> },
      // DOCUMENTS
      { path: "documents", element: <Documents /> }
    ],
  },
]);
