import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ApiError } from "../lib/api";
import { btnPrimary } from "../lib/styles";
import { IconEye, IconEyeOff, IconInfo } from "../components/common/Icons";

export default function Register() {
  useDocumentTitle("Register Account | Kiln & Leaf Ops");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Live password condition checks
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const allConditionsMet = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const triggerDialogueTemporary = () => {
    setShowDialogue(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowDialogue(false);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required (min 2 characters)";
    if (!email.trim()) errs.email = "Email address is required";

    if (!password) {
      errs.password = "Password is required";
      triggerDialogueTemporary();
    } else if (!allConditionsMet) {
      errs.password = "Password must satisfy all requirement conditions";
      triggerDialogueTemporary();
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
            Full Name <span className="text-red-500">*</span>
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
            Email Address <span className="text-red-500">*</span>
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
          <div className="flex items-center justify-between">
            <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-mute">
              Password <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="relative mt-1.5">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "reg-password-error" : undefined}
              className={`block w-full rounded-ctl border pl-3.5 pr-16 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
                fieldErrors.password ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
              }`}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />

            {/* Right side controls: Notice symbol and Eye button */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1">
              {/* Notice symbol with hover/focus dialogue */}
              <div
                className="relative inline-flex items-center"
                onMouseEnter={() => setShowDialogue(true)}
                onMouseLeave={() => setShowDialogue(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowDialogue((prev) => !prev)}
                  aria-label="Password requirements"
                  aria-expanded={showDialogue}
                  className="rounded-full p-1 text-mute transition hover:bg-line/40 hover:text-ink focus:outline-none"
                >
                  <IconInfo className="h-4 w-4" />
                </button>

                {/* Dialogue box anchored to the right side above the field */}
                {showDialogue && (
                  <div
                    role="tooltip"
                    className="absolute right-0 bottom-full z-30 mb-2 w-64 rounded-card border border-line bg-card p-3.5 shadow-lg pointer-events-auto"
                    onMouseEnter={() => setShowDialogue(true)}
                    onMouseLeave={() => setShowDialogue(false)}
                  >
                    <p className="border-b border-line pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink">
                      Password Requirements
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      <li className={`transition ${hasUpper ? "font-medium text-emerald-600" : "text-mute"}`}>
                        Uppercase letter (A–Z)
                      </li>
                      <li className={`transition ${hasLower ? "font-medium text-emerald-600" : "text-mute"}`}>
                        Lowercase letter (a–z)
                      </li>
                      <li className={`transition ${hasNumber ? "font-medium text-emerald-600" : "text-mute"}`}>
                        Number (0–9)
                      </li>
                      <li className={`transition ${hasSpecial ? "font-medium text-emerald-600" : "text-mute"}`}>
                        Special character (!@#$%...)
                      </li>
                      <li className={`transition ${hasMinLen ? "font-medium text-emerald-600" : "text-mute"}`}>
                        At least 8 characters
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Eye toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="rounded-full p-1 text-mute transition hover:text-ink focus:outline-none"
              >
                {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {fieldErrors.password && (
            <p id="reg-password-error" className="mt-1 text-xs text-accent">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${btnPrimary} mt-2 w-full`}
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
