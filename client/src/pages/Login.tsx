import React, { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../lib/api";
import { btnPrimary } from "../lib/styles";

export default function Login() {
  useDocumentTitle("Sign In | Kiln & Leaf Ops");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(
    searchParams.get("expired") ? "Your session has expired. Please sign in again." : null,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showDemoLogins = import.meta.env.VITE_SHOW_DEMO_LOGINS !== "false";
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/tasks";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorBanner(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorBanner("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorBanner(null);
    setFieldErrors({});
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16 md:py-24">
      <div className="text-center">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Operations Portal
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Sign In</h1>
        <p className="mt-2 text-sm text-mute">
          Manage your daily roasting, cupping, and inventory tasks.
        </p>
      </div>

      {errorBanner && (
        <div
          role="alert"
          className="mt-6 rounded-card border border-accent/20 bg-accent-soft/30 p-4 text-sm text-accent"
        >
          {errorBanner}
        </div>
      )}

      {showDemoLogins && (
        <div className="mt-6 rounded-card border border-line bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-mute">
            Quick Fill Demo Credentials
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill("admin@example.com", "Admin@123")}
              className="rounded-ctl border border-line bg-paper px-3 py-2 font-medium text-ink transition hover:border-ink hover:bg-sunk text-left"
            >
              <span className="block font-semibold text-accent">Admin</span>
              admin@example.com
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("user@example.com", "User@123")}
              className="rounded-ctl border border-line bg-paper px-3 py-2 font-medium text-ink transition hover:border-ink hover:bg-sunk text-left"
            >
              <span className="block font-semibold text-ink">Regular User</span>
              user@example.com
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleDemoFill("user2@example.com", "User@1234")}
            className="mt-2 w-full rounded-ctl border border-line bg-paper px-3 py-1.5 font-medium text-mute transition hover:border-ink hover:bg-sunk text-xs text-left"
          >
            <span className="font-semibold text-ink">User 2 (Isolation Test):</span> user2@example.com
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.email ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
            placeholder="roaster@example.com"
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p id="login-email-error" className="mt-1 text-xs text-accent">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-mute">
              Password
            </label>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.password ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {fieldErrors.password && (
            <p id="login-password-error" className="mt-1 text-xs text-accent">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${btnPrimary} w-full mt-2`}
        >
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-mute">
        New team member?{" "}
        <Link to="/register" className="font-semibold text-accent underline hover:text-accent-deep">
          Register account
        </Link>
      </p>
    </div>
  );
}
