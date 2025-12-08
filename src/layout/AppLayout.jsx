// src/layout/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-20 pb-10 px-4 md:px-8 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
