import { render, screen, within } from "@testing-library/react";
import App from "./App";

// Production builds read REACT_APP_DEMO_MODE from .env.production; tests set it explicitly.
const withDemo = (on) => {
  process.env.REACT_APP_DEMO_MODE = on ? "true" : "false";
};
afterEach(() => {
  delete process.env.REACT_APP_DEMO_MODE;
  window.history.pushState({}, "", "/");
});

test("renders the EmploCore landing page", () => {
  withDemo(true);
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: /run your staff records with clarity and control/i })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /privacy policy/i })[0]).toHaveAttribute("href", "/privacy");
  expect(screen.getAllByRole("link", { name: /sign in/i }).some((a) => a.getAttribute("href") === "/login")).toBe(true);
});

test("demo mode: landing page lists the public demo logins with one-click sign-in links", () => {
  withDemo(true);
  render(<App />);
  const demo = document.getElementById("demo");
  expect(within(demo).getByText("admin@emplocore.demo")).toBeInTheDocument();
  expect(within(demo).getByText("Hr@EmploCore2026")).toBeInTheDocument();
  expect(within(demo).getByText("kwame.mensah@emplocore.demo")).toBeInTheDocument();
  expect(within(demo).getByRole("link", { name: /sign in as admin/i })).toHaveAttribute("href", "/login?demo=admin");
  expect(within(demo).getByText(/30–60 seconds/)).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /try the demo/i }).length).toBeGreaterThan(0);
});

test("real deployment: no demo logins or 'Try the demo' anywhere, Request a demo instead", () => {
  withDemo(false);
  render(<App />);
  expect(document.getElementById("demo")).toBeNull();
  expect(screen.queryByText(/emplocore\.demo/)).toBeNull();
  expect(screen.queryByRole("link", { name: /try the demo/i })).toBeNull();
  expect(screen.queryByRole("link", { name: /^demo$/i })).toBeNull();
  expect(screen.getAllByRole("link", { name: /request a demo/i })[0]).toHaveAttribute("href", "/contact");
});

test("landing page is product-focused: no sample figures, tech stack or placeholder wording", () => {
  withDemo(true);
  render(<App />);
  const text = document.body.textContent;
  expect(text).not.toMatch(/Kofi Asante|Akosua Darko|₵/);
  expect(text).not.toMatch(/today/i);
  expect(text).not.toMatch(/tech stack|how it is built|React 19|Express|MySQL|source code/i);
  expect(screen.queryByRole("link", { name: /github/i })).toBeNull();
  expect(screen.getByRole("heading", { name: /why organisations choose emplocore/i })).toBeInTheDocument();
  const org = document.getElementById("organisations");
  expect(within(org).getByRole("heading", { name: /bring emplocore to your organisation/i })).toBeInTheDocument();
  expect(within(org).getByRole("link", { name: /contact us/i })).toHaveAttribute("href", "/contact");
  expect(screen.queryByRole("img")).toBeNull(); // no product screenshots or mockups
  expect(text).not.toMatch(/Kwame Mensah|Nana Agyeman|Adwoa Boateng|Departments ·/);
});

test("footer has a subtle credit to Joseph Migbodzi and no source-code links", () => {
  withDemo(true);
  render(<App />);
  const footer = screen.getByRole("contentinfo");
  expect(within(footer).getAllByRole("link", { name: /joseph migbodzi/i })[0]).toHaveAttribute("href", "https://mjay-portfolio.vercel.app");
  expect(within(footer).queryByRole("link", { name: /github/i })).toBeNull();
  expect(within(footer).getByText(/built by/i)).toBeInTheDocument();
});
