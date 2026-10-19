import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
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
    <div className="my-profile-page">
      <h2>My Employment Record</h2>
      {record ? (
        <div className="profile-details">
          <p><strong>Name:</strong> {record.FullName}</p>
          <p><strong>Position:</strong> {record.position}</p>
          <p><strong>Department:</strong> {record.Department}</p>
          <p><strong>Monthly Salary:</strong> ₵{Number(record.salary).toLocaleString()}</p>
          <p><strong>Joined:</strong> {new Date(record.created_at).toLocaleDateString()}</p>
        </div>
      ) : (
        <p className="employment-record-message">{message}</p>
      )}
    </div>
  );
};

export default EmploymentRecord;
