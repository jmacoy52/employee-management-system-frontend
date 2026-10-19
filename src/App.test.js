import { render, screen, within } from "@testing-library/react";
import App from "./App";

test("renders the EmploCore landing page", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: /employee records, roles and access/i })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /privacy policy/i })[0]).toHaveAttribute("href", "/privacy");
  expect(screen.getAllByRole("link", { name: /sign in/i }).some((a) => a.getAttribute("href") === "/login")).toBe(true);
});

test("landing page lists the public demo logins with one-click sign-in links", () => {
  render(<App />);
  const demo = document.getElementById("demo");
  expect(within(demo).getByText("admin@emplocore.demo")).toBeInTheDocument();
  expect(within(demo).getByText("Hr@EmploCore2026")).toBeInTheDocument();
  expect(within(demo).getByText("kwame.mensah@emplocore.demo")).toBeInTheDocument();
  expect(within(demo).getByRole("link", { name: /sign in as admin/i })).toHaveAttribute("href", "/login?demo=admin");
  expect(within(demo).getByText(/30–60 seconds/)).toBeInTheDocument();
});

test("footer credits Joseph Migbodzi with portfolio and GitHub links", () => {
  render(<App />);
  const footer = screen.getByRole("contentinfo");
  expect(within(footer).getAllByRole("link", { name: /joseph migbodzi/i })[0]).toHaveAttribute("href", "https://mjay-portfolio.vercel.app");
  expect(within(footer).getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/jmacoy52");
});
