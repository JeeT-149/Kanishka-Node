import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { RequireAuth } from "./components/guards/RequireAuth";
import { RequireAdmin } from "./components/guards/RequireAdmin";
import { RootRedirect } from "./pages/RootRedirect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import TaskList from "./pages/tasks/TaskList";
import TaskCreate from "./pages/tasks/TaskCreate";
import TaskDetail from "./pages/tasks/TaskDetail";
import TaskEdit from "./pages/tasks/TaskEdit";
import AdminDashboard from "./pages/admin/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: RootRedirect,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "forbidden",
        Component: Forbidden,
      },
      // Protected operator routes
      {
        element: <RequireAuth />,
        children: [
          {
            path: "tasks",
            Component: TaskList,
          },
          {
            path: "tasks/new",
            Component: TaskCreate,
          },
          {
            path: "tasks/:id",
            Component: TaskDetail,
          },
          {
            path: "tasks/:id/edit",
            Component: TaskEdit,
          },
        ],
      },
      // Protected admin routes
      {
        element: <RequireAdmin />,
        children: [
          {
            path: "admin",
            Component: AdminDashboard,
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
