// src/pages/About/StructurePage.jsx
// The organisational structure, rebuilt from the official PDF as an
// interactive chart (SVG on wide screens, stacked tiers on narrow ones) with
// the numbered descriptions beside it. The PDF stays available to download.
import React, { useCallback, useRef, useState } from "react";
import { FiEye, FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import { STRUCTURE } from "../../data/structure.js";
import AboutHero from "./AboutHero.jsx";
import OrgChart from "./OrgChart.jsx";
import OrgTiers from "./OrgTiers.jsx";
import StructureToc from "./StructureToc.jsx";
import "./structure.css";

const PDF = encodeURI("/documents/Организациска Структура.pdf");
const ALL_IDS = STRUCTURE.mk.sections.flatMap((s) => s.items.map((i) => i.id));
// Matches the breakpoint in structure.css where the descriptions sit beside
// the chart in their own scrolling panel.
const SIDE_BY_SIDE = "(min-width: 1280px)";

const StructurePage = () => {
  const { t, i18n } = useTranslation();
  const data = STRUCTURE[(i18n.resolvedLanguage || i18n.language) === "en" ? "en" : "mk"];

  const [open, setOpen] = useState(() => new Set());
  const [active, setActive] = useState(null);
  const [hover, setHover] = useState(null);
  const tocRef = useRef(null);

  const allOpen = open.size === ALL_IDS.length;

  const toggle = useCallback((id) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActive(id);
  }, []);

  // Chart click: open the description and bring it into view.
  const select = useCallback((id) => {
    setOpen((prev) => new Set(prev).add(id));
    setActive(id);
    requestAnimationFrame(() => {
      const toc = tocRef.current;
      const item = toc?.querySelector(`[data-org-item="${id}"]`);
      if (!item) return;
      if (window.matchMedia(SIDE_BY_SIDE).matches) {
        // Leave room for the panel's pinned header.
        const head = toc.firstElementChild.offsetHeight;
        const top = item.getBoundingClientRect().top - toc.getBoundingClientRect().top;
        toc.scrollTo({ top: toc.scrollTop + top - head - 8, behavior: "smooth" });
      } else {
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }, []);

  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(ALL_IDS));

  return (
    <AboutHero
      wide
      kicker={t("about.structure.kicker")}
      title={t("about.structure.title")}
      subtitle={t("about.structure.subtitle")}
    >
      <Reveal>
        <div className="pfm-org-toolbar">
          <p className="pfm-org-hint">
            <span className="pfm-org-hint-wide">{t("about.structure.hintWide")}</span>
            <span className="pfm-org-hint-narrow">{t("about.structure.hintNarrow")}</span>
          </p>
          <div className="pfm-aboutpg-actions">
            <a className="pfm-aboutpg-btn" href={PDF} target="_blank" rel="noopener noreferrer">
              <FiEye /> {t("documents.actions.preview")}
            </a>
            <a className="pfm-aboutpg-btn is-primary" href={PDF} download>
              <FiDownload /> {t("about.structure.download")}
            </a>
          </div>
        </div>

        <div className="pfm-org-layout">
          <div className="pfm-org-chart">
            <div className="pfm-org-chart-wide">
              <OrgChart
                nodes={data.nodes}
                title={t("about.structure.title")}
                hover={hover}
                active={active}
                onHover={setHover}
                onSelect={select}
              />
              <ul className="pfm-org-legend" aria-hidden="true">
                {["assembly", "governance", "executive", "vps", "expertRow", "commissions", "other"].map(
                  (tier) => (
                    <li key={tier}>
                      <span className={`pfm-org-swatch tone-${tier}`} />
                      {data.tiers[tier]}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="pfm-org-chart-narrow">
              <OrgTiers data={data} open={open} onToggle={toggle} />
            </div>
          </div>

          <StructureToc
            ref={tocRef}
            data={data}
            title={t("about.structure.tocTitle")}
            open={open}
            active={active}
            hover={hover}
            allOpen={allOpen}
            toggleAllLabel={t(allOpen ? "about.structure.collapseAll" : "about.structure.expandAll")}
            onToggle={toggle}
            onToggleAll={toggleAll}
            onHover={setHover}
          />
        </div>
      </Reveal>
    </AboutHero>
  );
};

export default StructurePage;
