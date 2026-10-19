import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../api/client";
import MyPayslips from "../pages/payroll/MyPayslips";
import PayslipPage from "../pages/payroll/PayslipPage";
import PayrollPage from "../pages/payroll/PayrollPage";
import PayrollRunPage from "../pages/payroll/PayrollRunPage";
import { formatAmount, formatMoney, periodLabel, dateLabel, lastWorkingDay, maskAccount } from "../pages/payroll/payrollShared";

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

const SLIP = {
  id: 41, period: "2026-09", pay_date: "2026-09-30", status: "published", reference: "PS-202609-ABC234",
  organization_name: "EmploCore Demo", employee_name: "Kwame Mensah", employee_number: "EMP-0001", department_name: "Engineering", job_title: "Software Engineer",
  bank_name: "GCB Bank", bank_account: "1021130045678", ssnit_number: null, currency: "GHS",
  basic_pesewas: 950000, allowances_pesewas: 150000, gross_pesewas: 1100000, ssnit_employee_pesewas: 52250, taxable_pesewas: 1047750,
  paye_pesewas: 222388, other_deductions_pesewas: 5000, net_pesewas: 820362, ssnit_employer_pesewas: 123500,
  lines: {
    allowances: [{ name: "Transport", amount: 40000 }, { name: "Housing", amount: 80000 }, { name: "Lunch", amount: 30000 }],
    deductions: [{ name: "Staff welfare", amount: 5000 }],
    rules: { payeTable: "GRA monthly rates, Income Tax (Amendment) Act, 2026 (Act 1178), from 1 September 2026", ssnitEmployeeRateBp: 550, ssnitEmployerRateBp: 1300 },
  },
};
const AUG = { ...SLIP, id: 33, period: "2026-08", pay_date: "2026-08-28", reference: "PS-202608-XYZ789", net_pesewas: 812000 };

const at = (path, element, route) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes><Route path={route || path} element={element} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "t");
  localStorage.setItem("user", JSON.stringify({ id: 3, username: "Kwame Mensah", email: "kwame@x.org", role: "employee" }));
});
afterEach(() => localStorage.clear());

test("money and date helpers", () => {
  expect(formatAmount(123456)).toBe("1,234.56");
  expect(formatAmount(5)).toBe("0.05");
  expect(formatMoney(820362)).toBe("GHS 8,203.62");
  expect(periodLabel("2026-09")).toBe("September 2026");
  expect(dateLabel("2026-09-30")).toBe("30 September 2026");
  expect(lastWorkingDay("2026-10")).toBe("2026-10-30"); // 31 October 2026 is a Saturday
  expect(lastWorkingDay("2026-09")).toBe("2026-09-30");
  expect(maskAccount("1021 1300 45678")).toBe("•••• 5678");
});

test("My payslips lists each month with View, Download PDF and Print", async () => {
  api.get.mockResolvedValue({ data: [SLIP, AUG] });
  at("/employee/payslips", <MyPayslips />);
  const list = await screen.findByRole("list", { name: "Payslips" });
  const items = within(list).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(within(items[0]).getByRole("heading", { name: "September 2026" })).toBeInTheDocument();
  expect(within(items[0]).getByText("GHS 8,203.62")).toBeInTheDocument();
  expect(within(items[0]).getByText(/Paid 30 September 2026/)).toBeInTheDocument();
  expect(within(items[0]).getByRole("link", { name: "View payslip for September 2026" })).toHaveAttribute("href", "/employee/payslips/41");
  expect(within(items[1]).getByRole("button", { name: "Download PDF for August 2026" })).toBeInTheDocument();
  expect(within(items[1]).getByRole("button", { name: "Print payslip for August 2026" })).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/api/payroll/my-payslips");
});

test("Download PDF fetches the file with the session and saves it under the payslip name", async () => {
  api.get.mockImplementation((url) => (url.endsWith("/pdf") ? Promise.resolve({ data: new Blob(["%PDF-"], { type: "application/pdf" }) }) : Promise.resolve({ data: [SLIP] })));
  global.URL.createObjectURL = jest.fn(() => "blob:payslip");
  global.URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  at("/employee/payslips", <MyPayslips />);
  fireEvent.click(await screen.findByRole("button", { name: "Download PDF for September 2026" }));
  await waitFor(() => expect(click).toHaveBeenCalled());
  expect(api.get).toHaveBeenCalledWith("/api/payroll/my-payslips/41/pdf", { responseType: "blob" });
  expect(click.mock.instances[0].download).toBe("payslip-2026-09-PS-202609-ABC234.pdf");
  click.mockRestore();
});

test("an employee with no published payslips sees an empty state", async () => {
  api.get.mockResolvedValue({ data: [] });
  at("/employee/payslips", <MyPayslips />);
  expect(await screen.findByText("No payslips yet")).toBeInTheDocument();
});

