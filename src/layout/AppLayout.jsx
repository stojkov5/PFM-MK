// src/layout/AppLayout.jsx
import React from "react";
import Navbar from "../components/Navbar.jsx";
import "../App.css";
import Footer from "../components/Footer.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import PageTransition from "../components/fx/PageTransition.jsx";
import ClickRipple from "../components/fx/ClickRipple.jsx";

const AppLayout = () => {
  return (
    <div className=" pfm-site min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      <ClickRipple />
      <Navbar />
      <main className="pfm-site-main ">
        <PageTransition />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
