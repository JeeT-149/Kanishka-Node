import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { CATEGORIES, PRODUCTS } from "../data";
import { IconArrow, IconSearch, IconX, ProductCard, SkeletonCard, StateBlock, btnGhost, btnPrimary } from "../ui";

const SORTS = [
  ["featured", "Featured"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Top rated"],
] as const;

let loadedOnce = false;

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "all";
  const sort = params.get("sort") ?? "featured";
  const demo = params.get("demo");
  const [loading, setLoading] = useState(!loadedOnce);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      loadedOnce = true;
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, [loading]);

  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    setParams(n, { replace: true });
  };

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = PRODUCTS.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!t || [p.name, p.origin ?? "", ...p.notes].join(" ").toLowerCase().includes(t)),
    );
    const s = [...list];
    if (sort === "price-asc") s.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") s.sort((a, b) => b.price - a.price);
    else if (sort === "rating") s.sort((a, b) => b.rating - a.rating);
    else s.sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99));
    return s;
  }, [q, cat, sort]);

  const filtered = q || cat !== "all";
  const clear = () => {
    const n = new URLSearchParams(params);
    ["q", "cat"].forEach((k) => n.delete(k));
    setParams(n, { replace: true });
  };
  const showLoading = loading || demo === "loading";
  const showError = failed || demo === "error";
  const catLabel = CATEGORIES.find((c) => c.id === cat)?.label;

  return (
    <>
      {/* Hero section: height reduced by ~40% so first row of products is visible on first load */}
      <section className="mx-auto grid max-w-[1280px] gap-6 px-5 pb-5 pt-6 md:grid-cols-[1.3fr_1fr] md:items-end md:px-8 md:pb-7 md:pt-8">
        <h1 className="rise font-display text-3xl font-light leading-[1.05] tracking-tight sm:text-4xl md:text-[54px] lg:text-[62px]">
          Roasted slowly.
          <br />
          <span className="italic text-accent">Steeped</span> with care.
        </h1>
        <div className="rise max-w-sm md:justify-self-end" style={{ animationDelay: "120ms" }}>
          <p className="text-sm leading-relaxed text-mute">
            Small-batch coffee and rare-leaf tea from growers we know by name, roasted every Tuesday and Friday.
          </p>
          <a href="#shop" className={`${btnPrimary} mt-4`}>
            Shop the roastery <IconArrow width={16} height={16} />
          </a>
        </div>
      </section>

      {/* Shop section: filter bar unsticky on mobile, sticky on desktop; hairline dividers aligned with grid */}
      <section id="shop" className="mx-auto max-w-[1280px] scroll-mt-20 px-5 md:px-8">
        <div className="static z-30 border-y border-line bg-[#f7f4ee] py-2.5 md:sticky md:top-16 md:bg-[#f7f4ee]/95 md:backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-0.5">
              {CATEGORIES.map((c) => {
                const on = cat === c.id;
                return (
                  <button
                    key={c.id}
                    aria-pressed={on}
                    onClick={() => set("cat", c.id === "all" ? null : c.id)}
                    className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-[0.97] ${
                      on ? "border-accent bg-accent text-white" : "border-line bg-card text-ink hover:border-ink/40"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop sort styled to match category pills */}
            <div className="hidden shrink-0 items-center gap-2.5 text-sm md:flex">
              <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-wider text-mute">
                Sort by
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
                  className="h-11 cursor-pointer appearance-none rounded-full border border-line bg-card pl-4 pr-10 text-sm font-medium text-ink outline-none transition hover:border-ink/40 focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  {SORTS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mute">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count & mobile sort bar */}
        <div className="flex items-center justify-between py-4 text-sm text-mute">
          <p role="status" className="font-medium">
            {showLoading || showError ? "\u00A0" : `${results.length} ${results.length === 1 ? "product" : "products"}`}
          </p>
          <div className="flex items-center gap-4">
            {/* Mobile sort styled as pill matching category buttons */}
            <div className="flex items-center gap-2 md:hidden">
              <label htmlFor="sort-m" className="text-xs font-semibold uppercase tracking-wider text-mute">
                Sort
              </label>
              <div className="relative">
                <select
                  id="sort-m"
                  value={sort}
                  onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
                  className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-card pl-3 pr-8 text-xs font-medium text-ink outline-none focus:border-accent"
                >
                  {SORTS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mute">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
            {filtered && !showLoading && (
              <button onClick={clear} className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-ink underline underline-offset-4 hover:text-accent">
                <IconX width={14} height={14} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {showLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : showError ? (
          <StateBlock
            icon={<IconX width={28} height={28} />}
            title="We couldn't load the shelves"
            action={
              <button
                className={btnPrimary}
                onClick={() => {
                  setFailed(false);
                  set("demo", null);
                  setLoading(true);
                }}
              >
                Try again
              </button>
            }
          >
            Something went wrong on our side while fetching products. Check your connection and give it another go.
          </StateBlock>
        ) : results.length === 0 ? (
          <StateBlock
            icon={<IconSearch width={28} height={28} />}
            title="No products match your search"
            action={
              <button className={btnPrimary} onClick={clear}>
                Clear filters
              </button>
            }
          >
            <p>
              {q && (
                <>
                  Query: <strong className="font-medium text-ink">“{q}”</strong>
                </>
              )}
              {q && cat !== "all" && " · "}
              {cat !== "all" && (
                <>
                  Category: <strong className="font-medium text-ink">{catLabel}</strong>
                </>
              )}
            </p>
            <p className="mt-2">Try a different spelling, or browse everything we roast.</p>
          </StateBlock>
        ) : (
          <div key={`${q}|${cat}|${sort}`} className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export { btnGhost };
