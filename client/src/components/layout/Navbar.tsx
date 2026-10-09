import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../common/Logo";
import { IconX } from "../common/Icons";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8">
        <Logo />

        {user && (
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-accent font-semibold" : "text-mute hover:text-ink"
                }`
              }
            >
              Tasks
            </NavLink>
            {user.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? "text-accent font-semibold" : "text-mute hover:text-ink"
                  }`
                }
              >
                Admin Console
              </NavLink>
            )}
          </nav>
        )}

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold text-ink">{user.name}</p>
                <span
                  className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    user.role === "admin"
                      ? "bg-accent/15 text-accent"
                      : "bg-ink/10 text-mute"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-8 items-center justify-center rounded-ctl border border-line px-3 text-xs font-medium text-mute transition hover:border-ink hover:text-ink hover:bg-sunk"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-9 items-center justify-center rounded-ctl bg-accent px-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent-deep"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="grid size-10 place-items-center rounded-full hover:bg-sunk md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <IconX />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-line px-5 py-4 space-y-3 md:hidden bg-paper">
          {user ? (
            <>
              <div className="pb-3 border-b border-line flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{user.name}</p>
                  <p className="text-xs text-mute">{user.email}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    user.role === "admin"
                      ? "bg-accent/15 text-accent"
                      : "bg-ink/10 text-mute"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <Link
                to="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm font-medium text-mute hover:text-ink"
              >
                Tasks
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-medium text-mute hover:text-ink"
                >
                  Admin Console
                </Link>
              )}
              <div className="pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-1.5 text-xs font-semibold text-accent"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-full min-h-10 items-center justify-center rounded-ctl bg-accent text-xs font-semibold uppercase tracking-wider text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
