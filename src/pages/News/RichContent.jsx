// src/pages/News/RichContent.jsx
// Renders the HTML an admin wrote in the article editor. The HTML is cleaned
// first, so nothing but formatting, links, images and files can get through.
import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { apiUrl } from "../../lib/api.js";
import "./rich-content.css";

const purifier = DOMPurify(window);

const isInternal = (href) => href.startsWith("/") && !href.startsWith("/api/");

purifier.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "IMG") {
    // Uploaded images are stored as "/api/media/<id>"; point them at the API host.
    node.setAttribute("src", apiUrl(node.getAttribute("src") ?? ""));
    node.setAttribute("loading", "lazy");
  }
  if (node.tagName === "A" && node.hasAttribute("href")) {
    const href = node.getAttribute("href");
    node.setAttribute("href", apiUrl(href));
    if (isInternal(href) || href.startsWith("#")) {
      node.removeAttribute("target");
    } else {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  }
});

const clean = (html) =>
  purifier.sanitize(html ?? "", {
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
  });

const RichContent = ({ html, className = "" }) => {
  const safe = useMemo(() => clean(html), [html]);
  return <div className={`pfm-rich ${className}`} dangerouslySetInnerHTML={{ __html: safe }} />;
};

export default RichContent;
