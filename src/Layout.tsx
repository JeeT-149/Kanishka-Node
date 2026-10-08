import { useEffect, useRef, useState } from "react";
import { Link, Outlet, ScrollRestoration, useLocation, useNavigate, useSearchParams } from "react-router";
import { byId, money, toMinor, formatMinor } from "./data";
import { useCart } from "./store";
import { IconArrow, IconBag, IconSearch, IconTrash, IconX, Img, Logo, Qty, StateBlock, btnGhost, btnPrimary } from "./ui";

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lines, setQty, remove, setDrawer } = useCart();
  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => {
        const p = byId(l.id)!;
        return (
          <li key={l.id} className="rise flex gap-4 py-5">
            <Link to={`/product/${p.id}`} onClick={() => setDrawer(false)} className="shrink-0">
              <Img
                src={p.images[0]}
                alt={p.name}
                className={`${compact ? "size-20" : "size-24 sm:size-28"} rounded-lg bg-sunk object-cover`}
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/product/${p.id}`} onClick={() => setDrawer(false)} className="line-clamp-2 font-display text-base leading-snug hover:text-accent">
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-mute">
                    {p.weight} · {money(p.price)} each
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">{formatMinor(toMinor(p.price) * l.qty)}</span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <Qty size="sm" value={l.qty} onChange={(n) => setQty(l.id, n)} label={p.name} />
                <button
                  onClick={() => remove(l.id)}
                  aria-label={`Remove ${p.name} from cart`}
                  className="grid size-11 place-items-center rounded-full text-mute transition hover:bg-sunk hover:text-accent"
                >
                  <IconTrash width={18} height={18} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Summary({ onCheckout }: { onCheckout?: () => void }) {
  const { count, subtotal } = useCart();
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-mute">Items</dt>
        <dd className="tabular-nums">{count}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-mute">Subtotal</dt>
        <dd className="tabular-nums">{money(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-mute">Shipping</dt>
        <dd className="text-mute">{subtotal >= 40 ? "Free" : "Calculated at checkout"}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
        <dt>Total</dt>
        <dd className="tabular-nums">{money(subtotal)}</dd>
      </div>
      <button className={`${btnPrimary} mt-4 w-full`} onClick={onCheckout}>
        Checkout
      </button>
    </dl>
  );
}

function CartDrawer() {
  const { drawer, setDrawer, lines, count } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [note, setNote] = useState(false);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer, setDrawer]);

  return (
    <div className={`fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
      <div
        onClick={() => setDrawer(false)}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${drawer ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        inert={!drawer}
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-paper shadow-soft transition-transform duration-300 ease-out sm:w-[440px] ${
          drawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-2xl">
            Your cart <span className="text-base text-mute">({count})</span>
          </h2>
          <button ref={closeRef} onClick={() => setDrawer(false)} aria-label="Close cart" className="grid size-11 place-items-center rounded-full hover:bg-sunk">
            <IconX />
          </button>
        </header>
        {lines.length === 0 ? (
          <div className="flex-1 overflow-auto">
            <StateBlock
              icon={<IconBag width={28} height={28} />}
              title="Your cart is empty"
              action={
                <button
                  className={btnPrimary}
                  onClick={() => {
                    setDrawer(false);
                    navigate("/");
                  }}
                >
                  Continue shopping
                </button>
              }
            >
              Nothing here yet. Fresh roasts ship within 48 hours.
            </StateBlock>
          </div>
        ) : (
          <>
            <div className="no-scrollbar flex-1 overflow-auto px-6">
              <CartLines compact />
            </div>
            <footer className="border-t border-line bg-card px-6 py-5">
              <Summary onCheckout={() => setNote(true)} />
              {note && (
                <p role="status" className="fade mt-3 text-center text-xs text-mute">
                  Checkout is a placeholder in this showcase.
                </p>
              )}
              <Link
                to="/cart"
                onClick={() => setDrawer(false)}
                className="mt-3 flex min-h-11 items-center justify-center gap-1.5 text-sm text-mute underline-offset-4 hover:text-ink hover:underline"
              >
                View full cart <IconArrow width={14} height={14} />
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Navbar() {
  const { count, setDrawer, bump } = useCart();
  const [params, setParams] = useSearchParams();
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileRef = useRef<HTMLInputElement>(null);
  const onHome = loc.pathname === "/";
  const q = onHome ? (params.get("q") ?? "") : "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const setQ = (v: string) => {
    if (onHome) {
      const n = new URLSearchParams(params);
      v ? n.set("q", v) : n.delete("q");
      setParams(n, { replace: true });
    } else if (v) {
      navigate(`/?q=${encodeURIComponent(v)}`);
    }
  };

  useEffect(() => {
    if (open) mobileRef.current?.focus();
  }, [open]);

  const field = (ref?: React.Ref<HTMLInputElement>, id = "search") => (
    <div role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" width={18} height={18} />
      <input
        id={id}
        ref={ref}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search beans, teas, gear"
        className="h-11 w-full rounded-full border border-line bg-card pl-10 pr-10 text-sm outline-none transition placeholder:text-mute focus:border-accent focus:ring-2 focus:ring-accent/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-sunk hover:text-ink">
          <IconX width={16} height={16} />
        </button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#f7f4ee]/95 backdrop-blur-md transition-all duration-200">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <div className={`mx-auto flex ${scrolled ? "h-16" : "h-16 md:h-20"} max-w-[1280px] items-center gap-4 px-5 transition-[height] duration-200 md:px-8`}>
        <Logo className="md:w-48" />
        <div className="mx-auto hidden w-full max-w-md md:block">{field()}</div>
        <div className="ml-auto flex items-center gap-1 md:ml-0 md:w-48 md:justify-end">
          <button
            className="grid size-11 place-items-center rounded-full hover:bg-sunk md:hidden"
            aria-label={open ? "Close search" : "Open search"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconX /> : <IconSearch />}
          </button>
          <button
            onClick={() => setDrawer(true)}
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative grid size-11 place-items-center rounded-full hover:bg-sunk"
          >
            <IconBag />
            {count > 0 && (
              <span
                key={bump}
                className="pop absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-[18px] text-white"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      {open && <div className="fade border-t border-line px-5 py-3 md:hidden">{field(mobileRef, "search-m")}</div>}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-mute">Small-batch coffee and tea, roasted and blended in Leeds since 2016.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {[
            ["Shop", "/"],
            ["Cart", "/cart"],
            ["Shipping & returns", "/nope-shipping"],
            ["Contact", "/nope-contact"],
          ].map(([l, to]) => (
            <Link key={l} to={to} className="flex min-h-8 items-center text-mute hover:text-ink">
              {l}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-line px-5 py-5 text-xs text-mute md:px-8">
        © 2026 Kiln &amp; Leaf Roasters Ltd. A fictional shop for design showcase purposes.
      </div>
    </footer>
  );
}

export default function Layout() {
  const loc = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" key={loc.pathname} className="fade flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ScrollRestoration />
    </div>
  );
}

export { btnGhost };
