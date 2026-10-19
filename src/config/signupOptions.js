// Choices on "Register your organisation". The API accepts exactly these values
// (employee-management-backend config/signupOptions.js); keep the lists in step.
export const ORG_TYPES = [
  "Private company",
  "Small or medium business",
  "School or college",
  "NGO or non-profit",
  "Healthcare",
  "Government or public sector",
  "Faith-based organisation",
  "Hospitality",
  "Retail",
  "Manufacturing",
  "Agriculture",
  "Technology",
  "Other",
];

export const SIZE_RANGES = [
  { value: "1-10", label: "1–10 staff" },
  { value: "11-50", label: "11–50 staff" },
  { value: "51-200", label: "51–200 staff" },
  { value: "201-500", label: "201–500 staff" },
  { value: "501-1000", label: "501–1,000 staff" },
  { value: "1000+", label: "More than 1,000 staff" },
];

export const sizeLabel = (value) => SIZE_RANGES.find((s) => s.value === value)?.label || value || "–";

// Digits, spaces, +, -, ( and ); 7 to 25 characters (same rule as the API)
export const PHONE_RE = /^\+?[0-9 ()-]{7,25}$/;
