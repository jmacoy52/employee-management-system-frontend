import React from "react";
import PageLayout from "../../components/layout/PageLayout";

const Contact = () => (
  <PageLayout>
    <article className="content-page">
      <h1>Contact</h1>
      <p>
        EmploCore is built and maintained by <strong>Joseph Migbodzi</strong>, a full-stack developer.
        For questions about the system, feedback, bug reports or collaboration, use one of the options below.
      </p>

      <div className="contact-cards">
        <div className="contact-card">
          <h3>Portfolio</h3>
          <p>About Joseph, his projects and how to get in touch.</p>
          <a href="https://mjay-portfolio.vercel.app" target="_blank" rel="noopener noreferrer">
            mjay-portfolio.vercel.app
          </a>
        </div>
        <div className="contact-card">
          <h3>GitHub</h3>
          <p>Source code, issues and other projects.</p>
          <a href="https://github.com/jmacoy52" target="_blank" rel="noopener noreferrer">
            github.com/jmacoy52
          </a>
        </div>
      </div>

      <h2>Need help with your account?</h2>
      <p>
        If you can't sign in, need a password reset or need a different role, please contact your
        organisation's EmploCore administrator or HR team; they manage accounts for your organisation.
      </p>
    </article>
  </PageLayout>
);

export default Contact;
