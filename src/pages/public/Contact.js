import React from "react";
import { Mail, Globe } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { PORTFOLIO_URL } from "../../config/demo";

const CONTACT_EMAIL = "josephmacoy52@gmail.com";
const DEMO_REQUEST_SUBJECT = "EmploCore demo request";
const DEMO_REQUEST_BODY = [
  "Organisation name:",
  "Type of organisation (business, school, NGO, other):",
  "Number of staff:",
  "Number of departments:",
  "How you manage staff records now:",
  "When you would like to start:",
].join("\n");
const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DEMO_REQUEST_SUBJECT)}&body=${encodeURIComponent(DEMO_REQUEST_BODY)}`;

const Contact = () => (
  <PageLayout>
    <article className="content-page">
      <h1>Contact us</h1>
      <p>
        Interested in EmploCore for your organisation? Request a demo and we will walk you
        through the system and talk about setting it up for your team, with your own private
        database, your departments and your administrator accounts.
      </p>

      <div className="contact-cards">
        <div className="contact-card">
          <h3><Mail size={18} aria-hidden="true" /> Request a demo</h3>
          <p>Email us with a little about your organisation: its size, its departments and how you keep staff records now.</p>
          <a href={mailto} className="btn btn-primary request-demo">Email a demo request</a>
          <p className="contact-small">Or write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        </div>
        <div className="contact-card">
          <h3><Globe size={18} aria-hidden="true" /> Questions and feedback</h3>
          <p>For general questions, feedback or partnership enquiries, email us or get in touch through the developer&apos;s website.</p>
          <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
            mjay-portfolio.vercel.app
          </a>
        </div>
      </div>

      <h2>Need help with your account?</h2>
      <p>
        If you can't sign in, need a password reset or need a different role, please contact your
        organisation's EmploCore administrator or HR team. They manage accounts for your organisation.
      </p>
    </article>
  </PageLayout>
);

export default Contact;
