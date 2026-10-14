// src/pages/About/OrgTiers.jsx
// The organisational chart as stacked tiers of cards (phones / portrait
// tablets), where the wide SVG would be too small to read. Tapping a card
// with a description opens it inline.
import React from "react";
import { FiChevronDown } from "react-icons/fi";
import { DESCRIBED } from "../../data/structure.js";
import { PRESIDENT_PHOTO } from "./OrgChart.jsx";
import { Points } from "./StructureToc.jsx";

const TIERS = [
  { id: "assembly", nodes: ["assembly"] },
  { id: "governance", nodes: ["president", "board", "supervisory"] },
  { id: "executive", nodes: ["gensec", "sportdir", "finance", "pr"] },
  { id: "vps", nodes: ["vpSwim", "vpOpen", "vpPolo"] },
  { id: "expertRow", nodes: ["selector", "expert", "techdir"] },
  { id: "commissions", nodes: ["judges", "coaches", "licensing", "antidoping", "orgcommittee"] },
  { id: "other", nodes: ["disciplinary", "appeals", "women", "infrastructure", "international", "education"] },
];

const OrgTiers = ({ data, open, onToggle }) => {
  const items = Object.fromEntries(
    data.sections.flatMap((s) => s.items).map((i) => [i.id, i])
  );

  return (
    <ol className="pfm-org-tiers">
      {TIERS.map((tier) => (
        <li key={tier.id} className={`pfm-org-tier tone-${tier.id}`}>
          <div className="pfm-org-tier-label">{data.tiers[tier.id]}</div>
          <ul className="pfm-org-tier-grid">
            {tier.nodes.map((id) => {
              const [title, sub] = data.nodes[id];
              const tone = tier.id === "other" ? "commissions" : tier.id;
              const linked = DESCRIBED.has(id);
              const isOpen = linked && open.has(id);
              const body = (
                <>
                  {id === "president" && (
                    <img className="pfm-org-card-photo" src={PRESIDENT_PHOTO} alt="" />
                  )}
                  <span className="pfm-org-card-text">
                    <span className="pfm-org-card-title">{title}</span>
                    {sub && <span className="pfm-org-card-sub">{sub}</span>}
                  </span>
                  {linked && <FiChevronDown className="pfm-org-card-chev" aria-hidden="true" />}
                </>
              );

              return (
                <li key={id} className={`pfm-org-card tone-${tone}${isOpen ? " is-open" : ""}`}>
                  {linked ? (
                    <button
                      type="button"
                      className="pfm-org-card-head"
                      aria-expanded={isOpen}
                      onClick={() => onToggle(id)}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="pfm-org-card-head">{body}</div>
                  )}
                  {isOpen && (
                    <div className="pfm-org-card-body">
                      <Points points={items[id].points} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
};

export default OrgTiers;
