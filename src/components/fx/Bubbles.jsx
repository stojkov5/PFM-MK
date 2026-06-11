// src/components/fx/Bubbles.jsx
import React, { useMemo } from "react";
import "./Bubbles.css";

/* deterministic pseudo-random so render stays pure */
const pseudoRandom = (seed) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const Bubbles = ({ count = 12 }) => {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: pseudoRandom(i * 5 + 1) * 100,
        size: 6 + pseudoRandom(i * 5 + 2) * 18,
        duration: 9 + pseudoRandom(i * 5 + 3) * 10,
        delay: pseudoRandom(i * 5 + 4) * 12,
        drift: -30 + pseudoRandom(i * 5 + 5) * 60,
      })),
    [count]
  );

  return (
    <div className="pfm-bubbles" aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="pfm-bubble"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--pfm-bubble-drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Bubbles;
