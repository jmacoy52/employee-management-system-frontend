import { useCallback, useEffect, useState } from "react";
import api from "./client";

// Loads /api/departments (HR/Admin). departments is null while loading, [] on failure.
export default function useDepartments() {
  const [departments, setDepartments] = useState(null);
  const reload = useCallback(async () => {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data);
    } catch {
      setDepartments([]);
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { departments, reload };
}

// Options for a department <select>: active departments, plus the current one even if deactivated.
export const departmentOptions = (departments, currentId) =>
  (departments || []).filter((d) => d.is_active || d.id === currentId);
