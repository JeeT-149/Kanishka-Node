import { Link } from "react-router";
import { btnGhost } from "../ui";

const colors = [
  ["Paper", "#F7F4EE", "Page background"],
  ["Card", "#FBFAF6", "Inputs, summary panels"],
  ["Sunk", "#EFEAE0", "Image wells, skeletons"],
  ["Line", "#E2DCD0", "1px hairlines"],
  ["Mute", "#6B645B", "Metadata (5.2:1 on paper)"],
  ["Ink", "#161412", "Text (16:1 on paper)"],
  ["Accent", "#8C3A14", "CTAs, active pills, cart badge (7:1 with white)"],
  ["Accent deep", "#6F2D0F", "Hover / pressed"],
];

function Wire({ label, children, mobile }: { label: string; children: React.ReactNode; mobile?: boolean }) {
  return (
    <figure className="shrink-0">
      <div className={`overflow-hidden rounded-lg border border-neutral-400 bg-neutral-100 p-3 ${mobile ? "h-[360px] w-[190px]" : "h-[260px] w-[400px]"}`}>{children}</div>
      <figcaption className="mt-2 text-xs text-mute">{label}</figcaption>
    </figure>
  );
}
const B = ({ c = "" }: { c?: string }) => <div className={`rounded-sm bg-neutral-300 ${c}`} />;

export default function Design() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-8">
      <h1 className="font-display text-5xl font-light tracking-tight">Design notes</h1>
      <p className="mt-3 max-w-xl text-mute">Wireframes, state previews and the token summary for Kiln &amp; Leaf. Rebrand by editing the tokens in <code>src/index.css</code> and the content in <code>src/data.ts</code>.</p>

      <h2 className="mt-14 border-b border-line pb-3 font-display text-2xl">1 · Grayscale wireframes</h2>
      <div className="no-scrollbar mt-6 flex gap-6 overflow-x-auto pb-2">
        <Wire label="Listing, desktop">
          <div className="flex h-full flex-col gap-2">
            <div className="flex items-center gap-2"><B c="h-4 w-16" /><B c="mx-auto h-4 w-32" /><B c="h-4 w-4" /></div>
            <B c="h-14 w-full" />
            <div className="flex gap-1"><B c="h-4 w-10" /><B c="h-4 w-16" /><B c="h-4 w-12" /></div>
            <div className="grid flex-1 grid-cols-4 gap-2">{Array.from({ length: 8 }).map((_, i) => <B key={i} />)}</div>
          </div>
        </Wire>
        <Wire label="Listing, mobile" mobile>
          <div className="flex h-full flex-col gap-2">
            <div className="flex justify-between"><B c="h-4 w-14" /><B c="h-4 w-10" /></div>
            <B c="h-16 w-full" />
            <div className="flex gap-1 overflow-hidden"><B c="h-4 w-10 shrink-0" /><B c="h-4 w-16 shrink-0" /><B c="h-4 w-12 shrink-0" /></div>
            <div className="grid flex-1 grid-cols-2 gap-2">{Array.from({ length: 4 }).map((_, i) => <B key={i} />)}</div>
          </div>
        </Wire>
        <Wire label="Product, desktop">
          <div className="grid h-full grid-cols-2 gap-3"><B /><div className="space-y-2"><B c="h-3 w-24" /><B c="h-8 w-full" /><B c="h-3 w-16" /><B c="h-16 w-full" /><B c="h-8 w-full" /></div></div>
        </Wire>
        <Wire label="Product, mobile" mobile>
          <div className="flex h-full flex-col gap-2"><B c="h-40 w-full" /><B c="h-5 w-4/5" /><B c="h-3 w-1/3" /><B c="h-14 w-full" /><div className="mt-auto"><B c="h-9 w-full" /></div></div>
        </Wire>
        <Wire label="Cart drawer, desktop">
          <div className="flex h-full justify-end"><div className="flex w-40 flex-col gap-2 border-l border-neutral-400 pl-2">{[0, 1].map((i) => <div key={i} className="flex gap-1"><B c="size-10" /><B c="h-10 flex-1" /></div>)}<div className="mt-auto space-y-1"><B c="h-3 w-full" /><B c="h-7 w-full" /></div></div></div>
        </Wire>
        <Wire label="Cart sheet, mobile" mobile>
          <div className="flex h-full flex-col gap-2">{[0, 1].map((i) => <div key={i} className="flex gap-1"><B c="size-12" /><B c="h-12 flex-1" /></div>)}<div className="mt-auto space-y-1"><B c="h-3 w-full" /><B c="h-8 w-full" /></div></div>
        </Wire>
        <Wire label="Empty results">
          <div className="grid h-full place-items-center"><div className="flex flex-col items-center gap-2"><B c="size-10 rounded-full" /><B c="h-4 w-40" /><B c="h-3 w-28" /><B c="h-7 w-24" /></div></div>
        </Wire>
      </div>

      <h2 className="mt-14 border-b border-line pb-3 font-display text-2xl">2 · State screens</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className={btnGhost} to="/?demo=loading">Listing loading</Link>
        <Link className={btnGhost} to="/?demo=error">Listing error</Link>
        <Link className={btnGhost} to="/?q=ethiopian+decaf+espresso&cat=tea">Empty results</Link>
        <Link className={btnGhost} to="/product/does-not-exist">Product not found</Link>
        <Link className={btnGhost} to="/product/darjeeling-first-flush">Detail (skeleton on entry)</Link>
        <Link className={btnGhost} to="/nope">404</Link>
        <Link className={btnGhost} to="/cart">Cart page</Link>
      </div>
      <p className="mt-3 text-sm text-mute">Edge cases in data: very long name (Winter Reserve gift box), low rating (Sumatra, 3.8), missing field (Genmaicha has no origin or brew).</p>

      <h2 className="mt-14 border-b border-line pb-3 font-display text-2xl">3 · Tokens</h2>
      <div className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {colors.map(([n, h, u]) => (
          <div key={n} className="flex items-center gap-3">
            <span className="size-12 shrink-0 rounded-lg border border-line" style={{ background: h }} />
            <div className="text-sm"><div className="font-medium">{n} <span className="font-normal text-mute">{h}</span></div><div className="text-xs text-mute">{u}</div></div>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-xs uppercase tracking-[0.14em] text-mute">Type</h3>
          <p className="mt-3 font-display text-5xl font-light">Fraunces <span className="italic text-accent">Light</span></p>
          <p className="mt-1 text-sm text-mute">Display, headings. DM Sans 400/500/600 for UI and body.</p>
          <p className="mt-4 text-sm text-mute">Scale: 11 · 12 · 14 · 15 · 17 · 24 · 30 · 36 · 48 · 76px. Metadata 12px in Mute; hero 44px mobile, 76px desktop.</p>
        </div>
        <ul className="space-y-2 text-sm">
          <li><span className="text-mute">Spacing</span> 4 · 8 · 12 · 16 · 24 · 32 · 40 · 64 · 96px (Tailwind 4px base)</li>
          <li><span className="text-mute">Radii</span> 8px controls · 12px cards and images · full for pills and badges</li>
          <li><span className="text-mute">Shadow</span> none by default; drawer only, 0 12px 40px -16px rgb(22 20 18 / 20%)</li>
          <li><span className="text-mute">Borders</span> 1px Line hairlines; ink at 20% for outlined buttons</li>
          <li><span className="text-mute">Motion</span> 300 to 500ms ease-out; 700ms image zoom; all disabled under reduced motion</li>
          <li><span className="text-mute">Tap targets</span> 44px minimum</li>
        </ul>
      </div>
    </div>
  );
}
