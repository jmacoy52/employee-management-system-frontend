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

test("/register has no public sign-up form: it points to your organisation or organisation sign-up", () => {
  render(<MemoryRouter><Register /></MemoryRouter>);
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByText(/admin or HR team creates your account/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /register your organisation/i })).toHaveAttribute("href", "/register-organisation");
});

function renderAll(path, user) {
  localStorage.setItem("token", fakeToken({ id: user.id, role: user.role }));
  localStorage.setItem("user", JSON.stringify(user));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PrivateRoute allowedRoles={["hr", "admin"]} />}>
          <Route path="/hr" element={<p>HR page</p>} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<p>Admin page</p>} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["owner"]} />}>
          <Route path="/owner" element={<p>Owner console</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

test("admins cannot open the owner console; the owner cannot open organisation pages", () => {
  renderAll("/owner", { id: 1, role: "admin" });
  expect(screen.getByText("Admin page")).toBeInTheDocument();
  localStorage.clear();
});

test("owner is sent from organisation pages to the owner console", () => {
  renderAll("/hr", { id: 9, role: "owner", organization: null });
  expect(screen.getByText("Owner console")).toBeInTheDocument();
});

test("owner can open the owner console", () => {
  renderAll("/owner", { id: 9, role: "owner", organization: null });
  expect(screen.getByText("Owner console")).toBeInTheDocument();
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
