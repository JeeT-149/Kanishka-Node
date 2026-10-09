import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Logo } from "../common/Logo";
import { IconX } from "../common/Icons";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8">
        <Logo />

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
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? "text-accent font-semibold" : "text-mute hover:text-ink"
              }`
            }
          >
            Admin
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="inline-flex min-h-9 items-center justify-center rounded-ctl bg-accent px-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent-deep"
          >
            Sign In
          </Link>
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
          <Link
            to="/tasks"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-mute hover:text-ink"
          >
            Tasks
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-mute hover:text-ink"
          >
            Admin
          </Link>
          <div className="pt-2 border-t border-line">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-full min-h-10 items-center justify-center rounded-ctl bg-accent text-xs font-semibold uppercase tracking-wider text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
