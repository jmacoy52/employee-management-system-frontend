import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  UserCog,
  KeyRound,
  ScrollText,
  Link2,
  LogIn,
  ArrowRight,
  Server,
  Copy,
  Check,
} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import api from "../../api/client";
import { DEMO_ACCOUNTS, GITHUB_URL } from "../../config/demo";
import "./Home.css";

// Only features that exist in the app and API today.
const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Admin, HR and employee accounts each get their own dashboard. The API checks the role on every request, not just the menu.",
  },
  {
    icon: Users,
    title: "Employee records",
    text: "HR adds, edits and deletes employee records with position, department and salary, and filters the list by department.",
  },
  {
    icon: UserCog,
    title: "Account control",
    text: "Admins create accounts, change roles, and deactivate or reactivate users. A deactivated user is signed out straight away.",
  },
  {
    icon: KeyRound,
    title: "Password management",
    text: "Users change their own password. Admins can issue a temporary password (changed at next sign-in) or a one-time reset link.",
  },
  {
    icon: Link2,
    title: "Linked accounts",
    text: "HR links a user account to its employee record, so each employee sees their own position, department and salary.",
  },
  {
    icon: ScrollText,
    title: "Audit log",
    text: "Sign-ins, sign-outs and changes to users, roles, passwords and employee records are written to an audit log for admins.",
  },
];

const STEPS = [
  {
    role: "Admin",
    badge: "badge-admin",
    steps: [
      "Sign in with your admin account.",
      "Create HR and admin accounts with the + button on the dashboard.",
      "Change roles, deactivate users or reset passwords in User Management.",
      "Check the Audit Log to see who changed what, and when.",
    ],
  },
  {
    role: "HR",
    badge: "badge-hr",
    steps: [
      "Sign in with the HR account your admin created.",
      "Add employees with their position, department and salary.",
      "In the Employee List, link each record to the employee's user account.",
      "Keep records up to date, and filter by department.",
    ],
  },
  {
    role: "Employee",
    badge: "badge-employee",
    steps: [
      "Register for an employee account, or use one your admin created.",
      "Sign in and add your name, phone number and address to your profile.",
      "Once HR links your account, your employment record appears on your dashboard.",
      "Change your password at any time from the menu.",
    ],
  },
];

const STACK = [
  { name: "React 19", detail: "React Router, Axios, plain CSS" },
  { name: "Node.js + Express", detail: "REST API with validation and rate limiting" },
  { name: "MySQL 8", detail: "Raw SQL through mysql2, versioned migrations" },
  { name: "JWT + bcrypt", detail: "Signed tokens, hashed passwords, server-side logout" },
  { name: "Hosting", detail: "Vercel (web), Render (API), Aiven (MySQL)" },
];

// Small illustration of the HR screen, built from HTML so it stays sharp and on-brand.
const ProductPreview = () => (
  <div className="preview" aria-hidden="true">
    <div className="preview-bar">
      <span /><span /><span />
      <p>emplocore.vercel.app/hr</p>
    </div>
    <div className="preview-body">
      <div className="preview-stats">
        <div><small>Employees</small><strong>8</strong></div>
        <div><small>Departments</small><strong>6</strong></div>
        <div><small>Avg. salary</small><strong>₵7,000</strong></div>
      </div>
      <div className="preview-table">
        <div className="preview-row head"><span>Name</span><span>Position</span><span>Department</span></div>
        <div className="preview-row"><span>Kwame Mensah</span><span>Software Engineer</span><span><i className="dot dot-blue" />Engineering</span></div>
        <div className="preview-row"><span>Kofi Asante</span><span>Accountant</span><span><i className="dot dot-teal" />Finance</span></div>
        <div className="preview-row"><span>Akosua Darko</span><span>Marketing Coordinator</span><span><i className="dot dot-amber" />Marketing</span></div>
        <div className="preview-row"><span>Esi Quaye</span><span>HR Assistant</span><span><i className="dot dot-slate" />Human Resources</span></div>
      </div>
    </div>
  </div>
);

// Wakes the free API server in the background so the first sign-in is quicker.
function useServerStatus() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    if (process.env.NODE_ENV === "test") return undefined;
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
  }, []);
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
  const serverStatus = useServerStatus();

  return (
    <div className="home">
      <Header />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Employee management system</p>
            <h1 className="hero-title">
              Employee records, roles and access in <span className="highlight">one place</span>
            </h1>
            <p className="hero-subtitle">
              EmploCore gives admins, HR and employees their own dashboard. HR keeps staff
              records up to date, admins decide who can sign in, and important changes are
              written to an audit log.
            </p>
            <div className="cta">
              <a href="#demo" className="btn btn-primary btn-lg">
                Try the demo <ArrowRight size={18} />
              </a>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <LogIn size={18} /> Sign in
              </Link>
            </div>
            <p className="hero-note">Public demo logins below. No sign-up needed.</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* WHAT IT IS */}
      <section className="section-block" id="about">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">What EmploCore is</p>
            <h2>Three roles, one system</h2>
            <p>
              EmploCore is a web app for keeping employee information and user accounts in
              one place. What you can see and do depends on your role.
            </p>
          </div>
          <div className="role-grid">
            <article className="role-card">
              <span className="badge badge-admin">Admin</span>
              <p>Manages user accounts: creates them, sets roles, deactivates or reactivates them, resets passwords and reads the audit log. Admins can also use the HR area.</p>
            </article>
            <article className="role-card">
              <span className="badge badge-hr">HR</span>
              <p>Manages employee records: adds, edits and deletes them, sees headcount and salary figures, and links records to user accounts.</p>
            </article>
            <article className="role-card">
              <span className="badge badge-employee">Employee</span>
              <p>Sees and updates their own profile, sees the employment record HR linked to them, and changes their own password.</p>
            </article>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-block alt" id="features">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">Features</p>
            <h2>What it does today</h2>
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

      {/* GET STARTED */}
      <section className="section-block" id="get-started">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">How to get started</p>
            <h2>First steps for each role</h2>
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

      {/* DEMO */}
      <section className="section-block alt" id="demo">
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
                  <span className="demo-name">{a.name}</span>
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
            The API runs on a free server that sleeps when nobody is using it, so the first
            sign-in can take 30–60 seconds while it wakes up. After that it is quick.
          </p>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="section-block" id="stack">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">Tech stack</p>
            <h2>How it is built</h2>
          </div>
          <ul className="stack-list">
            {STACK.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <span>{s.detail}</span>
              </li>
            ))}
          </ul>
          <p className="stack-links">
            Source code on <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="cta-band">
        <div className="section-inner cta-band-inner">
          <div>
            <h2>Ready to look around?</h2>
            <p>Pick a demo account, or sign in with your own.</p>
          </div>
          <div className="cta">
            <a href="#demo" className="btn btn-lg btn-light">Demo logins</a>
            <Link to="/login" className="btn btn-lg btn-on-dark">Sign in</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
