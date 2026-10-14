// src/pages/About/OrgChart.jsx
// The organisational chart drawn as inline SVG (desktop / landscape tablet).
// Layout mirrors the official PDF; labels come from src/data/structure.js and
// are wrapped to fit their box, so both languages share one layout.
import React, { useMemo } from "react";
import { FiStar, FiDollarSign, FiSettings, FiInfo, FiGlobe } from "react-icons/fi";
import { DESCRIBED } from "../../data/structure.js";

export const PRESIDENT_PHOTO = "/Images/structure/president.jpg";

const W = 1170;
const H = 676;

// x, y, w, h in viewBox units. `size` is the title font size.
const NODES = [
  { id: "assembly", x: 550, y: 20, w: 320, h: 64, tone: "assembly", icon: FiStar, size: 21 },

  { id: "board", x: 270, y: 140, w: 220, h: 64, tone: "governance", icon: FiDollarSign },
  { id: "president", x: 590, y: 140, w: 240, h: 64, tone: "governance", icon: FiSettings, photo: true },
  { id: "supervisory", x: 920, y: 140, w: 220, h: 64, tone: "governance", icon: FiInfo },

  { id: "other", x: 20, y: 136, w: 190, h: 72, tone: "other", icon: FiGlobe },
  { id: "disciplinary", x: 20, y: 240, w: 190, h: 52, tone: "commissions", size: 13.5 },
  { id: "appeals", x: 20, y: 304, w: 190, h: 52, tone: "commissions", size: 13.5 },
  { id: "women", x: 20, y: 368, w: 190, h: 52, tone: "commissions", size: 13.5 },
  { id: "infrastructure", x: 20, y: 432, w: 190, h: 52, tone: "commissions", size: 13.5 },
  { id: "international", x: 20, y: 496, w: 190, h: 52, tone: "commissions", size: 13.5 },
  { id: "education", x: 20, y: 560, w: 190, h: 52, tone: "commissions", size: 13.5 },

  { id: "gensec", x: 310, y: 250, w: 196, h: 64, tone: "executive" },
  { id: "sportdir", x: 522, y: 250, w: 196, h: 64, tone: "executive" },
  { id: "finance", x: 734, y: 250, w: 196, h: 64, tone: "executive" },
  { id: "pr", x: 946, y: 250, w: 196, h: 64, tone: "executive" },

  { id: "vpSwim", x: 326, y: 380, w: 240, h: 64, tone: "vps" },
  { id: "vpOpen", x: 606, y: 380, w: 240, h: 64, tone: "vps" },
  { id: "vpPolo", x: 886, y: 380, w: 240, h: 64, tone: "vps" },

  { id: "selector", x: 336, y: 490, w: 220, h: 60, tone: "expertRow", size: 14.5 },
  { id: "expert", x: 616, y: 490, w: 220, h: 60, tone: "expertRow", size: 14.5 },
  { id: "techdir", x: 896, y: 490, w: 220, h: 60, tone: "expertRow", size: 14.5 },

  { id: "judges", x: 291, y: 600, w: 166, h: 64, tone: "commissions", size: 13.5 },
  { id: "coaches", x: 467, y: 600, w: 166, h: 64, tone: "commissions", size: 13.5 },
  { id: "licensing", x: 643, y: 600, w: 166, h: 64, tone: "commissions", size: 13.5 },
  { id: "antidoping", x: 819, y: 600, w: 166, h: 64, tone: "commissions", size: 13.5 },
  { id: "orgcommittee", x: 995, y: 600, w: 166, h: 64, tone: "commissions", size: 13.5 },
];

// Connectors, drawn behind the boxes. `r` rounds the bus corners.
const r = 10;
const LINES = [
  // Assembly -> governing bodies
  "M710,84 V140",
  `M380,140 V${112 + r} Q380,112 ${380 + r},112 H${1030 - r} Q1030,112 1030,${112 + r} V140`,
  // Executive Board <-> other bodies, and the commission spine
  "M210,172 H270",
  "M115,208 V560",
  // President -> executive positions
  "M710,204 V230",
  `M408,250 V${230 + r} Q408,230 ${408 + r},230 H${1044 - r} Q1044,230 1044,${230 + r} V250`,
  "M620,230 V250",
  "M832,230 V250",
  // Executive Board -> vice-presidents
  `M290,204 V${356 - r} Q290,356 ${290 + r},356 H${1006 - r} Q1006,356 1006,${356 + r} V380`,
  "M446,356 V380",
  "M726,356 V380",
  // Vice-presidents -> technical functions
  "M446,444 V490",
  "M726,444 V490",
  "M1006,444 V490",
  "M446,467 H1006",
  // Technical bodies -> commissions
  "M726,550 V578",
  `M374,600 V${578 + r} Q374,578 ${374 + r},578 H${1078 - r} Q1078,578 1078,${578 + r} V600`,
  "M550,578 V600",
  "M902,578 V600",
];

