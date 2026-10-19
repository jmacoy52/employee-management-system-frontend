import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import api from "../api/client";
import DepartmentsPage from "../pages/hr/DepartmentsPage";
import EmployeeForm from "../components/common/EmployeeForm";
import EmployeeList from "../components/common/EmployeeList";

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

const DEPARTMENTS = [
  { id: 1, name: "Engineering", description: "Builds the product", is_active: 1, head_employee_id: 10, head_name: "Ama Owusu", employee_count: 2 },
  { id: 2, name: "Finance", description: null, is_active: 1, head_employee_id: null, head_name: null, employee_count: 0 },
  { id: 3, name: "Archive", description: null, is_active: 0, head_employee_id: null, head_name: null, employee_count: 1 },
];
const EMPLOYEES = [
  { id: 10, FullName: "Ama Owusu", position: "Lead", department_id: 1, department_name: "Engineering", Department: "Engineering", salary: 1, email: "a@x.org", created_at: "2026-01-01" },
  { id: 11, FullName: "Yaw Boateng", position: "Developer", department_id: 1, department_name: "Engineering", Department: "Engineering", salary: 1, email: "y@x.org", created_at: "2026-01-01" },
  { id: 12, FullName: "Esi Mensah", position: "Clerk", department_id: 3, department_name: "Archive", Department: "Archive", salary: 1, email: "e@x.org", created_at: "2026-01-01" },
];

const renderPage = (ui) => render(<MemoryRouter initialEntries={["/hr/departments"]}>{ui}</MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url === "/api/departments") return Promise.resolve({ data: DEPARTMENTS });
    if (url === "/api/employees") return Promise.resolve({ data: EMPLOYEES });
    if (url === "/api/departments/1") {
      return Promise.resolve({ data: { ...DEPARTMENTS[0], members: EMPLOYEES.slice(0, 2) } });
    }
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
});

test("departments page lists active departments with heads and counts, and filters by status", async () => {
  renderPage(<DepartmentsPage />);
  const table = await screen.findByRole("table");
  await within(table).findByText("Engineering");
  expect(within(table).getByText("Ama Owusu")).toBeInTheDocument();
  expect(within(table).queryByText("Archive")).toBeNull();
  // a department with members cannot be deleted; an empty one can
  expect(screen.getByRole("button", { name: "Delete Engineering" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Delete Finance" })).toBeEnabled();
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "inactive" } });
  expect(within(table).getByText("Archive")).toBeInTheDocument();
  expect(within(table).queryByText("Finance")).toBeNull();
});

test("creating a department posts the name and description", async () => {
  renderPage(<DepartmentsPage />);
  await screen.findAllByText("Engineering");
  fireEvent.click(screen.getByRole("button", { name: /new department/i }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Legal" } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Contracts" } });
  fireEvent.click(screen.getByRole("button", { name: /create department/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/departments", { name: "Legal", description: "Contracts" }));
});

test("members dialog: set head, remove a member and add employees from other departments", async () => {
  renderPage(<DepartmentsPage />);
  await screen.findAllByText("Engineering");
  fireEvent.click(screen.getAllByRole("button", { name: /members/i })[0]);
  const dialog = await screen.findByRole("dialog", { name: "Engineering" });
  await within(dialog).findByRole("button", { name: "Remove Yaw Boateng from Engineering" });
  fireEvent.change(within(dialog).getByLabelText("Head of department"), { target: { value: "11" } });
  await waitFor(() => expect(api.put).toHaveBeenCalledWith("/api/departments/1/head", { employee_id: 11 }));
  const remove = () => within(dialog).getByRole("button", { name: "Remove Yaw Boateng from Engineering" });
  await waitFor(() => expect(remove()).toBeEnabled());
  fireEvent.click(remove());
  await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/api/departments/1/employees/11"));
  // only people outside Engineering are offered
  await waitFor(() => expect(remove()).toBeEnabled());
  fireEvent.click(within(dialog).getByRole("checkbox"));
  fireEvent.click(within(dialog).getByRole("button", { name: /add 1 selected/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/departments/1/employees", { employee_ids: [12] }));
});

test("employee form offers only active departments and sends department_id", async () => {
  render(<MemoryRouter><EmployeeForm onSuccess={jest.fn()} /></MemoryRouter>);
  const select = screen.getByLabelText("Department");
  await within(select).findByRole("option", { name: "Engineering" });
  expect(within(select).queryByRole("option", { name: "Archive" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Kojo Antwi" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "kojo@x.org" } });
  fireEvent.change(screen.getByLabelText("Position"), { target: { value: "Driver" } });
  fireEvent.change(select, { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: "3000" } });
  fireEvent.click(screen.getByRole("button", { name: /create employee/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/employees", expect.objectContaining({ department_id: 2, salary: 3000 })));
});

test("employee list filters by real department", () => {
  render(<EmployeeList employees={EMPLOYEES} onEdit={jest.fn()} onDelete={jest.fn()} departments={DEPARTMENTS} />);
  fireEvent.change(screen.getByLabelText("Filter by Department"), { target: { value: "3" } });
  expect(screen.getByText("Esi Mensah")).toBeInTheDocument();
  expect(screen.queryByText("Yaw Boateng")).toBeNull();
  expect(screen.getByText("1 of 3")).toBeInTheDocument();
});
