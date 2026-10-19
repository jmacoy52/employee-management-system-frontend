# EmploCore — Frontend

EmploCore is an employee management system with role-based dashboards for **admins**, **HR** and **employees**. This repository is the React single-page app. It is live at **https://emplocore.vercel.app**.

Built and maintained by [Joseph Migbodzi](https://mjay-portfolio.vercel.app) ([GitHub](https://github.com/jmacoy52)).

## Features

- Sign in with JWT authentication. Each role lands on its own dashboard (`/admin`, `/hr`, `/employee`).
- **Admin:** overview (user counts, recent activity), create users, change roles, activate/deactivate users, reset passwords (temporary password or one-time link), delete users, read and filter the audit log, and open the HR dashboard.
- **HR:** dashboard (headcount, departments, average salary, recent activity), search/filter, add, edit and delete employees, link employee records to user accounts, and manage their own profile.
- **Employee:** view and update their own profile, see the employment record HR linked to them, change their password.
- Public pages: landing page (features, getting started, public demo logins, tech stack), privacy policy, terms, contact, forgot password (handled by an administrator) and a 404 page.
- Responsive from 360px phones up: menus collapse, tables turn into cards on small screens.

## Demo logins

| Role | Email | Password |
|---|---|---|
| Admin | `admin@emplocore.demo` | `Admin@EmploCore2026` |
| HR | `hr@emplocore.demo` | `Hr@EmploCore2026` |
| Employee | `kwame.mensah@emplocore.demo` | `Staff@EmploCore2026` |

`/login?demo=admin` (or `hr`, `employee`) opens the sign-in page with that account filled in.

## Design system

All colours, type, spacing, radius and shadows are CSS custom properties in `src/styles/tokens.css`;
shared buttons, cards, form fields, tables, badges and alerts are in `src/styles/ui.css`. Page and
component stylesheets only use these variables. Main colours: primary `#2453d6`, accent `#14b8a6`,
ink `#0f1e3d`. The logo is an SVG (`src/components/brand/Logo.js`, `public/favicon.svg`).

## Tech stack

- React 19, Create React App 5 (`react-scripts`)
- React Router 7
- Axios, through a single shared client (`src/api/client.js`)
- react-hot-toast, lucide-react, jwt-decode
- Backend: Node.js / Express / MySQL REST API, hosted on Render (separate repository)

## Project structure

```
src/
├── api/client.js        # axios instance: base URL, 60s timeout, auth header, error messages
├── config/env.js        # reads REACT_APP_* environment variables
├── routes/
│   ├── AppRoutes.js     # route table, legacy redirects, 404
│   ├── PrivateRoute.js  # role-based guard
│   └── paths.js         # all route paths + role home pages
├── pages/
│   ├── public/          # Home, Privacy, Terms, Contact, NotFound
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── employee/        # EmployeeDashboard
│   ├── hr/              # HRDashboard, EmployeeListPage, AddEmployeePage, MyProfilePage
│   └── admin/           # AdminDashboard, UserList, UserManagement, AuditLog
├── components/
│   ├── brand/           # Logo (SVG mark + wordmark)
│   ├── auth/            # AuthLayout, PasswordInput (show/hide), SubmitButton
│   ├── layout/          # Header, Footer, PageLayout, AppLayout, AppNav (+ AdminNav, HRNav, EmployeeNav)
│   └── common/          # Modal, ProfilePanel, EmployeeForm, EmployeeList, EmployeeStats, badges
├── config/demo.js       # public demo accounts and author links
├── styles/
│   ├── tokens.css       # design tokens (colours, type, spacing, radius, shadows)
│   ├── ui.css           # shared buttons, cards, fields, tables, badges, alerts
│   └── pages.css        # public page and signed-in page frames
├── App.js               # router + toaster
└── index.js
```

## Getting started

Requirements: Node.js 18+ and npm.

```bash
git clone https://github.com/jmacoy52/employee-management-system-frontend.git
cd employee-management-system-frontend
npm install
cp .env.example .env      # then edit if you use a different API
npm start                 # http://localhost:3000
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_API_URL` | `https://employee-management-system-backend-vxar.onrender.com` | Backend base URL. No trailing slash and no `/api` |
| `REACT_APP_API_TIMEOUT_MS` | `60000` | Request timeout, in milliseconds |

CRA reads these at **build time**, so you must rebuild or redeploy after changing them.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Runs the dev server on port 3000 |
| `npm test` | Runs the Jest tests (`src/App.test.js`, `src/__tests__/`) |
| `npm run build` | Builds for production into `build/` |

## Deployment (Vercel)

- **Framework preset:** Create React App. **Build command:** `npm run build`. **Output directory:** `build` (see `vercel.json`).
- Set `REACT_APP_API_URL` in Vercel → Project → Settings → Environment Variables.
- Deploy from the GitHub `main` branch through Vercel's Git integration, so production always matches the repository.
- The backend's CORS settings must allow the frontend origin (`https://emplocore.vercel.app`).
- The backend runs on Render's free tier, which sleeps when idle. The first request can take up to a minute. The UI shows a "server is waking up" message if a request times out.

## Routes

| Path | Access |
|---|---|
| `/`, `/login`, `/register`, `/forgot-password`, `/privacy`, `/terms`, `/contact` | Public |
| `/employee` | Any signed-in user |
| `/hr`, `/hr/employees`, `/hr/create-employee`, `/hr/profile` | HR and admin |
| `/admin`, `/admin/users`, `/admin/user-management`, `/admin/audit-log`, `/admin/hr` | Admin |

The old URLs `/AdminDashboard`, `/HRDashboard`, `/EmployeeDashboard`, `/admin/usermanagement` and `/admin/auditlog` redirect to their new paths.

## Security notes

- Public registration creates **employee** accounts only, with a minimum password length of 8 characters (letters and numbers). The **backend must enforce the same rules**, because a client-side check can be bypassed.
- Tokens are kept in `localStorage` and removed on logout.

## Tests

- Unit/component tests: `npm test` (Jest + Testing Library).
- End-to-end: `e2e/e2e.py` (Playwright for Python). Start the backend locally with demo data
  (`SEED_DEMO=true npm run db:init`, then `PORT=5055 ALLOWED_ORIGINS=http://127.0.0.1:5056 npm start`),
  build and serve this app (`REACT_APP_API_URL=http://127.0.0.1:5055 npm run build && npx serve -s build -l 5056`),
  then run `python3 e2e/e2e.py`. It creates and changes users, so only point it at a local database.
