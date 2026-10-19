import React from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { formatGhs, quote, employeesLine } from "../../api/billing";
import "./Pricing.css";

const ORDER = ["free", "starter", "growth", "business", "enterprise"];

// Plan cards. Public mode links to sign-up; billing mode calls onChoose(plan) for the signed-in admin.
//   plans, offer                 from GET /api/billing/plans (or the Billing page payload)
//   interval                     'monthly' | 'yearly'
//   current                      { plan, interval, status, billingMode } for billing mode
//   employees, discountPercent   for "your price" in billing mode
const PricingPlans = ({ plans, offer, interval, mode = "public", current, employees = 0, discountPercent = 0, paymentsEnabled = false, busy = "", onChoose }) => {
  const rank = (code) => ORDER.indexOf(code);
  const currentRank = current ? rank(current.plan) : -1;
  const paidActive = current && current.status === "active" && current.billingMode === "paystack";

  const cta = (plan) => {
    if (mode === "public") {
      if (plan.code === "enterprise") return <Link to="/contact#request-demo" className="btn btn-secondary btn-block">Contact us</Link>;
      return (
        <Link to="/register-organisation" className={`btn btn-block ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}>
          {plan.code === "free" ? "Start free" : "Start 30-day free trial"}
        </Link>
      );
    }
    if (plan.code === "enterprise") return <Link to="/contact#request-demo" className="btn btn-secondary btn-block">Contact us</Link>;
    const isCurrent = current && current.plan === plan.code && (plan.code === "free" || (paidActive && current.interval === interval && !current.cancelAtPeriodEnd));
    if (isCurrent) return <button type="button" className="btn btn-outline btn-block" disabled>Current plan</button>;
    if (plan.code === "free") {
      if (!paidActive || current.cancelAtPeriodEnd) return <button type="button" className="btn btn-ghost btn-block" disabled>{current && current.cancelAtPeriodEnd ? "Moves to Free after your plan ends" : "Available when your trial ends"}</button>;
      return <button type="button" className="btn btn-ghost btn-block choose-free" onClick={() => onChoose(plan)} disabled={Boolean(busy)}>Switch to Free at renewal</button>;
    }
    const label = !paidActive ? `Choose ${plan.name}` : rank(plan.code) > currentRank ? `Upgrade to ${plan.name}` : rank(plan.code) < currentRank ? `Switch to ${plan.name}` : `Switch to ${interval}`;
    return (
      <button
        type="button"
        className={`btn btn-block choose-plan ${plan.highlighted || rank(plan.code) > currentRank ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onChoose(plan)}
        disabled={!paymentsEnabled || Boolean(busy)}
        data-plan={plan.code}
      >
        {busy === plan.code && <span className="spinner" aria-hidden="true" />} {label}
      </button>
    );
  };

  return (
    <div className={`pricing-grid pricing-${mode}`}>
      {plans.map((plan) => {
        const price = interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
        const isPaid = price !== null && price > 0;
        const founding = offer && isPaid && mode === "public" ? quote(plan, interval, 0, offer.percentOff) : null;
        const mine = mode === "billing" && isPaid ? quote(plan, interval, employees, discountPercent) : null;
        return (
          <article className={`pricing-card${plan.highlighted ? " highlighted" : ""}${current && current.plan === plan.code ? " current" : ""}`} key={plan.code} data-plan={plan.code}>
            {plan.highlighted && <span className="pricing-flag"><Star size={13} aria-hidden="true" /> Most popular</span>}
            <h3 className="pricing-name">{plan.name}</h3>
            {plan.tagline && <p className="pricing-tagline">{plan.tagline}</p>}
            <p className="pricing-price">
              {price === null ? (
                <span className="pricing-amount">Custom</span>
              ) : (
                <>
                  <span className="pricing-amount">{formatGhs(price)}</span>
                  {isPaid && <span className="pricing-per">/{interval === "yearly" ? "year" : "month"}</span>}
                </>
              )}
            </p>
            <p className="pricing-sub">
              {price === null ? "Priced to fit your organisation" : !isPaid ? "No card needed" : interval === "yearly" ? `${formatGhs(Math.round(price / 12))} a month, billed yearly` : "Billed monthly, cancel any time"}
            </p>
            {founding && (
              <p className="pricing-founding">Founding price: <strong>{formatGhs(founding.total)}</strong>/{interval === "yearly" ? "year" : "month"} for {offer.months} months</p>
            )}
            {mine && (
              <p className="pricing-yours">
                Your price: <strong>{formatGhs(mine.total)}</strong>/{interval === "yearly" ? "year" : "month"}
                {mine.extras > 0 && <span> ({mine.extras} extra employee{mine.extras === 1 ? "" : "s"})</span>}
                {mine.discount > 0 && <span> after {discountPercent}% founding discount</span>}
              </p>
            )}
            <ul className="pricing-features">
              <li><Check size={16} aria-hidden="true" /> {employeesLine(plan)}</li>
              {plan.featureList.map((f) => <li key={f}><Check size={16} aria-hidden="true" /> {f}</li>)}
            </ul>
            <div className="pricing-cta">{cta(plan)}</div>
          </article>
        );
      })}
    </div>
  );
};

export default PricingPlans;