test("the payslip view shows the organisation, employee, period, earnings, deductions, net and reference", async () => {
  api.get.mockResolvedValue({ data: SLIP });
  at("/employee/payslips/41", <PayslipPage mode="employee" />, "/employee/payslips/:id");
  const doc = await screen.findByRole("article", { name: "Payslip for September 2026" });
  for (const text of ["EmploCore Demo", "Kwame Mensah", "EMP-0001", "Engineering", "Software Engineer", "30 September 2026", "GCB Bank •••• 5678", "Transport", "Staff welfare", "Income tax (PAYE)", "SSNIT (employee 5.5%)", "11,000.00", "2,223.88", "GHS 8,203.62"]) {
    expect(within(doc).getAllByText(text, { exact: false }).length).toBeGreaterThan(0);
  }
  expect(within(doc).getAllByText("PS-202609-ABC234", { exact: false }).length).toBe(2); // details and footer
  expect(within(doc).getByText(/Act 1178/)).toBeInTheDocument();
  expect(within(doc).queryByText("Published")).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/api/payroll/my-payslips/41");

  const print = jest.spyOn(window, "print").mockImplementation(() => {});
  fireEvent.click(screen.getByRole("button", { name: /Print/ }));
  expect(print).toHaveBeenCalled();
  print.mockRestore();
});

test("?print=1 opens the print dialog once the payslip has loaded", async () => {
  jest.useFakeTimers();
  const print = jest.spyOn(window, "print").mockImplementation(() => {});
  api.get.mockResolvedValue({ data: SLIP });
  at("/employee/payslips/41?print=1", <PayslipPage mode="employee" />, "/employee/payslips/:id");
  await screen.findByRole("article");
  jest.advanceTimersByTime(400);
  expect(print).toHaveBeenCalledTimes(1);
  print.mockRestore();
  jest.useRealTimers();
});

