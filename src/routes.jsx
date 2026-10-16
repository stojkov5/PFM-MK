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
import CompetitionSubmit from "./pages/Swimming/CompetitionSubmit.jsx";

import WaterpoloLayout from "./pages/Waterpolo/WaterpoloLayout.jsx";
import WaterpoloHome from "./pages/Waterpolo/WaterpoloHome.jsx";
import WaterpoloCalendar from "./pages/Waterpolo/WaterpoloCalendar.jsx";

import DistanceSwimmingHome from "./pages/DistanceSwimming/DistanceSwimmingHome.jsx";
import DistanceSwimmingCalendar from "./pages/DistanceSwimming/DistanceSwimmingCalendar.jsx";
import DistanceSwimmingLayout from "./pages/DistanceSwimming/DistanceSwimmingLayout.jsx";
import DistanceSwimmingCriteria from "./pages/DistanceSwimming/DistanceSwimmingCriteria.jsx";

import News from "./pages/News/News.jsx";
import NewsArticle from "./pages/News/NewsArticle.jsx";
import CalendarHub from "./pages/Calendar/CalendarHub.jsx";
import Clubs from "./pages/Clubs/Clubs.jsx";
import ClubAccount from "./pages/ClubAccount/ClubAccount.jsx";
import Welcome from "./pages/Welcome/Welcome.jsx";
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
          // Clubs register competitions here (and fix them via their emailed edit link).
          { path: "calendar-national/submit", element: <CompetitionSubmit /> },
          { path: "calendar-international", element: <SwimmingCalendarInternational /> },
          { path: "records", element: <SwimmingRecords /> },
          { path: "criteria", element: <SwimmingCriteria /> },
          { path: "record-application", element: <RecordApplication /> },
          // Old clubs URL, kept so existing links still land on /clubs.
          { path: "clubs", loader: () => redirect("/clubs") },
        ],
      },

      // WATERPOLO — same hero + section bar as swimming
      {
        path: "waterpolo",
        element: <WaterpoloLayout />,
        children: [
          { index: true, element: <WaterpoloHome /> },
          { path: "calendar", element: <WaterpoloCalendar /> },
          // Old pages, kept so existing links still land somewhere useful.
          { path: "calendar-national", loader: () => redirect("/waterpolo/calendar") },
          { path: "calendar-international", loader: () => redirect("/waterpolo/calendar") },
          { path: "programs", loader: () => redirect("/waterpolo") },
          { path: "records", loader: () => redirect("/waterpolo") },
          { path: "criteria", loader: () => redirect("/waterpolo") },
        ],
      },

      // DISTANCE SWIMMING — same hero + section bar as swimming
      {
        path: "distance-swimming",
        element: <DistanceSwimmingLayout />,
        children: [
          { index: true, element: <DistanceSwimmingHome /> },
          { path: "calendar", element: <DistanceSwimmingCalendar /> },
          { path: "criteria", element: <DistanceSwimmingCriteria /> },
          // Old pages, kept so existing links still land somewhere useful.
          { path: "news", loader: () => redirect("/distance-swimming") },
          { path: "ohrid-marathon", loader: () => redirect("/distance-swimming") },
        ],
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
      // A club account's own page ("My club" in the navbar's account menu).
      { path: "club", element: <ClubAccount /> },
      // After sign-up: choose swimmer / player or club (see SIGN_UP_REDIRECT).
      { path: "welcome", element: <Welcome /> },
      // DOCUMENTS
      { path: "documents", element: <Documents /> }
    ],
  },
]);
