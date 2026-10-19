import api from "../api/client";

// Reads the signed-in user saved at login (null if missing or unreadable).
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Signs out on the server too (revokes the token), then clears the local session.
// The local session is cleared even if the server cannot be reached.
export async function logout() {
  try {
    if (localStorage.getItem("token")) await api.post("/api/users/logout");
  } catch {
    /* server asleep or token already invalid: still sign out locally */
  }
  clearSession();
}
