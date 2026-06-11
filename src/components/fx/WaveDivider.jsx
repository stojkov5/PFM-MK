// src/components/fx/WaveDivider.jsx
import React from "react";
import "./WaveDivider.css";

const WAVE_PATH = "M0,60 Q360,120 720,60 T1440,60 T2160,60 T2880,60 V120 H0 Z";

const layers = [
  { className: "pfm-wave-layer-1", fill: "rgba(56, 189, 248, 0.10)" },
  { className: "pfm-wave-layer-2", fill: "rgba(37, 99, 235, 0.14)" },
  { className: "pfm-wave-layer-3", fill: "rgba(148, 163, 184, 0.08)" },
];

const WaveDivider = ({ flip = false, height = 90 }) => (
  <div
    className={`pfm-wave-divider ${flip ? "pfm-wave-flip" : ""}`}
    style={{ height: `${height}px` }}
    aria-hidden="true"
  >
    {layers.map((l) => (
      <div key={l.className} className={`pfm-wave-layer ${l.className}`}>
        <svg viewBox="0 0 2880 120" preserveAspectRatio="none">
          <path d={WAVE_PATH} fill={l.fill} />
        </svg>
      </div>
    ))}
  </div>
);

export default WaveDivider;
