import { Link } from "react-router";
import { btnPrimary } from "../ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center px-5 py-24 text-center md:py-32">
      <p className="font-display text-[120px] font-light italic leading-none text-accent md:text-[200px]" aria-hidden>
        404
      </p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">This page has gone cold</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">
        The page you are looking for doesn&apos;t exist or has moved. Let&apos;s get you back to something freshly roasted.
      </p>
      <Link to="/" className={`${btnPrimary} mt-8`}>
        Back to the shop
      </Link>
    </div>
  );
}
