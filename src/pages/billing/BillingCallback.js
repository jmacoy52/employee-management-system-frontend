import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import AppLayout from "../../components/layout/AppLayout";
import AdminNav from "../../components/layout/AdminNav";
import "./Billing.css";

// Paystack sends the admin back here with ?reference=…; the payment is verified server-side.
const RESULTS = {
  activated: ["success", "Payment received", "Your new plan is active. A receipt and invoice are in your payment history."],
  already: ["success", "Payment received", "This payment has already been confirmed. Your plan is active."],
  pending: ["pending", "Payment still processing", "Paystack has not confirmed this payment yet. This page will update on the Billing page within a few minutes; you do not need to pay again."],
  ongoing: ["pending", "Payment still processing", "Paystack has not confirmed this payment yet. Check the Billing page again in a few minutes; you do not need to pay again."],
  failed: ["failed", "Payment not completed", "The payment did not go through and you have not been charged. You can try again from the Billing page."],
  abandoned: ["failed", "Payment not completed", "The payment was not finished. You can try again from the Billing page."],
  mismatch: ["failed", "Payment needs checking", "The amount received did not match your plan, so it was not applied. Contact the EmploCore team and quote the reference below."],
};

const BillingCallback = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const [state, setState] = useState(reference ? "checking" : "missing");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!reference || ran.current) return;
    ran.current = true;
    api.post("/api/billing/verify", { reference })
      .then((res) => setState(RESULTS[res.data.status] ? res.data.status : "pending"))
      .catch((err) => { setMessage(getErrorMessage(err, "The payment could not be checked.")); setState("error"); });
  }, [reference]);

  const result = RESULTS[state];
  const tone = result ? result[0] : state === "checking" ? "pending" : "failed";
  const Icon = tone === "success" ? CheckCircle2 : tone === "pending" ? Clock : XCircle;

  return (
    <AppLayout nav={<AdminNav />} title="Payment" subtitle="Confirming your payment with Paystack." className="billing-callback-page">
      <section className={`card billing-result billing-result-${tone}`} aria-live="polite">
        <Icon size={36} aria-hidden="true" />
        <div>
          <h2 className="card-title">
            {state === "checking" ? "Checking your payment…" : result ? result[1] : state === "missing" ? "No payment reference" : "Payment could not be checked"}
          </h2>
          <p>
            {state === "checking" ? "This takes a few seconds." : result ? result[2] : state === "missing" ? "Open the Billing page to see your plan and payments." : `${message} Your payment is safe; check the Billing page in a few minutes.`}
          </p>
          {reference && <p className="muted billing-ref">Reference: <code>{reference}</code></p>}
          <Link to="/admin/billing" className="btn btn-primary">Go to Billing</Link>
        </div>
      </section>
    </AppLayout>
  );
};

export default BillingCallback;
