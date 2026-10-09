import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout/Layout";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        element: <Navigate to="/tasks" replace />,
      },
      {
        path: "tasks",
        element: (
          <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8">
            <h1 className="font-display text-3xl font-semibold text-ink">Operations Tasks</h1>
            <p className="mt-2 text-mute">Task management workspace.</p>
          </div>
        ),
      },
      {
        path: "forbidden",
        element: (
          <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8 text-center">
            <h1 className="font-display text-4xl text-accent">403 - Forbidden</h1>
            <p className="mt-2 text-mute">You do not have permission to view this resource.</p>
          </div>
        ),
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
