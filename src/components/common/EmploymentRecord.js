import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { formatCedis } from "./EmployeeStats";
import "./ProfilePanel.css";

// The employee record HR linked to the signed-in account (position, department, salary).
const EmploymentRecord = () => {
  const [record, setRecord] = useState(null);
  const [message, setMessage] = useState("Loading your employment record…");

  useEffect(() => {
    api
      .get("/api/users/me/employee")
      .then((res) => setRecord(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setMessage("Your account is not linked to an employee record yet. Ask HR to link it.");
        } else {
          setMessage(getErrorMessage(err, "Failed to load your employment record."));
        }
      });
  }, []);

  return (
    <section className="card my-profile-page employment-record">
      <div className="card-header">
        <h2 className="card-title">My Employment Record</h2>
      </div>
      {record ? (
        <dl className="detail-list profile-details">
          <div><dt>Name</dt><dd>{record.FullName}</dd></div>
          <div><dt>Position</dt><dd>{record.position}</dd></div>
          <div><dt>Department</dt><dd><span className="badge">{record.department_name || record.Department || "None"}</span></dd></div>
          <div><dt>Joined</dt><dd>{new Date(record.created_at).toLocaleDateString()}</dd></div>
          <div className="span-2"><dt>Monthly Salary</dt><dd className="record-salary">{formatCedis(record.salary)}</dd></div>
        </dl>
      ) : (
        <p className="employment-record-message">{message}</p>
      )}
    </section>
  );
};

export default EmploymentRecord;
