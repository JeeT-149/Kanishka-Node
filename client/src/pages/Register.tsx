import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../lib/api";
import { btnPrimary } from "../lib/styles";
import { IconEye, IconEyeOff } from "../components/common/Icons";

export default function Register() {
  useDocumentTitle("Register Account | Kiln & Leaf Ops");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password condition checks
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const allConditionsMet = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required (min 2 characters)";
    if (!email.trim()) errs.email = "Email address is required";
    if (!password) {
      errs.password = "Password is required";
    } else if (!hasMinLen) {
      errs.password = "Password must be at least 8 characters long";
    } else if (!hasUpper) {
      errs.password = "Password must contain at least one uppercase letter (A–Z)";
    } else if (!hasLower) {
      errs.password = "Password must contain at least one lowercase letter (a–z)";
    } else if (!hasNumber) {
      errs.password = "Password must contain at least one number (0–9)";
    } else if (!hasSpecial) {
      errs.password = "Password must contain at least one special character (!@#$%...)";
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
    <div className="mx-auto flex max-w-xl md:max-w-2xl flex-col px-5 py-16 md:py-24">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-7">
            <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-mute">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby="reg-password-hint-box"
                className={`block w-full rounded-ctl border pl-3.5 pr-10 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
                  fieldErrors.password ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
                }`}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-mute hover:text-ink transition focus:outline-none"
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="reg-password-error" className="mt-1 text-xs text-accent">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Dynamic real-time hint panel beside the password field */}
          <div
            id="reg-password-hint-box"
            className={`md:col-span-5 rounded-ctl border p-3 text-xs transition md:mt-6 ${
              password.length === 0
                ? "border-line bg-card/60 text-mute"
                : allConditionsMet
                  ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-900"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-900"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-current/10">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Requirements
              </span>
              <span
                className={`font-semibold text-[10px] px-1.5 py-0.5 rounded tracking-wide ${
                  password.length === 0
                    ? "bg-paper text-mute border border-line"
                    : allConditionsMet
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                }`}
              >
                {password.length === 0
                  ? "Pending"
                  : allConditionsMet
                    ? "All Met ✓"
                    : "Not Met ✕"}
              </span>
            </div>

            <ul className="mt-2 space-y-1 text-[11px]">
              <li className={`flex items-center gap-1.5 transition ${hasUpper ? "text-emerald-700 font-medium" : "text-mute"}`}>
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] ${hasUpper ? "bg-emerald-600 text-white" : "bg-paper border border-line text-mute"}`}>
                  {hasUpper ? "✓" : "•"}
                </span>
                Uppercase letter (A–Z)
              </li>
              <li className={`flex items-center gap-1.5 transition ${hasLower ? "text-emerald-700 font-medium" : "text-mute"}`}>
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] ${hasLower ? "bg-emerald-600 text-white" : "bg-paper border border-line text-mute"}`}>
                  {hasLower ? "✓" : "•"}
                </span>
                Lowercase letter (a–z)
              </li>
              <li className={`flex items-center gap-1.5 transition ${hasNumber ? "text-emerald-700 font-medium" : "text-mute"}`}>
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] ${hasNumber ? "bg-emerald-600 text-white" : "bg-paper border border-line text-mute"}`}>
                  {hasNumber ? "✓" : "•"}
                </span>
                Number (0–9)
              </li>
              <li className={`flex items-center gap-1.5 transition ${hasSpecial ? "text-emerald-700 font-medium" : "text-mute"}`}>
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] ${hasSpecial ? "bg-emerald-600 text-white" : "bg-paper border border-line text-mute"}`}>
                  {hasSpecial ? "✓" : "•"}
                </span>
                Special character (!@#$...)
              </li>
              <li className={`flex items-center gap-1.5 transition ${hasMinLen ? "text-emerald-700 font-medium" : "text-mute"}`}>
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] ${hasMinLen ? "bg-emerald-600 text-white" : "bg-paper border border-line text-mute"}`}>
                  {hasMinLen ? "✓" : "•"}
                </span>
                At least 8 characters
              </li>
            </ul>
          </div>
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
