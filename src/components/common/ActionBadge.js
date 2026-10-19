import React from "react";

// Colour group for an audit action name, e.g. DELETE_USER -> danger.
export function actionTone(action = "") {
  if (/DELETE|DEACTIVATE/.test(action)) return "danger";
  if (/PASSWORD|RESET/.test(action)) return "warning";
  if (/CREATE|REGISTER|ACTIVATE|LINK/.test(action)) return "success";
  if (/LOGIN|LOGOUT/.test(action)) return "primary";
  return "neutral";
}

const ActionBadge = ({ action }) => (
  <span className={`badge badge-mono action-${actionTone(action)}`}>{action}</span>
);

export default ActionBadge;
