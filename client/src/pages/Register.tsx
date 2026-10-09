import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../lib/api";
import { btnPrimary } from "../lib/styles";

export default function Register() {
  useDocumentTitle("Register Account | Kiln & Leaf Ops");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required (min 2 characters)";
    if (!email.trim()) errs.email = "Email address is required";
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      errs.password = "Password must contain at least one letter and one number";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/tasks", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorBanner(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorBanner("Registration failed. Please check your details and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16 md:py-24">
      <div className="text-center">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Operations Onboarding
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Register Account</h1>
        <p className="mt-2 text-sm text-mute">
          Join the Kiln &amp; Leaf roastery team. New accounts receive standard operator access.
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "reg-name-error" : undefined}
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.name ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
            placeholder="Kanishka Sharma"
            autoComplete="name"
          />
          {fieldErrors.name && (
            <p id="reg-name-error" className="mt-1 text-xs text-accent">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "reg-email-error" : undefined}
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.email ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
            placeholder="kanishka@kilnandleaf.com"
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p id="reg-email-error" className="mt-1 text-xs text-accent">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "reg-password-error" : "reg-password-hint"}
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.password ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          {fieldErrors.password ? (
            <p id="reg-password-error" className="mt-1 text-xs text-accent">
              {fieldErrors.password}
            </p>
          ) : (
            <p id="reg-password-hint" className="mt-1 text-xs text-mute">
              Must be 8–72 characters and contain at least one letter and one number.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${btnPrimary} w-full mt-2`}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-mute">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-accent underline hover:text-accent-deep">
          Sign in
        </Link>
      </p>
    </div>
  );
}