test("a payslip that is not the employee's (or not published) shows not found", async () => {
  api.get.mockRejectedValue({ response: { status: 404, data: { error: "Payslip not found" } } });
  at("/employee/payslips/99", <PayslipPage mode="employee" />, "/employee/payslips/:id");
  expect(await screen.findByText("This payslip was not found.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Download PDF/ })).not.toBeInTheDocument();
});

const RUNS = [
  { id: 2, period: "2026-09", pay_date: "2026-09-30", payslip_count: 8, draft_count: 0, published_count: 8, gross: 5000000, net: 3900000, paye: 700000, ssnit_employee: 250000, ssnit_employer: 600000 },
  { id: 1, period: "2026-08", pay_date: "2026-08-28", payslip_count: 8, draft_count: 2, published_count: 6, gross: 5000000, net: 3910000, paye: 690000, ssnit_employee: 250000, ssnit_employer: 600000 },
];
const PAY = [
  { employeeId: 1, employeeNumber: "EMP-0001", name: "Kwame Mensah", jobTitle: "Software Engineer", department: "Engineering", saved: true, basic: 950000, allowances: [{ name: "Transport", amount: 40000 }], deductions: [], bankName: "GCB Bank", net: 700000 },
  { employeeId: 2, employeeNumber: "EMP-0002", name: "Efua Appiah", jobTitle: "QA Engineer", department: "Engineering", saved: false, basic: 780000, allowances: [], deductions: [], bankName: null, net: 600000 },
];

const mockPayrollApi = (details = {}) => {
  api.get.mockImplementation((url) => {
    if (url === "/api/payroll/runs") return Promise.resolve({ data: RUNS });
    if (url === "/api/payroll/pay-details") return Promise.resolve({ data: PAY });
    if (url.startsWith("/api/payroll/employees/")) return Promise.resolve({ data: { ...PAY[0], ssnitNumber: null, bankAccount: "1021130045678", ...details } });
    return Promise.reject(new Error(url));
  });
  api.post.mockImplementation((url) => {
    if (url === "/api/payroll/preview") return Promise.resolve({ data: { gross: 990000, ssnitEmployee: 52250, paye: 190000, deductionsTotal: 0, net: 747750 } });
    if (url === "/api/payroll/runs") return Promise.resolve({ status: 201, data: { message: "8 draft payslip(s) created for October 2026", created: 8, skipped: 0, noSalary: [] } });
    return Promise.reject(new Error(url));
  });
};

test("HR payroll page lists months with totals and opens a month", async () => {
  mockPayrollApi();
  at("/hr/payroll", <PayrollPage />);
  const open = await screen.findByRole("link", { name: "Open payroll for September 2026" });
  expect(open).toHaveAttribute("href", "/hr/payroll/2026-09");
  const table = screen.getByRole("tabpanel");
  expect(within(table).getByText("September 2026")).toBeInTheDocument();
  expect(within(table).getByText("39,000.00")).toBeInTheDocument();
  expect(within(table).getByText("2 draft")).toBeInTheDocument();
  expect(within(table).getByRole("link", { name: "Open payroll for August 2026" })).toHaveAttribute("href", "/hr/payroll/2026-08");
  expect(screen.getAllByText("GHS 39,000.00").length).toBeGreaterThan(0); // latest month net
});

test("pay details: edit with a live calculation and save", async () => {
  mockPayrollApi();
  api.put.mockResolvedValue({ data: { message: "Pay details saved" } });
  at("/hr/payroll", <PayrollPage />);
  fireEvent.click(await screen.findByRole("tab", { name: "Pay details" }));
  expect(screen.getByText("Efua Appiah")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Edit pay details of Kwame Mensah" }));
  const basic = await screen.findByLabelText("Basic monthly salary (GHS)");
  expect(basic).toHaveValue("9500.00");
  expect(screen.getByLabelText("Allowance 1 name")).toHaveValue("Transport");
  fireEvent.change(basic, { target: { value: "9600" } });
  fireEvent.click(screen.getByRole("button", { name: "Add deduction" }));
  fireEvent.change(screen.getByLabelText("Deduction 1 name"), { target: { value: "Loan" } });
  fireEvent.change(screen.getByLabelText("Deduction 1 amount (GHS)"), { target: { value: "200" } });
  expect(await screen.findByText("7,477.50", {}, { timeout: 2000 })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save pay details" }));
  await waitFor(() => expect(api.put).toHaveBeenCalled());
  const [url, body] = api.put.mock.calls[0];
  expect(url).toBe("/api/payroll/employees/1/pay-details");
  expect(body).toMatchObject({ basicSalary: "9600", allowances: [{ name: "Transport", amount: "400.00" }], deductions: [{ name: "Loan", amount: "200" }], bankName: "GCB Bank" });
});

test("pay details of the demo employee are read-only", async () => {
  mockPayrollApi({ demoProtected: true });
  at("/hr/payroll", <PayrollPage />);
  fireEvent.click(await screen.findByRole("tab", { name: "Pay details" }));
  fireEvent.click(screen.getByRole("button", { name: "Edit pay details of Kwame Mensah" }));
  expect(await screen.findByText(/can't be changed/)).toBeInTheDocument();
  expect(screen.getByLabelText("Basic monthly salary (GHS)")).toBeDisabled();
  expect(screen.queryByRole("button", { name: "Save pay details" })).not.toBeInTheDocument();
});

test("run payroll for selected employees", async () => {
  mockPayrollApi();
  at("/hr/payroll", <PayrollPage />);
  await screen.findByRole("link", { name: "Open payroll for September 2026" });
  fireEvent.click(screen.getByRole("button", { name: /Run payroll/ }));
  fireEvent.change(screen.getByLabelText("Month"), { target: { value: "2026-10" } });
  expect(screen.getByLabelText("Pay date")).toHaveValue("2026-10-30");
  fireEvent.click(screen.getByLabelText("Selected employees"));
  fireEvent.click(screen.getByLabelText(/Efua Appiah/));
  fireEvent.click(screen.getByRole("button", { name: "Create draft payslips" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/payroll/runs", { period: "2026-10", payDate: "2026-10-30", employeeIds: [2] }));
});

test("payroll month: totals, publish all drafts, delete a draft", async () => {
  const run = {
    id: 3, period: "2026-10", pay_date: "2026-10-30",
    totals: { gross_pesewas: 2100000, net_pesewas: 1600000, paye_pesewas: 300000, ssnit_employee_pesewas: 100000, ssnit_employer_pesewas: 200000, other_deductions_pesewas: 5000 },
    payslips: [
      { ...SLIP, id: 51, period: "2026-10", status: "draft", employee_name: "Kwame Mensah" },
      { ...SLIP, id: 52, period: "2026-10", status: "published", employee_name: "Efua Appiah" },
    ],
  };
  api.get.mockResolvedValue({ data: run });
  api.post.mockResolvedValue({ data: { message: "1 payslip(s) published", published: 1 } });
  api.delete.mockResolvedValue({ data: {} });
  window.confirm = jest.fn(() => true);
  at("/hr/payroll/2026-10", <PayrollRunPage />, "/hr/payroll/:period");
  expect(await screen.findByText("GHS 16,000.00")).toBeInTheDocument();
  expect(screen.getByText("Totals")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View payslip of Efua Appiah" })).toHaveAttribute("href", "/hr/payslips/52");
  // Only drafts can be selected or deleted
  expect(screen.getByLabelText("Select Kwame Mensah")).toBeInTheDocument();
  expect(screen.queryByLabelText("Select Efua Appiah")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Delete draft of Efua Appiah" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Publish all drafts \(1\)/ }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/payroll/runs/2026-10/publish", {}));
  fireEvent.click(screen.getByRole("button", { name: "Delete draft of Kwame Mensah" }));
  await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/api/payroll/payslips/51"));
});
