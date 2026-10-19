import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register, { passwordProblem } from "../pages/auth/Register";

const renderAt = (ui, path = "/") => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

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

test("unknown demo key leaves the form empty", () => {
  renderAt(<Login />, "/login?demo=root");
  expect(screen.getByLabelText("Email")).toHaveValue("");
});

test("register shows the password rule inline before calling the server", () => {
  renderAt(<Register />, "/register");
  fireEvent.change(screen.getByLabelText("Username"), { target: { value: "Ama" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ama@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "abcdefghij" } });
  fireEvent.click(screen.getByRole("button", { name: "Register" }));
  expect(screen.getByRole("alert")).toHaveTextContent(/at least one letter and one number/i);
  expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
});

test("password rule helper", () => {
  expect(passwordProblem("short1")).toMatch(/at least 8/);
  expect(passwordProblem("abcdefgh")).toMatch(/letter and one number/);
  expect(passwordProblem("abcdefg1")).toBe("");
});
