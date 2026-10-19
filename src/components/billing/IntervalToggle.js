import React from "react";

// Monthly / yearly switch used by the pricing section and the Billing page
const IntervalToggle = ({ value, onChange, idPrefix = "interval" }) => (
  <div className="interval-toggle" role="group" aria-label="Billing period">
    {[["monthly", "Monthly"], ["yearly", "Yearly"]].map(([key, label]) => (
      <button
        key={key}
        type="button"
        id={`${idPrefix}-${key}`}
        className={value === key ? "active" : ""}
        aria-pressed={value === key}
        onClick={() => onChange(key)}
      >
        {label}
        {key === "yearly" && <span className="interval-save">2 months free</span>}
      </button>
    ))}
  </div>
);

export default IntervalToggle;
