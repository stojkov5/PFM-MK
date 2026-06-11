// src/pages/Home/HomePage.jsx
import React from "react";
import "./HomePage.css";
import Landing from "./Landing";
import HomeHighlights from "./HomeHighlights";
import HomeAbout from "./HomeAbout";
import HomeDisciplines from "./HomeDisciplines";
import WaveDivider from "../../components/fx/WaveDivider.jsx";

const HomePage = () => {
  return (
    <>
      <Landing />
      <WaveDivider flip />
      <HomeHighlights />
      <WaveDivider />
      <HomeAbout />
      <WaveDivider flip />
      <HomeDisciplines />
    </>
  );
};

export default HomePage;
