// src/pages/Home/HomePage.jsx
import React from "react";
import "./HomePage.css";
import Landing from "./Landing";
import HomeHighlights from "./HomeHighlights";
import HomeAbout from "./HomeAbout";
import HomeDisciplines from "./HomeDisciplines";

const HomePage = () => {
  return (
    <>
      <Landing />
      <HomeHighlights />
      <HomeAbout />
      <HomeDisciplines />
     
    </>
  );
};

export default HomePage;
