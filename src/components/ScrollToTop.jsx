// src/components/ScrollToTop.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { sectionOf } from "../lib/sections.js";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    const from = previous.current;
    previous.current = pathname;

    // Switching pages inside one section (e.g. the swimming section bar) only
    // swaps the content under the hero, so the page stays where it is.
    const section = sectionOf(pathname);
    if (from !== pathname && section && section === sectionOf(from)) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // change to "smooth" if you want animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
