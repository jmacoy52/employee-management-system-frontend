import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the EmploCore home page", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /welcome to emplocore/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
});
