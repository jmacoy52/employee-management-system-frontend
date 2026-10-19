import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../api/client";
import PricingSection from "../components/billing/PricingSection";
import Billing from "../pages/billing/Billing";
import BillingCallback from "../pages/billing/BillingCallback";
import { formatGhs, quote } from "../api/billing";
import { planBannerFor } from "../components/billing/PlanBanner";

jest.mock("../api/client", () => {
  const mock = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  return { __esModule: true, default: mock, getErrorMessage: (err, fallback) => err?.response?.data?.error || fallback };
});
jest.mock("react-hot-toast", () => {
  const toast = jest.fn();
  toast.success = jest.fn();
  toast.error = jest.fn();
  return { __esModule: true, default: toast, toast };
});

const plan = (code, name, m, y, inc, extra, f = {}) => ({
  code, name, tagline: `${name} tagline`, priceMonthly: m, priceYearly: y, includedEmployees: inc, extraEmployee: extra,
  maxAdmins: 1, maxHr: null, features: { payroll: true, auditLog: true, prioritySupport: false, ...f },
  featureList: [`${name} feature`], isPublic: true, selfServe: m !== null && m > 0, highlighted: code === "growth", sortOrder: 1,
});
const PLANS = [
  plan("free", "Free", 0, 0, 5, null, { payroll: false, auditLog: false }),
  plan("starter", "Starter", 9900, 99000, 15, 600),
  plan("growth", "Growth", 24900, 249000, 50, 500),
  plan("business", "Business", 54900, 549000, 150, 400),
  plan("enterprise", "Enterprise", null, null, null, null),
];
const OFFER = { code: "FOUNDING40", name: "Founding offer", percentOff: 40, months: 12, places: 25 };

const overview = (over = {}) => ({
  paymentsEnabled: false,
  subscription: {
    plan: PLANS[2], subscribedPlan: PLANS[2], status: "trialing", billingMode: "paystack", interval: null,
    trialEndsAt: new Date(Date.now() + 3 * 86400000).toISOString(), currentPeriodEnd: null, cancelAtPeriodEnd: false,
    graceEndsAt: null, amount: null, discount: null, lastPaymentStatus: null, lastPaymentAt: null, hasPaystackSubscription: false,
  },
  entitlements: { employeeLimit: 50, employeeCap: 50, maxAdmins: 1, maxHr: null, features: PLANS[2].features },
  usage: { employees: 12, admins: 1, hr: 2, activeUsers: 10 },
  overLimit: { employees: false },
  plans: PLANS, discount: { coupon: "FOUNDING40", percent: 40, months: 12, endsAt: null }, offer: OFFER, notices: [],
  ...over,
});

const at = (path, element, route) => render(
  <MemoryRouter initialEntries={[path]}><Routes><Route path={route || path} element={element} /></Routes></MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "t");
  localStorage.setItem("user", JSON.stringify({ id: 1, username: "Admin", email: "a@x.org", role: "admin" }));
});
afterEach(() => localStorage.clear());

test("formatGhs and quote follow the API's pricing rules", () => {
  expect(formatGhs(9900)).toBe("GHS 99");
  expect(formatGhs(14940)).toBe("GHS 149.40");
  expect(formatGhs(null)).toBe("Custom");
  // Starter, 18 employees: 3 extras at GHS 6 a month; yearly extras cost 10 months
  expect(quote(PLANS[1], "monthly", 18).total).toBe(9900 + 3 * 600);
  expect(quote(PLANS[1], "yearly", 18).total).toBe(99000 + 3 * 6000);
  expect(quote(PLANS[2], "monthly", 0, 40).total).toBe(14940);
});

test("public pricing shows every tier, toggles to yearly and links to the trial sign-up", async () => {
  api.get.mockResolvedValue({ data: { plans: PLANS, offer: OFFER } });
  at("/", <PricingSection />);
  expect(await screen.findByText("Starter")).toBeInTheDocument();
  expect(screen.getByText("GHS 99")).toBeInTheDocument();
  expect(screen.getByText(/first 25 paying organisations get 40% off for 12 months/)).toBeInTheDocument();
  const trials = screen.getAllByRole("link", { name: "Start 30-day free trial" });
  expect(trials).toHaveLength(3);
  trials.forEach((a) => expect(a).toHaveAttribute("href", "/register-organisation"));
  expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact#request-demo");
  fireEvent.click(screen.getByRole("button", { name: /Yearly/ }));
  expect(screen.getByText("GHS 990")).toBeInTheDocument();
  expect(screen.getByText("GHS 2,490")).toBeInTheDocument();
});

test("Billing page without Paystack keys says payments are coming soon and disables checkout", async () => {
  api.get.mockImplementation((url) => Promise.resolve({ data: url === "/api/billing" ? overview() : [] }));
  at("/admin/billing", <Billing />);
  expect(await screen.findByText(/Payments coming soon, contact us/)).toBeInTheDocument();
  expect(screen.getByText(/trial ends on/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Choose Business" })).toBeDisabled();
  expect(screen.getByText("No payments yet.")).toBeInTheDocument();
});

test("Billing page with payments on starts a Paystack checkout for the chosen plan", async () => {
  api.get.mockImplementation((url) => Promise.resolve({ data: url === "/api/billing" ? overview({ paymentsEnabled: true }) : [] }));
  api.post.mockResolvedValue({ data: { authorizationUrl: "https://checkout.paystack.com/abc", reference: "EC-1" } });
  const assign = jest.fn();
  const original = window.location;
  delete window.location;
  window.location = { ...original, assign };
  at("/admin/billing", <Billing />);
  fireEvent.click(await screen.findByRole("button", { name: /Yearly/ }));
  fireEvent.click(screen.getByRole("button", { name: "Choose Starter" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/billing/checkout", { plan: "starter", interval: "yearly" }));
  await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.paystack.com/abc"));
  window.location = original;
});

test("demo organisation is exempt: no plan chooser", async () => {
  const data = overview();
  data.subscription = { ...data.subscription, status: "active", billingMode: "exempt" };
  api.get.mockImplementation((url) => Promise.resolve({ data: url === "/api/billing" ? data : [] }));
  at("/admin/billing", <Billing />);
  expect(await screen.findByText(/public demo organisation/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Choose/ })).not.toBeInTheDocument();
});

test("callback verifies the reference server-side", async () => {
  api.post.mockResolvedValue({ data: { status: "activated" } });
  at("/admin/billing/callback?reference=EC-123&trxref=EC-123", <BillingCallback />, "/admin/billing/callback");
  expect(await screen.findByText("Payment received")).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith("/api/billing/verify", { reference: "EC-123" });
});

test("plan banner: grace, payroll lock and admin-only wording", () => {
  const grace = planBannerFor({ status: "grace", billingMode: "paystack", graceEndsAt: "2026-10-26T00:00:00Z", features: { payroll: true } }, { isAdmin: true });
  expect(grace.tone).toBe("danger");
  expect(grace.text).toMatch(/26 October 2026/);
  const locked = planBannerFor({ status: "free", billingMode: "paystack", planName: "Free", features: { payroll: false } }, { feature: "payroll" });
  expect(locked.text).toMatch(/Payroll is not included in the Free plan/);
  expect(locked.text).toMatch(/Ask your organisation admin/);
  expect(planBannerFor({ status: "active", billingMode: "exempt" })).toBeNull();
});
