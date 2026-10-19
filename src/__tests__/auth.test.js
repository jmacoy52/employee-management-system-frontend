import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Register from "../pages/auth/Register";
import PrivateRoute from "../routes/PrivateRoute";
import { getErrorMessage, SERVER_UNAVAILABLE_MESSAGE } from "../api/client";
import { API_TIMEOUT_MS } from "../config/env";

// A token that expires far in the future (signature is not checked client-side).
const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, "");
const fakeToken = (claims) => `${b64({ alg: "HS256" })}.${b64({ exp: 4102444800, ...claims })}.sig`;

function renderGuarded(path, user) {
  localStorage.setItem("token", fakeToken({ id: user.id, role: user.role }));
  localStorage.setItem("user", JSON.stringify(user));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PrivateRoute allowedRoles={["hr", "admin"]} />}>
          <Route path="/hr" element={<p>HR page</p>} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["employee", "hr", "admin"]} />}>
          <Route path="/account/password" element={<p>Change password page</p>} />
          <Route path="/employee" element={<p>Employee page</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => localStorage.clear());

test("public register has no role choice (employee-only sign-up)", () => {
  render(<MemoryRouter><Register /></MemoryRouter>);
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByText(/HR and admin accounts are created/i)).toBeInTheDocument();
});

test("user with a temporary password is sent to change password", () => {
  renderGuarded("/hr", { id: 1, role: "hr", mustChangePassword: true });
  expect(screen.getByText("Change password page")).toBeInTheDocument();
});

test("employee is redirected away from HR pages", () => {
  renderGuarded("/hr", { id: 2, role: "employee" });
  expect(screen.getByText("Employee page")).toBeInTheDocument();
});

test("no session -> login", () => {
  render(
    <MemoryRouter initialEntries={["/hr"]}>
      <Routes>
        <Route element={<PrivateRoute allowedRoles={["hr"]} />}>
          <Route path="/hr" element={<p>HR page</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText("Login page")).toBeInTheDocument();
});

test("network errors give the friendly waking-up message; API errors pass through", () => {
  expect(getErrorMessage({ code: "ECONNABORTED" })).toBe(SERVER_UNAVAILABLE_MESSAGE);
  expect(SERVER_UNAVAILABLE_MESSAGE).toMatch(/waking up/i);
  expect(getErrorMessage({ response: { data: { error: "Invalid credentials" } } })).toBe("Invalid credentials");
});

test("API timeout defaults to 60 seconds", () => {
  expect(API_TIMEOUT_MS).toBe(60000);
});
