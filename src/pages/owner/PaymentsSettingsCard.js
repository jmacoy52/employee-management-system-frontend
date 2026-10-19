import React, { useEffect, useState } from "react";
import { Copy, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import { formatDateTime } from "../../api/billing";

const YesNo = ({ value, yes = "Yes", no = "No" }) => (
  <span className={`yesno ${value ? "yes" : "no"}`}>{value ? <CheckCircle2 size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />} {value ? yes : no}</span>
);

const copy = (text) => {
  const done = () => toast.success("Copied.");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => toast.error("Copy failed: select the address and copy it."));
  else toast.error("Copy failed: select the address and copy it.");
};

// Owner: Paystack connection status. Keys live in Render's environment, never in the database or here:
// the API only says whether they are set and whether they are test or live keys.
const PaymentsSettingsCard = () => {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/api/platform/billing/settings").then((r) => setS(r.data)).catch((err) => setError(getErrorMessage(err, "Payment settings could not be loaded.")));
  }, []);

  return (
    <section className="card card-flush section payments-settings-card">
      <div className="card-header">
        <h2 className="card-title">Payments settings</h2>
        {s && (
          <span className={`badge payments-mode ${!s.connected ? "" : s.mode === "live" ? "badge-success" : "badge-warning"}`}>
            {!s.connected ? "Not connected" : s.mode === "live" ? "Paystack LIVE" : s.mode === "test" ? "Paystack TEST mode" : "Unknown key type"}
          </span>
        )}
      </div>
      {error && <p className="error owner-card-note" role="alert">{error}</p>}
      {s && (
        <>
          {s.modeMismatch && (
            <div className="alert alert-danger owner-card-alert" role="alert">The secret key is a {s.mode} key but the public key is a {s.publicKeyMode} key. Use both keys from the same mode.</div>
          )}
          {s.connected && s.mode === "test" && (
            <div className="alert alert-warning owner-card-alert" role="status">Test mode: checkouts use Paystack&apos;s test cards and <strong>no real money is taken</strong>. Switch to live keys before taking real payments.</div>
          )}
          <dl className="owner-facts">
            <dt>Secret key set</dt><dd className="secret-key-set"><YesNo value={s.secretKeySet} /></dd>
            <dt>Public key set</dt><dd><YesNo value={s.publicKeySet} /></dd>
            <dt>Webhook address</dt>
            <dd className="webhook-url-row">
              <code className="webhook-url">{s.webhookUrl}</code>
              <button type="button" className="btn btn-ghost btn-sm copy-webhook-btn" onClick={() => copy(s.webhookUrl)} aria-label="Copy the webhook address"><Copy size={15} /> Copy</button>
            </dd>
            <dt>Return page after paying</dt><dd><code>{s.callbackUrl}</code></dd>
            <dt>Last webhook received</dt>
            <dd className="last-webhook">{s.lastWebhook ? `${formatDateTime(s.lastWebhookAt)} (${s.lastWebhook.type}, ${s.lastWebhook.status})` : "None yet"}</dd>
            <dt>Daily billing job</dt>
            <dd className="daily-job">{s.dailyJob.inApp ? "Runs inside the web service every day from 06:00" : "Runs from the Render cron service"}{s.dailyJob.lastRun ? `; last run ${formatDateTime(s.dailyJob.lastRun.startedAt)} (${s.dailyJob.lastRun.status})` : "; not run yet"}</dd>
          </dl>
          <div className="owner-card-note switch-live-help">
            <h3 className="owner-card-title">Switching to live payments</h3>
            <ol>
              <li>In Paystack, turn off <em>Test mode</em> and open <em>Settings → API Keys &amp; Webhooks</em>.</li>
              <li>Copy the <strong>live</strong> secret key (starts with <code>sk_live_</code>) and public key (<code>pk_live_</code>).</li>
              <li>In Render, open the backend web service → <em>Environment</em>, replace <code>PAYSTACK_SECRET_KEY</code> and <code>PAYSTACK_PUBLIC_KEY</code> with the live keys and save. Render redeploys by itself.</li>
              <li>Back in Paystack (live), paste the webhook address above into <em>Live Webhook URL</em> and save.</li>
              <li>Refresh this page: the badge should say <strong>Paystack LIVE</strong>. After the first real payment, &ldquo;Last webhook received&rdquo; updates.</li>
            </ol>
            <p>Keys are never stored in EmploCore&apos;s database or shown here. To go back to test mode, put the test keys back in Render.</p>
          </div>
        </>
      )}
    </section>
  );
};

export default PaymentsSettingsCard;