// ---- text fitting -------------------------------------------------------
let ctx;
const measure = (text, size, weight) => {
  if (typeof document === "undefined") return text.length * size * 0.56;
  ctx ??= document.createElement("canvas").getContext("2d");
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  ctx.font = `${weight} ${size}px ${family}`;
  return ctx.measureText(text).width;
};

const wrap = (text, maxWidth, size, weight) => {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, weight) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
};

// Shrinks the title until title + subtitle fit inside the box.
const fitLabel = (node, label) => {
  const [title, sub] = label;
  const padX = node.photo ? 52 : 14;
  const maxW = node.w - padX - 14;
  const maxH = node.h - 12;
  let size = node.size ?? 16;
  for (;;) {
    const lh = size * 1.18;
    const subSize = Math.max(11, size - 3);
    const titleLines = wrap(title, maxW, size, 800);
    const subLines = sub ? wrap(sub, maxW, subSize, 500) : [];
    const height = titleLines.length * lh + subLines.length * subSize * 1.25;
    if (height <= maxH || size <= 10.5) {
      return { size, lh, subSize, titleLines, subLines, height, padX };
    }
    size -= 0.5;
  }
};

// ---- node ---------------------------------------------------------------
const Node = ({ node, label, state, onHover, onSelect }) => {
  const fit = useMemo(() => fitLabel(node, label), [node, label]);
  const linked = DESCRIBED.has(node.id);
  const { x, y, w, h, icon: Icon, photo } = node;

  const cx = x + fit.padX / 2 + w / 2 - 7;
  const top = y + (h - fit.height) / 2;
  const subLh = fit.subSize * 1.25;
  const subTop = top + fit.titleLines.length * fit.lh;

  const activate = () => linked && onSelect(node.id);

  return (
    <g
      className={`pfm-org-node tone-${node.tone}${linked ? " is-linked" : ""}${state}`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      tabIndex={linked ? 0 : undefined}
      role={linked ? "button" : undefined}
      aria-label={label.join(", ")}
    >
      <rect className="pfm-org-box" x={x} y={y} width={w} height={h} rx={14} />

      {photo && (
        <g className="pfm-org-photo">
          <circle cx={x + 2} cy={y + h / 2} r={36} className="pfm-org-photo-ring" />
          <image
            href={PRESIDENT_PHOTO}
            x={x + 2 - 33}
            y={y + h / 2 - 33}
            width={66}
            height={66}
            clipPath="url(#pfm-org-photo-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      )}

      <text className="pfm-org-label" textAnchor="middle">
        {fit.titleLines.map((l, i) => (
          <tspan key={`t${i}`} x={cx} y={top + i * fit.lh + fit.lh / 2 + fit.size * 0.35} className="pfm-org-title" fontSize={fit.size}>
            {l}
          </tspan>
        ))}
        {fit.subLines.map((l, i) => (
          <tspan key={`s${i}`} x={cx} y={subTop + i * subLh + subLh / 2 + fit.subSize * 0.35} className="pfm-org-sub" fontSize={fit.subSize}>
            {l}
          </tspan>
        ))}
      </text>

      {Icon && (
        <g className="pfm-org-badge">
          <circle cx={x + w - 6} cy={y + 6} r={15} />
          <Icon x={x + w - 15} y={y - 3} size={18} />
        </g>
      )}
    </g>
  );
};

const OrgChart = ({ nodes, title, hover, active, onHover, onSelect }) => (
  <svg
    className="pfm-org-svg"
    viewBox={`-14 -14 ${W + 28} ${H + 24}`}
    role="group"
    aria-label={title}
  >
    <defs>
      <clipPath id="pfm-org-photo-clip" clipPathUnits="objectBoundingBox">
        <circle cx={0.5} cy={0.5} r={0.5} />
      </clipPath>
    </defs>

    <g className="pfm-org-lines" aria-hidden="true">
      {LINES.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>

    {NODES.map((n) => (
      <Node
        key={n.id}
        node={n}
        label={nodes[n.id]}
        state={`${hover === n.id ? " is-hover" : ""}${active === n.id ? " is-active" : ""}`}
        onHover={onHover}
        onSelect={onSelect}
      />
    ))}
  </svg>
);

export default OrgChart;
