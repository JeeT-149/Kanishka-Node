import { Link } from "react-router";
import { btnPrimary } from "../lib/styles";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Forbidden() {
  useDocumentTitle("403 - Access Denied | Kiln & Leaf Ops");

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center px-5 py-24 text-center md:py-32">
      <span className="font-mono text-sm font-semibold uppercase tracking-widest text-accent">
        Error 403
      </span>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
        Restricted Operational Zone
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
        You do not possess the required administrator credentials to access this console.
        Task status alterations and management analytics are reserved for administrative staff.
      </p>
      <Link to="/tasks" className={`${btnPrimary} mt-8`}>
        Return to My Tasks
      </Link>
    </div>
  );
}
