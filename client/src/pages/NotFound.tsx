import { Link } from "react-router";
import { btnPrimary } from "../lib/styles";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("404 - Page Not Found | Kiln & Leaf Ops");
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center px-5 py-24 text-center md:py-32">
      <p
        className="font-display text-[120px] font-light italic leading-none text-accent md:text-[200px]"
        aria-hidden="true"
      >
        404
      </p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">Page Not Found</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">
        The operations record or page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link to="/tasks" className={`${btnPrimary} mt-8`}>
        Back to Tasks
      </Link>
    </div>
  );
}
