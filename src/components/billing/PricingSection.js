import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import PricingPlans from "./PricingPlans";
import IntervalToggle from "./IntervalToggle";

// Public pricing: tiers and prices come from the API (the owner edits them in the console)
const PricingSection = ({ headingLevel = "h2" }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [interval, setInterval] = useState("monthly");
  const Heading = headingLevel;

  const load = () => {
    setError("");
    api.get("/api/billing/plans").then((res) => setData(res.data)).catch((err) => setError(getErrorMessage(err, "Prices could not be loaded.")));
  };
  useEffect(load, []);

  return (
    <div className="pricing-section">
      <div className="section-head pricing-head">
        <p className="eyebrow">Pricing</p>
        <Heading>Simple plans in Ghana cedis</Heading>
        <p>Every new organisation starts with a 30-day Growth trial. No card needed. After the trial, choose a plan or carry on with Free.</p>
      </div>
      <div className="pricing-toolbar">
        <IntervalToggle value={interval} onChange={setInterval} idPrefix="pricing" />
        {data && data.offer && (
          <p className="pricing-offer" role="note">
            <strong>Founding offer:</strong> {data.offer.places ? `the first ${data.offer.places} paying organisations get` : "paying organisations get"} {data.offer.percentOff}% off for {data.offer.months} months.
          </p>
        )}
      </div>
      {error && (
        <div className="alert alert-warning pricing-error" role="alert">
          {error} <button type="button" className="btn btn-ghost btn-sm" onClick={load}>Try again</button>
        </div>
      )}
      {!data && !error && <p className="muted pricing-loading">Loading prices…</p>}
      {data && <PricingPlans plans={data.plans} offer={data.offer} interval={interval} mode="public" />}
      <p className="pricing-note">
        Prices are per organisation, not per user. Payments are made securely through Paystack (card or mobile money). If a payment fails or a plan ends, you get a 7-day grace period; after that the organisation moves to Free. Your data is never deleted.
      </p>
    </div>
  );
};

export default PricingSection;
