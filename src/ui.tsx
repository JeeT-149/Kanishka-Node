import { useState, type ReactNode, type SVGProps } from "react";
import { Link } from "react-router";
import { categoryLabel, money, type Product } from "./data";
import { useCart } from "./store";

export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-ctl bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-mute";
export const btnGhost =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-ctl border border-ink/20 px-5 text-sm font-medium transition hover:border-ink hover:bg-sunk active:scale-[0.98]";

type P = SVGProps<SVGSVGElement>;
const Svg = (p: P) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  />
);
export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);
export const IconBag = (p: P) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Svg>
);
export const IconX = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconMinus = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const IconArrow = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IconBack = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);
export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);
export const IconImage = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m21 16-5-5-9 9" />
  </Svg>
);

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" aria-label="Kiln & Leaf, home" className={`flex items-center gap-2 ${className}`}>
      <span aria-hidden className="grid size-7 place-items-center rounded-full bg-ink font-display text-sm text-paper">
        K
      </span>
      <span className="font-display text-xl tracking-tight">
        Kiln <span className="italic text-accent">&amp;</span> Leaf
      </span>
    </Link>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-mute" aria-label={`Rated ${rating} out of 5`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#161412" aria-hidden>
        <path d="m12 2.5 2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9L12 2.5Z" />
      </svg>
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
      {count !== undefined && <span>({count})</span>}
    </span>
  );
}

export function Img({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [bad, setBad] = useState(false);
  if (bad)
    return (
      <div
        role="img"
        aria-label={`${alt} (image unavailable)`}
        className={`flex flex-col items-center justify-center gap-2 bg-sunk text-mute ${className}`}
      >
        <IconImage width={28} height={28} />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className={className} />;
}

export function Qty({
  value,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const b =
    "grid place-items-center transition hover:bg-sunk active:bg-line disabled:text-mute/40 disabled:hover:bg-transparent " +
    (size === "sm" ? "size-9" : "size-11");
  return (
    <div role="group" aria-label={`Quantity for ${label}`} className="inline-flex items-center rounded-ctl border border-ink/20">
      <button className={`${b} rounded-l-[7px]`} disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label={`Decrease quantity of ${label}`}>
        <IconMinus width={16} height={16} />
      </button>
      <span key={value} aria-live="polite" className="fade min-w-8 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button className={`${b} rounded-r-[7px]`} disabled={value >= 20} onClick={() => onChange(value + 1)} aria-label={`Increase quantity of ${label}`}>
        <IconPlus width={16} height={16} />
      </button>
    </div>
  );
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const meta = [p.origin ?? categoryLabel(p.category), p.weight].join(" · ");

  const handleAdd = () => {
    add(p.id);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <article className="rise group relative flex flex-col" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <Link
        to={`/product/${p.id}`}
        aria-label={`${p.name}, ${money(p.price)}`}
        className="absolute inset-0 z-10 rounded-card focus-visible:outline-2"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-sunk">
        <Img
          src={p.images[0]}
          alt={`${p.name}, ${p.weight}`}
          className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        {p.rating < 4.1 && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-medium text-mute shadow-2xs">
            Acquired taste
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {/* Product title matching design */}
        <h3 className="line-clamp-2 min-h-[2.6em] font-display text-[17px] leading-snug">
          {p.name}
        </h3>
        {/* Tightened origin/weight line */}
        <p className="mt-0.5 truncate text-xs text-mute">{meta}</p>

        {/* Rating and price row */}
        <div className="mt-3 flex items-center justify-between">
          <Stars rating={p.rating} count={p.reviews} />
          <span className="text-sm font-medium tabular-nums">{money(p.price)}</span>
        </div>

        {/* Full-width Add to cart button matching design with Added ✓ state */}
        <button
          onClick={handleAdd}
          className={`relative z-20 mt-4 min-h-11 w-full rounded-ctl border text-sm font-medium transition active:scale-[0.98] ${
            done
              ? "border-accent bg-accent text-white"
              : "border-ink/20 hover:border-accent hover:bg-accent hover:text-white"
          }`}
          aria-label={`Add ${p.name} to cart`}
        >
          <span className="inline-flex items-center gap-2" aria-live="polite">
            {done ? (
              <>
                <IconCheck width={16} height={16} /> Added ✓
              </>
            ) : (
              "Add to cart"
            )}
          </span>
        </button>
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-[4/5] rounded-card" />
      <div className="skeleton mt-4 h-4 w-3/4" />
      <div className="skeleton mt-2 h-3 w-1/2" />
      <div className="skeleton mt-4 h-11 w-full rounded-ctl" />
    </div>
  );
}

export function StateBlock({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="fade mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="mb-6 grid size-16 place-items-center rounded-full bg-sunk text-accent">{icon}</div>
      <h2 className="font-display text-3xl leading-tight">{title}</h2>
      {children && <div className="mt-3 text-sm leading-relaxed text-mute">{children}</div>}
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
