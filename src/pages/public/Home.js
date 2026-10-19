import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ScrollText,
  Building2,
  UserPlus,
  UserX,
  UserCircle,
  Smartphone,
  Zap,
  LogIn,
  ArrowRight,
  Server,
  Copy,
  Check,
  Mail,
  CheckCircle2,
} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import api from "../../api/client";
import { DEMO_ACCOUNTS, isDemoMode } from "../../config/demo";
import "./Home.css";

// Only capabilities that exist in the app and API. No invented figures, customers or prices.
const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Controlled access",
    text: "Administrators, HR and employees each see only what their role needs. Permissions are checked on every request, not just hidden in the menu.",
  },
  {
    icon: ScrollText,
    title: "A clear audit trail",
    text: "Sign-ins, account changes and edits to staff records are logged with who did it and when, so questions about a change can be answered quickly.",
  },
  {
    icon: Building2,
    title: "Departmental structure",
    text: "Organise staff into departments, appoint a head for each and see headcount by department at a glance.",
  },
  {
    icon: UserPlus,
    title: "Straightforward onboarding",
    text: "Create staff accounts and link each one to its employee record, so new starters see their own position and department from their first sign-in.",
  },
  {
    icon: UserX,
    title: "Leavers locked out at once",
    text: "Deactivating an account ends that person's sessions immediately. When someone is locked out, issue a temporary password or a one-time reset link.",
  },
  {
    icon: UserCircle,
    title: "Self-service for staff",
    text: "Employees keep their own contact details up to date and view their employment record, without having to ask HR.",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Secure by default",
    text: "Passwords are never stored in readable form, sign-in attempts are rate limited, and removing someone's access takes effect straight away.",
  },
  {
    icon: ScrollText,
    title: "Accountability built in",
    text: "Every important change leaves a record, which supports internal reviews, audits and handovers between HR staff.",
  },
  {
    icon: Smartphone,
    title: "Works on phone and desktop",
    text: "Every screen adapts to phones, tablets and computers, so HR and staff can use it from the office or on the move.",
  },
  {
    icon: Zap,
    title: "Quick to get going",
    text: "It runs in the browser, so there is nothing to install. Set up your departments, add your HR team and start adding staff records.",
  },
];

const STEPS = [
  {
    role: "Administrator",
    badge: "badge-admin",
    steps: [
      "Register your organisation, or sign in once EmploCore has approved it.",
      "Create accounts for your HR team and other administrators.",
      "Manage roles, deactivate leavers and help people who are locked out.",
      "Review the audit log to see who changed what, and when.",
    ],
  },
  {
    role: "HR",
    badge: "badge-hr",
    steps: [
      "Set up your departments and appoint a head for each.",
      "Add staff records with their position, department and salary.",
      "Link each record to the employee's user account.",
      "Keep records current and track headcount by department.",
    ],
  },
  {
    role: "Employee",
    badge: "badge-employee",
    steps: [
      "Sign in with the account your organisation's admin or HR team created for you.",
      "Add your name, phone number and address to your profile.",
      "See your position and department once HR links your record.",
      "Change your password at any time from the menu.",
    ],
  },
];

const ORGANISATION_POINTS = [
  "Your own private organisation space: your staff records are never visible to other organisations",
  "Register online with your first administrator account; we approve new organisations before they go live",
  "Suitable for SMEs, schools, NGOs and other organisations with staff to manage",
];

// Decorative brand shape: the logo's "E" blocks, enlarged and faded. No data, purely visual.
const HeroShape = () => (
  <div className="hero-shape" aria-hidden="true">
    <span className="hs-bar hs-top" />
    <span className="hs-bar hs-spine" />
    <span className="hs-bar hs-core" />
    <span className="hs-bar hs-bottom" />
  </div>
);

const HERO_POINTS = [
  { icon: ShieldCheck, label: "Role-based access" },
  { icon: ScrollText, label: "Full audit trail" },
  { icon: Building2, label: "Departments and heads" },
  { icon: Smartphone, label: "Phone and desktop" },
];

