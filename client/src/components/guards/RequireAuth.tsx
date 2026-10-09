import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[1280px] items-center justify-center px-5 py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-sm font-medium text-mute">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
