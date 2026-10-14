// src/pages/Swimming/PillSwitch.jsx
// Pill switch between a few options (pool length, gender). Styled in Records.css.
import React from "react";

const PillSwitch = ({ label, options, value, onChange }) => (
  <div className="pfm-rec-switch" role="group" aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`pfm-rec-switch-btn ${option.value === value ? "is-active" : ""}`}
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default PillSwitch;
