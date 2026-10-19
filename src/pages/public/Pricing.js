import React from "react";
import PageLayout from "../../components/layout/PageLayout";
import PricingSection from "../../components/billing/PricingSection";
import "./Home.css";

// Standalone pricing page (the same section also appears on the landing page at /#pricing)
const Pricing = () => (
  <PageLayout>
    <section className="section-block pricing-page" id="pricing">
      <div className="section-inner">
        <PricingSection headingLevel="h1" />
      </div>
    </section>
  </PageLayout>
);

export default Pricing;
