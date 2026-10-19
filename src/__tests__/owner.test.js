import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import api from "../api/client";
import OwnerAccount, { ownerPasswordProblem } from "../pages/owner/OwnerAccount";
import OwnerEnquiries from "../pages/owner/OwnerEnquiries";
import OwnerOverview from "../pages/owner/OwnerOverview";
import Contact from "../pages/public/Contact";
import Header from "../components/layout/Header";

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

const OWNER = { id: 9, username: "Joseph Migbodzi", email: "owner@platform.example", role: "owner", created_at: "2026-10-19T13:52:00Z", password_changed_at: null };
const PENDING = [
  { id: 5, name: "Kumasi Traders", status: "pending", org_type: "Retail", size_range: "11-50", country: "Ghana", city: "Kumasi", phone: "+233 20 000 0000", contact_name: "Yaa Mensah", contact_email: "yaa@kumasi.example", created_at: "2026-10-19T10:00:00Z", active_user_count: 1, seat_limit: null },
];
const ENQUIRIES = [
  { id: 1, name: "Abena Darko", organization_name: "Darko Clinic", email: "abena@darko.example", phone: "+233 24 111 2222", message: "We would like a walkthrough.", status: "new", created_at: "2026-10-19T11:00:00Z" },
];

const renderAt = (ui, path = "/") => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "t");
  localStorage.setItem("user", JSON.stringify({ id: 9, username: OWNER.username, email: OWNER.email, role: "owner", organization: null }));
  api.get.mockImplementation((url, opts) => {
    if (url === "/api/platform/overview") return Promise.resolve({ data: { pending: 1, enquiries_new: 1, active: 2, suspended: 0, users: 4, employees: 8, signups_30d: 1 } });
    if (url === "/api/platform/account") return Promise.resolve({ data: OWNER });
    if (url === "/api/platform/organizations") return Promise.resolve({ data: opts?.params?.status === "pending" ? PENDING : PENDING });
    if (url === "/api/platform/enquiries") return Promise.resolve({ data: ENQUIRIES });
    return Promise.resolve({ data: [] });
  });
});
afterEach(() => localStorage.clear());

test("owner nav shows My account, Enquiries and the pending count", async () => {
  renderAt(<OwnerOverview />, "/owner");
  const nav = screen.getByRole("navigation", { name: "Owner console" });
  expect(within(nav).getByRole("link", { name: /my account/i })).toHaveAttribute("href", "/owner/account");
  expect(within(nav).getByRole("link", { name: /enquiries/i })).toHaveAttribute("href", "/owner/enquiries");
  expect(await within(nav).findByLabelText("1 waiting for approval")).toHaveTextContent("1");
});

test("overview lists pending registrations with their sign-up details and can reject with a reason", async () => {
  api.post.mockResolvedValue({ data: { message: "Organisation rejected", status: "rejected" } });
  renderAt(<OwnerOverview />, "/owner");
  const panel = await screen.findByRole("region", { name: /pending approval/i });
  expect(await within(panel).findByText("Kumasi Traders")).toBeInTheDocument();
  expect(within(panel).getByText(/Retail/)).toBeInTheDocument();
  expect(within(panel).getByText("11–50 staff")).toBeInTheDocument();
  expect(within(panel).getByText(/Kumasi, Ghana/)).toBeInTheDocument();
  expect(within(panel).getByText(/Yaa Mensah · yaa@kumasi.example/)).toBeInTheDocument();
  fireEvent.click(within(panel).getByRole("button", { name: "Reject" }));
  fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: "Could not verify" } });
  fireEvent.click(screen.getByRole("button", { name: /reject registration/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/platform/organizations/5/reject", { reason: "Could not verify" }));
  expect(await screen.findByText("Abena Darko · Darko Clinic")).toBeInTheDocument();
});

test("my account: name saves without a password; a new e-mail asks for the current password", async () => {
  api.put.mockResolvedValue({ data: { message: "Your account has been updated", token: "t2", user: { ...OWNER, email: "new@platform.example" } } });
  renderAt(<OwnerAccount />, "/owner/account");
  const name = await screen.findByLabelText("Display name");
  await waitFor(() => expect(name).toHaveValue("Joseph Migbodzi"));
  expect(screen.queryByLabelText("Current password", { selector: "#account-current-password" })).toBeNull();
  fireEvent.change(screen.getByLabelText(/E-mail \(used to sign in\)/), { target: { value: "new@platform.example" } });
  const current = screen.getByLabelText("Current password", { selector: "#account-current-password" });
  expect(current).toBeRequired();
  fireEvent.change(current, { target: { value: "Strong-Platform-Key-2026" } });
  fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
  await waitFor(() => expect(api.put).toHaveBeenCalledWith("/api/platform/account", { name: "Joseph Migbodzi", email: "new@platform.example", currentPassword: "Strong-Platform-Key-2026" }));
  await waitFor(() => expect(localStorage.getItem("token")).toBe("t2"));
  expect(JSON.parse(localStorage.getItem("user")).email).toBe("new@platform.example");
});

test("my account: the password form applies the owner password rules before calling the server", async () => {
  renderAt(<OwnerAccount />, "/owner/account");
  await screen.findByDisplayValue("Joseph Migbodzi");
  fireEvent.change(screen.getByLabelText("Current password", { selector: "#account-pw-current" }), { target: { value: "x" } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Password123" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Password123" } });
  fireEvent.click(screen.getByRole("button", { name: /change password/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/12 characters/);
  expect(api.put).not.toHaveBeenCalled();
  expect(ownerPasswordProblem("Another-Strong-Key-2027", "owner@x.org")).toBe("");
  expect(ownerPasswordProblem("owner-is-me-2027", "owner@x.org")).toMatch(/e-mail name/);
  expect(ownerPasswordProblem("aaaaaaaaaaa1", "")).toMatch(/different/);
});

test("enquiries page lists demo requests and marks them contacted", async () => {
  api.put.mockResolvedValue({ data: { message: "Enquiry marked contacted" } });
  renderAt(<OwnerEnquiries />, "/owner/enquiries");
  expect(await screen.findByText("We would like a walkthrough.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "abena@darko.example" })).toHaveAttribute("href", expect.stringMatching(/^mailto:abena@darko.example/));
  fireEvent.click(screen.getByRole("button", { name: /mark contacted/i }));
  await waitFor(() => expect(api.put).toHaveBeenCalledWith("/api/platform/enquiries/1/status", { status: "contacted" }));
});

test("contact page: demo request form posts an enquiry; e-mail stays as a fallback", async () => {
  api.post.mockResolvedValue({ data: { message: "Thank you. We have received your request and will be in touch soon." } });
  renderAt(<Contact />, "/contact");
  expect(screen.getByRole("link", { name: /e-mail a demo request/i })).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Abena Darko" } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "abena@darko.example" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Please show us EmploCore." } });
  fireEvent.click(screen.getByRole("button", { name: /send demo request/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/enquiries", expect.objectContaining({ name: "Abena Darko", email: "abena@darko.example", website: "" })));
  expect(await screen.findByRole("status")).toHaveTextContent(/received your request/);
});

test("public header keeps a Sign in button visible on phones (outside the collapsed menu)", () => {
  renderAt(<Header />, "/");
  const mobile = document.querySelector(".signin-mobile");
  expect(mobile).toHaveAttribute("href", "/login");
  expect(mobile.closest("#public-nav")).toBeNull();
});
