import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[1280px] items-center justify-center px-5 py-32">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return user ? <Navigate to="/tasks" replace /> : <Navigate to="/login" replace />;
}
