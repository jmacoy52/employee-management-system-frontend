import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../PageLayout";

const Terms = () => (
  <PageLayout>
    <article className="content-page">
      <h1>Terms of Service</h1>
      <p className="muted">Last updated: October 2026</p>

      <p>
        These terms apply to your use of EmploCore, an employee management system built and
        maintained by Joseph Migbodzi. By creating an account or using EmploCore you agree to them.
      </p>

      <h2>1. The service</h2>
      <p>
        EmploCore helps organisations manage employee records, user accounts and roles, and keeps
        an audit log of key actions. Features may change, be improved or be removed over time.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>Provide accurate information and keep your password confidential.</li>
        <li>You are responsible for activity carried out with your account.</li>
        <li>Administrators may change roles, suspend or delete accounts in their organisation.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>access data or features your role does not allow, or try to bypass security;</li>
        <li>enter information you have no right to store, or that is unlawful or misleading;</li>
        <li>disrupt the service, for example by automated abuse or attempts to overload it.</li>
      </ul>

      <h2>4. Your data</h2>
      <p>
        Organisations remain responsible for the employee information they enter and for having a
        lawful basis to process it. How data is handled is described in the <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>5. Availability</h2>
      <p>
        EmploCore is provided "as is". It runs on hosted infrastructure and may occasionally be slow
        to respond (for example while the server starts up) or unavailable for maintenance.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the extent permitted by law, EmploCore and its maintainer are not liable for indirect or
        consequential losses arising from use of the service. Keep your own copies of important records.
      </p>

      <h2>7. Changes and contact</h2>
      <p>
        These terms may be updated; continued use after an update means you accept the new version.
        Questions can be raised through the <Link to="/contact">Contact</Link> page.
      </p>
    </article>
  </PageLayout>
);

export default Terms;
