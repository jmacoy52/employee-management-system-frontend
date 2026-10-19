import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../PageLayout";

const Privacy = () => (
  <PageLayout>
    <article className="content-page">
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: October 2026</p>

      <p>
        EmploCore is an employee management system built and maintained by Joseph Migbodzi.
        This policy explains what information EmploCore stores, why it is stored and how it is protected.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> username, email address, role (employee, HR or admin) and a password, which is stored only as a secure hash.</li>
        <li><strong>Profile details</strong> you or your organisation choose to add, such as first and last name, phone number and address.</li>
        <li><strong>Employee records</strong> entered by HR or administrators, such as name, contact details, position, department and salary.</li>
        <li><strong>Audit logs:</strong> a record of important actions (for example creating, updating or deleting records), the account that performed them and when.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To sign you in and show the dashboard that matches your role.</li>
        <li>To let authorised HR and admin users manage employee and user records.</li>
        <li>To keep an audit trail that helps detect mistakes or misuse.</li>
      </ul>
      <p>EmploCore does not sell personal information and does not use it for advertising.</p>

      <h2>3. Access and security</h2>
      <ul>
        <li>Access is role-based: employees see their own profile, HR users manage employee records and administrators manage user accounts and audit logs.</li>
        <li>Passwords are hashed and requests are authenticated with signed tokens sent over HTTPS.</li>
        <li>Your sign-in token is kept in your browser's local storage and is removed when you log out.</li>
      </ul>

      <h2>4. Where data is hosted</h2>
      <p>
        The web application is hosted on Vercel and the API on Render. Data is stored in the
        database configured for the deployment. These providers process data only to run the service.
      </p>

      <h2>5. Retention</h2>
      <p>
        Records are kept while the related account or employee record is active, or until an
        administrator deletes them. Audit logs may be kept longer for security purposes.
      </p>

      <h2>6. Your choices</h2>
      <p>
        You can view and update your own profile from your dashboard. To correct or delete other
        information, contact your organisation's EmploCore administrator.
      </p>

      <h2>7. Changes and contact</h2>
      <p>
        This policy may be updated as EmploCore evolves; the date above shows the latest version.
        Questions about this policy can be raised through the <Link to="/contact">Contact</Link> page.
      </p>
    </article>
  </PageLayout>
);

export default Privacy;
