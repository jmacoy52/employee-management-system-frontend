import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/auth/Login";
import { passwordProblem } from "../pages/auth/Register";
import RegisterOrganisation from "../pages/auth/RegisterOrganisation";

const renderAt = (ui, path = "/") => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

beforeEach(() => {
  process.env.REACT_APP_DEMO_MODE = "true";
});
afterEach(() => {
  delete process.env.REACT_APP_DEMO_MODE;
});

test("login has labelled fields and the password can be shown and hidden", () => {
  renderAt(<Login />, "/login");
  const password = screen.getByLabelText("Password");
  expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  expect(password).toHaveAttribute("type", "password");
  fireEvent.click(screen.getByRole("button", { name: /show password/i }));
  expect(password).toHaveAttribute("type", "text");
  fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
  expect(password).toHaveAttribute("type", "password");
});

test("?demo=hr pre-fills the HR demo account, and the demo buttons fill others", () => {
  renderAt(<Login />, "/login?demo=hr");
  expect(screen.getByLabelText("Email")).toHaveValue("hr@emplocore.demo");
  expect(screen.getByLabelText("Password")).toHaveValue("Hr@EmploCore2026");
  fireEvent.click(screen.getByRole("button", { name: "Employee" }));
  expect(screen.getByLabelText("Email")).toHaveValue("kwame.mensah@emplocore.demo");
});

test("with demo mode off, the sign-in page has no demo picker and ignores ?demo=", () => {
  process.env.REACT_APP_DEMO_MODE = "false";
  renderAt(<Login />, "/login?demo=hr");
  expect(screen.getByLabelText("Email")).toHaveValue("");
  expect(screen.queryByText(/demo account/i)).toBeNull();
  expect(screen.queryByRole("button", { name: "Employee" })).toBeNull();
});

test("unknown demo key leaves the form empty", () => {
  renderAt(<Login />, "/login?demo=root");
  expect(screen.getByLabelText("Email")).toHaveValue("");
});

test("organisation sign-up shows the password rule inline before calling the server", () => {
  renderAt(<RegisterOrganisation />, "/register-organisation");
  fireEvent.change(screen.getByLabelText("Organisation name"), { target: { value: "Accra Logistics" } });
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ama Owusu" } });
  fireEvent.change(screen.getByLabelText("Work e-mail"), { target: { value: "ama@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "abcdefghij" } });
  fireEvent.click(screen.getByRole("button", { name: "Register organisation" }));
  expect(screen.getByRole("alert")).toHaveTextContent(/at least one letter and one number/i);
  expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
});

test("password rule helper", () => {
  expect(passwordProblem("short1")).toMatch(/at least 8/);
  expect(passwordProblem("abcdefgh")).toMatch(/letter and one number/);
  expect(passwordProblem("abcdefg1")).toBe("");
});

test("sign-in page explains a suspended or pending organisation", () => {
  renderAt(<Login />, "/login?notice=suspended");
  expect(screen.getByRole("alert")).toHaveTextContent(/organisation's EmploCore account is suspended/i);
});

test("sign-in page links to organisation sign-up, not employee self-sign-up", () => {
  renderAt(<Login />, "/login");
  expect(screen.getByRole("link", { name: /register your organisation/i })).toHaveAttribute("href", "/register-organisation");
});
