import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { RequireAuth } from "./components/guards/RequireAuth";
import { RequireAdmin } from "./components/guards/RequireAdmin";
import { RootRedirect } from "./pages/RootRedirect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

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
            element: (
              <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8">
                <h1 className="font-display text-3xl font-semibold text-ink">Operations Tasks</h1>
                <p className="mt-2 text-mute">Task management workspace.</p>
              </div>
            ),
          },
        ],
      },
      // Protected admin routes
      {
        element: <RequireAdmin />,
        children: [
          {
            path: "admin",
            element: (
              <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8">
                <h1 className="font-display text-3xl font-semibold text-ink">Admin Dashboard</h1>
              </div>
            ),
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