// Wakes the free API server in the background so the first sign-in is quicker.
// Only used on the demo deployment (it backs the "Waking the server" notice).
function useServerStatus(enabled = true) {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV === "test") return undefined;
    let cancelled = false;
    const started = Date.now();
    const slow = setTimeout(() => !cancelled && setStatus("waking"), 2500);
    api
      .get("/api/live")
      .then(() => !cancelled && setStatus("ready"))
      .catch(() => !cancelled && setStatus(Date.now() - started > 50000 ? "waking" : "offline"))
      .finally(() => clearTimeout(slow));
    return () => {
      cancelled = true;
      clearTimeout(slow);
    };
  }, [enabled]);
  return status;
}

const STATUS_TEXT = {
  checking: "Checking the server…",
  waking: "Waking the server up (about 30–60 seconds)…",
  ready: "Server is awake. Sign-in should be quick.",
  offline: "Server did not answer. It may still be starting; try signing in shortly.",
};

const CopyButton = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available: the value is visible to copy by hand */
    }
  };
  return (
    <button type="button" className="icon-btn copy-btn" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );
};

const Home = () => {
  const demo = isDemoMode();
  const serverStatus = useServerStatus(demo);

  return (
    <div className="home">
      <Header />

      {/* HERO SECTION */}
      <section className="hero">
        <HeroShape />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Staff records and access control</p>
            <h1 className="hero-title">
              Run your staff records with <span className="highlight">clarity and control</span>
            </h1>
            <p className="hero-subtitle">
              EmploCore gives HR one place for staff records and departments, gives
              administrators control over who can sign in, and keeps an audit trail of
              every important change. Built for growing organisations across Ghana and Africa.
            </p>
            <div className="cta">
              {demo ? (
                <a href="#demo" className="btn btn-primary btn-lg">
                  Try the demo <ArrowRight size={18} />
                </a>
              ) : (
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Request a demo <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/login" className="btn btn-secondary btn-lg">
                <LogIn size={18} /> Sign in
              </Link>
            </div>
            {demo && <p className="hero-note">Public demo logins below. No sign-up needed.</p>}
            <ul className="hero-points">
              {HERO_POINTS.map(({ icon: Icon, label }) => (
                <li key={label}><Icon size={16} aria-hidden="true" /> {label}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-block" id="features">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">Features</p>
            <h2>Everything HR needs to keep staff records in order</h2>
            <p>
              From the first account to the last record change, EmploCore keeps people,
              departments and access in step.
            </p>
          </div>
          <div className="features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article className="feature-card" key={title}>
                <span className="feature-icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="section-block alt" id="about">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">One system, three roles</p>
            <h2>The right access for every person</h2>
            <p>
              Each person signs in to a dashboard designed for their role, so nobody sees
              more than they should.
            </p>
          </div>
          <div className="role-grid">
            <article className="role-card">
              <span className="badge badge-admin">Administrator</span>
              <p>Decides who can sign in: creates accounts, assigns roles, deactivates leavers, resets passwords and reviews the audit log. Administrators can also work in the HR area.</p>
            </article>
            <article className="role-card">
              <span className="badge badge-hr">HR</span>
              <p>Looks after the organisation&apos;s structure and staff: departments and their heads, employee records, salaries and headcount, and the link between each record and its account.</p>
            </article>
            <article className="role-card">
              <span className="badge badge-employee">Employee</span>
              <p>Keeps their own profile up to date, sees the employment record HR holds for them and manages their own password.</p>
            </article>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section-block" id="why">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">Why EmploCore</p>
            <h2>Why organisations choose EmploCore</h2>
          </div>
          <div className="benefit-grid">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <article className="benefit" key={title}>
                <span className="benefit-icon"><Icon size={20} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* GET STARTED */}
      <section className="section-block alt" id="get-started">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">Getting started</p>
            <h2>Up and running in a few steps</h2>
          </div>
          <div className="steps-grid">
            {STEPS.map(({ role, badge, steps }) => (
              <article className="steps-card" key={role}>
                <span className={`badge ${badge}`}>{role}</span>
                <ol>
                  {steps.map((s) => <li key={s}>{s}</li>)}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO (public demo deployment only) */}
      {demo && (
      <section className="section-block" id="demo">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">Try the demo</p>
            <h2>Sign in as any role</h2>
            <p>
              These accounts are public so you can look around. The demo is shared, so please
              don't enter real personal information.
            </p>
          </div>
          <div className={`server-status status-${serverStatus}`} role="status">
            <Server size={16} aria-hidden="true" />
            <span>{STATUS_TEXT[serverStatus]}</span>
          </div>
          <div className="demo-grid">
            {DEMO_ACCOUNTS.map((a) => (
              <article className="demo-card" key={a.key}>
                <div className="demo-card-head">
                  <span className={`badge badge-${a.key}`}>{a.role}</span>
                </div>
                <p className="demo-summary">{a.summary}</p>
                <dl className="demo-creds">
                  <div>
                    <dt>Email</dt>
                    <dd><code>{a.email}</code><CopyButton value={a.email} label={`${a.role} email`} /></dd>
                  </div>
                  <div>
                    <dt>Password</dt>
                    <dd><code>{a.password}</code><CopyButton value={a.password} label={`${a.role} password`} /></dd>
                  </div>
                </dl>
                <Link to={`/login?demo=${a.key}`} className="btn btn-primary btn-block">
                  Sign in as {a.role} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
          <p className="demo-note">
            The demo runs on a free server that sleeps when nobody is using it, so the first
            sign-in can take 30–60 seconds while it wakes up. After that it is quick.
          </p>
        </div>
      </section>
      )}

      {/* FOR ORGANISATIONS */}
      <section className={`section-block ${demo ? "alt" : ""}`} id="organisations">
        <div className="section-inner org-inner">
          <div className="org-copy">
            <p className="eyebrow">For organisations</p>
            <h2>Bring EmploCore to your organisation</h2>
            <p>
              Whether you run a growing business, a school or an NGO, register your organisation
              and set up your departments, HR team and staff accounts yourself. Prefer a
              walkthrough first? Request a demo and we will arrange a time.
            </p>
            <ul className="org-points">
              {ORGANISATION_POINTS.map((p) => (
                <li key={p}><CheckCircle2 size={18} aria-hidden="true" /> {p}</li>
              ))}
            </ul>
          </div>
          <div className="org-card">
            <Building2 size={28} aria-hidden="true" />
            <h3>Get started</h3>
            <p>Register your organisation with your first administrator account. Once we have approved it, you can sign in and add your team.</p>
            <Link to="/register-organisation" className="btn btn-primary btn-block register-org-cta">
              Register your organisation <ArrowRight size={16} />
            </Link>
            <p className="org-card-or">or</p>
            <Link to="/contact" className="btn btn-secondary btn-block">
              <Mail size={16} aria-hidden="true" /> Request a demo
            </Link>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="cta-band">
        <div className="section-inner cta-band-inner">
          <div>
            <h2>Ready to bring order to your staff records?</h2>
            <p>{demo ? "Explore the demo, register your organisation, or talk to us first." : "Register your organisation, talk to us first, or sign in to your account."}</p>
          </div>
          <div className="cta">
            {demo && <a href="#demo" className="btn btn-lg btn-light">Try the demo</a>}
            <Link to="/register-organisation" className={`btn btn-lg ${demo ? "btn-on-dark" : "btn-light"}`}>Register your organisation</Link>
            <Link to="/contact" className="btn btn-lg btn-on-dark">Request a demo</Link>
            {!demo && <Link to="/login" className="btn btn-lg btn-on-dark">Sign in</Link>}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
