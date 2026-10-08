import { useState } from "react";
import { Link } from "react-router";
import { CartLines, Summary } from "../Layout";
import { useCart } from "../store";
import { IconBack, IconBag, StateBlock, btnPrimary } from "../ui";

export default function Cart() {
  const { lines, count } = useCart();
  const [note, setNote] = useState(false);

  if (lines.length === 0)
    return (
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <StateBlock
          icon={<IconBag width={28} height={28} />}
          title="Your cart is empty"
          action={
            <Link to="/" className={btnPrimary}>
              Continue shopping
            </Link>
          }
        >
          Nothing here yet. Our Kiln House Blend is a good place to start.
        </StateBlock>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-10 md:px-8">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-mute hover:text-ink">
        <IconBack width={16} height={16} /> Continue shopping
      </Link>
      <h1 className="mt-2 font-display text-4xl font-light tracking-tight md:text-5xl">
        Your cart <span className="text-mute">({count})</span>
      </h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
        <div className="border-t border-line">
          <CartLines />
        </div>
        <aside className="h-fit rounded-card border border-line bg-card p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-xl">Order summary</h2>
          <Summary onCheckout={() => setNote(true)} />
          {note && (
            <p role="status" className="fade mt-3 text-center text-xs text-mute">
              Checkout is a placeholder in this showcase.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
