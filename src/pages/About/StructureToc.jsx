// src/pages/About/StructureToc.jsx
// The numbered descriptions from the PDF's side column, as an accordion.
// Items are linked both ways with the chart: hovering one highlights its box,
// clicking a box opens and scrolls to its item.
import React, { forwardRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export const Points = ({ points }) => (
  <ul className="pfm-org-points">
    {points.map((p) =>
      Array.isArray(p) ? (
        <li key={p[0]}>
          {p[0]}
          <ul>
            {p[1].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </li>
      ) : (
        <li key={p}>{p}</li>
      )
    )}
  </ul>
);

const StructureToc = forwardRef(
  ({ data, title, open, active, hover, allOpen, toggleAllLabel, onToggle, onToggleAll, onHover }, ref) => (
    <aside className="pfm-org-toc" ref={ref} aria-label={title}>
      <div className="pfm-org-toc-head">
        <h2 className="pfm-org-toc-title">{title}</h2>
        <button type="button" className="pfm-org-toc-all" onClick={onToggleAll} aria-pressed={allOpen}>
          {toggleAllLabel}
        </button>
      </div>

      {data.sections.map((section, si) => (
        <section key={section.title} className="pfm-org-toc-section">
          <h3 className="pfm-org-toc-section-title">
            <span>{si + 1}.</span> {section.title}
          </h3>
          <ul>
            {section.items.map((item, ii) => {
              const isOpen = open.has(item.id);
              const state = `${active === item.id ? " is-active" : ""}${hover === item.id ? " is-hover" : ""}`;
              return (
                <li key={item.id} className={`pfm-org-toc-item${state}`} data-org-item={item.id}>
                  <button
                    type="button"
                    className="pfm-org-toc-btn"
                    aria-expanded={isOpen}
                    onClick={() => onToggle(item.id)}
                    onMouseEnter={() => onHover(item.id)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <span className="pfm-org-toc-num">
                      {si + 1}.{ii + 1}
                    </span>
                    <span className="pfm-org-toc-label">{item.title}</span>
                    <FiChevronDown className="pfm-org-toc-chev" aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div className="pfm-org-toc-body">
                      <Points points={item.points} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </aside>
  )
);

StructureToc.displayName = "StructureToc";

export default StructureToc;
