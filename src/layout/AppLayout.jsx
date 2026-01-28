// src/layout/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../App.css";
import Footer from "../components/Footer.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";


const AppLayout = () => {
  return (
    <div className=" pfm-site min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      <Navbar />
      <main className="pfm-site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
