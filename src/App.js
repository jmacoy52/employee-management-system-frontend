import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: { fontFamily: "var(--font-sans)", fontSize: "0.9rem", borderRadius: "10px" },
          success: { iconTheme: { primary: "#15803d", secondary: "#fff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
