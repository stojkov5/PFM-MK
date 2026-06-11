// src/components/fx/ClickRipple.jsx
import React, { useEffect, useState } from "react";
import "./ClickRipple.css";

const ClickRipple = () => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const id = `${Date.now()}-${Math.random()}`;
      setRipples((prev) => [
        ...prev.slice(-5),
        { id, x: e.clientX, y: e.clientY },
      ]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 750);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="pfm-ripple-layer" aria-hidden="true">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pfm-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </div>
  );
};

export default ClickRipple;
