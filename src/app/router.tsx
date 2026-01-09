import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import App from "../App.tsx";
import Dashboard from "../pages/Dashboard";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <App />,          // ✅ Home stays intact
      },
      {
        path: "/dashboard",
        element: <Dashboard />,     // ✅ Kanban Dashboard
      },
    ],
  },
]);
