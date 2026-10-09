import { Link } from "react-router";
import { Logo } from "../common/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-mute">
            Operations &amp; Task Management Portal for Kiln &amp; Leaf Roasters.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {[
            ["Tasks", "/tasks"],
            ["New Task", "/tasks/new"],
            ["Admin Console", "/admin"],
          ].map(([label, href]) => (
            <Link
              key={label}
              to={href}
              className="flex min-h-8 items-center text-mute hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-line px-5 py-5 text-xs text-mute md:px-8">
        © 2026 Kiln &amp; Leaf Roasters Ltd. Ops Management System.
      </div>
    </footer>
  );
}
