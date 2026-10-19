import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../api/client";
import OwnerOrganisationDetail from "../pages/owner/OwnerOrganisationDetail";
import OwnerAdmins from "../pages/owner/OwnerAdmins";
import HRDashboard from "../pages/hr/HRDashboard";

jest.mock("../api/client", () => {
  const mock = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  return {
    __esModule: true,
    default: mock,
    getErrorMessage: (err, fallback) => err?.response?.data?.error || fallback,
  };
});
jest.mock("react-hot-toast", () => {
  const toast = jest.fn();
  toast.success = jest.fn();
  toast.error = jest.fn();
  return { __esModule: true, default: toast, toast };
});

// What the owner API returns for an organisation: its admin account holder(s) and head counts only
const ORG = {
  id: 5, name: "Kumasi Traders", slug: "kumasi-traders", status: "active", plan: "standard", seat_limit: null,
  contact_email: "yaa@kumasi.example", contact_name: "Yaa Mensah", org_type: "Retail", size_range: "11-50",
  country: "Ghana", city: "Kumasi", phone: null, created_at: "2026-10-01T10:00:00Z", approved_at: "2026-10-02T10:00:00Z",
  user_count: 6, active_user_count: 5, employee_count: 4, department_count: 2,
  admins: [{ id: 21, username: "Yaa Mensah", email: "yaa@kumasi.example", role: "admin", is_active: 1, must_change_password: 0, created_at: "2026-10-01T10:00:00Z", last_login_at: "2026-10-18T09:30:00Z" }],
  user_counts: { admin: { active: 1, inactive: 0 }, hr: { active: 1, inactive: 1 }, employee: { active: 3, inactive: 0 } },
};
const ADMINS = [
  { ...ORG.admins[0], organization_id: 5, organization_name: "Kumasi Traders", organization_status: "active" },
  { id: 30, username: "Esi Tema", email: "esi@tema.example", role: "admin", is_active: 0, must_change_password: 0, created_at: "2026-10-03T10:00:00Z", last_login_at: null, organization_id: 7, organization_name: "Tema Shipping", organization_status: "active" },
];

const asOwner = () => localStorage.setItem("user", JSON.stringify({ id: 9, username: "Owner", email: "owner@platform.example", role: "owner", organization: null }));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "t");
  asOwner();
  api.get.mockImplementation((url) => {
    if (url === "/api/platform/overview") return Promise.resolve({ data: { pending: 0, enquiries_new: 0 } });
    if (url === "/api/platform/organizations/5") return Promise.resolve({ data: ORG });
    if (url === "/api/platform/organizations") return Promise.resolve({ data: [ORG] });
    if (url === "/api/platform/admins") return Promise.resolve({ data: ADMINS });
    return Promise.resolve({ data: [] });
  });
});
afterEach(() => localStorage.clear());

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={["/owner/organisations/5"]}>
      <Routes><Route path="/owner/organisations/:id" element={<OwnerOrganisationDetail />} /></Routes>
    </MemoryRouter>
  );

test("organisation detail shows the admin account holder and head counts by role, with no staff list", async () => {
  renderDetail();
  const admins = await screen.findByRole("heading", { name: /organisation admin \(1\)/i });
  const card = admins.closest("section");
  expect(within(card).getByText("Yaa Mensah")).toBeInTheDocument();
  expect(within(card).getAllByText("yaa@kumasi.example").length).toBeGreaterThan(0);
  expect(within(card).queryByText("Never")).toBeNull(); // has a last sign-in
  expect(within(card).getByRole("button", { name: /deactivate/i })).toBeInTheDocument();
  expect(within(card).getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  const counts = screen.getByRole("heading", { name: /user accounts by role/i }).closest("section");
  const hrRow = within(counts).getByText("HR").closest("tr");
  expect(within(hrRow).getAllByRole("cell").map((c) => c.textContent)).toEqual(["HR", "1", "1", "2"]);
  const empRow = within(counts).getByText("Employees").closest("tr");
  expect(within(empRow).getAllByRole("cell").map((c) => c.textContent)).toEqual(["Employees", "3", "0", "3"]);
  expect(screen.queryByRole("heading", { name: /^users \(/i })).toBeNull();
  // The owner nav links to Organisation admins, not an "All users" list
  const nav = screen.getByRole("navigation", { name: "Owner console" });
  expect(within(nav).getByRole("link", { name: /organisation admins/i })).toHaveAttribute("href", "/owner/admins");
  expect(within(nav).queryByRole("link", { name: /all users/i })).toBeNull();
});

test("owner support actions go to the admin-only endpoints", async () => {
  api.put.mockResolvedValue({ data: {} });
  api.post.mockResolvedValue({ data: { temporaryPassword: "Temp-Pass-1234" } });
  window.confirm = jest.fn(() => true);
  renderDetail();
  const card = (await screen.findByRole("heading", { name: /organisation admin \(1\)/i })).closest("section");
  fireEvent.click(within(card).getByRole("button", { name: /deactivate/i }));
  await waitFor(() => expect(api.put).toHaveBeenCalledWith("/api/platform/admins/21/status", { is_active: false }));
  fireEvent.click(within(card).getByRole("button", { name: /reset password/i }));
  fireEvent.click(await screen.findByRole("button", { name: /set temporary password/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/platform/admins/21/temporary-password"));
  expect(await screen.findByDisplayValue("Temp-Pass-1234")).toBeInTheDocument();
});

test("Organisation admins page lists admins from /api/platform/admins with last sign-in, and has no role filter", async () => {
  render(<MemoryRouter initialEntries={["/owner/admins"]}><OwnerAdmins /></MemoryRouter>);
  expect(await screen.findByRole("heading", { name: "Organisation admins" })).toBeInTheDocument();
  expect(await screen.findByText("esi@tema.example")).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/api/platform/admins", expect.anything());
  expect(api.get).not.toHaveBeenCalledWith("/api/platform/users", expect.anything());
  expect(screen.queryByLabelText("Role")).toBeNull();
  expect(screen.getByText("Never")).toBeInTheDocument(); // Esi has not signed in yet
  expect(screen.getByText("2 admins")).toBeInTheDocument();
});

test("HR dashboard does not read the audit log for HR accounts; admins still see recent activity", async () => {
  localStorage.setItem("user", JSON.stringify({ id: 2, username: "Akua HR", email: "hr@x.example", role: "hr", organization: { name: "X" } }));
  const { unmount } = render(<MemoryRouter initialEntries={["/hr"]}><HRDashboard /></MemoryRouter>);
  expect(await screen.findByRole("heading", { name: /employees by department/i })).toBeInTheDocument();
  await waitFor(() => expect(api.get).toHaveBeenCalledWith("/api/employees"));
  expect(api.get).not.toHaveBeenCalledWith("/api/audit-logs/recent");
  expect(screen.queryByRole("heading", { name: /recent activity/i })).toBeNull();
  unmount();
  localStorage.setItem("user", JSON.stringify({ id: 1, username: "Ama Admin", email: "admin@x.example", role: "admin", organization: { name: "X" } }));
  render(<MemoryRouter initialEntries={["/admin/hr"]}><HRDashboard /></MemoryRouter>);
  expect(await screen.findByRole("heading", { name: /recent activity/i })).toBeInTheDocument();
  await waitFor(() => expect(api.get).toHaveBeenCalledWith("/api/audit-logs/recent"));
});
