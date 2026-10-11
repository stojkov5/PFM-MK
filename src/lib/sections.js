// src/lib/sections.js
// Site sections whose pages share one layout (a hero with a section bar, see
// pages/Swimming/SwimmingLayout.jsx). Moving between pages of the same section
// keeps that layout mounted and the scroll position where it is.
const SECTIONS = ["/swimming"];

// The section a path belongs to, or null.
export const sectionOf = (pathname) =>
  SECTIONS.find((root) => pathname === root || pathname.startsWith(`${root}/`)) ?? null;
