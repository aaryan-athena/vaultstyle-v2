import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { amazonUrl, myntraUrl, makerUrl, makerLinkIsSearch } from "@/lib/shop-links";
import { getMakerPicks, hasHomegrownCoverage } from "@/lib/maker-picks";
import { PRICE_BAND_LABEL } from "@/lib/makers-data";
import { getLuxuryFor, LUXURY_TIER_LABEL } from "@/lib/luxury-data";
import { categorize } from "@/lib/accessory-category";
import { getVibeClothing, type ClothingItem } from "@/lib/clothing-data";

/** Compact outlined pill for dense spots (card footers, the where-to-buy panel). */
const XS_PILL =
  "inline-flex items-center justify-center h-7 px-3 rounded-full border border-border bg-card text-xs font-medium text-foreground/80 whitespace-nowrap transition hover:border-foreground/30 hover:text-foreground";

/** Amazon + Myntra deep-link buttons for a search query. */
export function ShopButtons({ query, size = "sm" }: { query: string; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? XS_PILL : "btn btn-secondary btn-sm";
  return (
    <span className="inline-flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
      <a
        href={amazonUrl(query)}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        Amazon ↗
      </a>
      <a
        href={myntraUrl(query)}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        Myntra ↗
      </a>
    </span>
  );
}

/**
 * The one-line maker credit shown under a piece's name.
 *
 * This slot used to print an invented exemplar ("Rolex · Datejust 41"). It now
 * names the lead homegrown maker for the piece and where they work — real, and
 * visible without needing a click, since surfacing these labels is the point.
 */
export function MakerLine({ accessory }: { accessory: string }) {
  const [lead] = getMakerPicks(accessory, 1);

  if (!lead) {
    return (
      <span className="text-xs text-muted-foreground">Marketplace piece</span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      <span className="text-foreground font-medium">{lead.maker.name}</span>
      {lead.maker.city && <span> · {lead.maker.city}</span>}
    </span>
  );
}

/**
 * Where to actually buy a piece, in three tiers.
 *
 * Order is the product position, not an implementation detail: homegrown
 * makers first and open by default, then the luxury reference points, then a
 * plain marketplace search. Shoppers arrive with all three intents — "support
 * someone small", "something like a Cartier", "just show me Amazon" — and
 * answering only the first was sending the other two away.
 *
 * Prices everywhere are bands, never per-product claims. The seller's own page
 * is the only place a price is true.
 */
export function ProductPicker({ accessory, defaultOpen = false }: { accessory: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const picks = getMakerPicks(accessory);
  const luxury = getLuxuryFor(categorize(accessory));
  const marketQuery = `${accessory.toLowerCase()} men`;
  const homegrown = hasHomegrownCoverage(accessory);

  return (
    <div className="mt-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="text-sm font-medium text-gold underline-offset-4 hover:underline"
      >
        {/* Short enough to stay on one line. The maker count used to be in
            here, which wrapped this to two lines under every single card —
            the count is visible the moment the panel opens. */}
        {open ? "Hide −" : "Where to buy +"}
      </button>

      {open && (
        <div className="mt-3 surface-muted p-4 space-y-4">
          {/* Tier 1 — homegrown. The point of the platform, so it leads. */}
          {picks.length > 0 ? (
            <section>
              <header className="text-xs font-semibold text-gold mb-2">Homegrown</header>
              <ul className="space-y-2">
                {picks.map(({ maker, reason, query }) => (
                  <li key={maker.id} className="rounded-xl bg-card p-3">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-foreground">{maker.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {PRICE_BAND_LABEL[maker.priceBand]}
                      </span>
                    </div>
                    {maker.city && <div className="text-xs text-muted-foreground mt-0.5">{maker.city}</div>}
                    {reason && (
                      <p className="text-[13px] text-muted-foreground leading-snug mt-1.5">{reason}</p>
                    )}
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      <a
                        href={makerUrl(maker, query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={XS_PILL}
                      >
                        {makerLinkIsSearch(maker) ? "Shop their range ↗" : "Visit the label ↗"}
                      </a>
                      <Link
                        to="/makers"
                        hash={`maker-${maker.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium text-muted-foreground hover:text-gold transition"
                      >
                        Their story
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            !homegrown && (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                No independent Indian maker builds this one — the options below are the honest ones.
              </p>
            )
          )}

          {/* Tier 2 — luxury reference points. Homepages only: these houses
              block automated checks, so a guessed deep link can't be verified. */}
          {luxury.length > 0 && (
            <section>
              <header className="text-xs font-semibold text-foreground mb-2">Luxury</header>
              <ul className="space-y-2">
                {luxury.map((b) => (
                  <li key={b.id} className="rounded-xl bg-card p-3">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-foreground">
                        {b.name}
                        {b.origin === "india" && <span className="tag tag-gold ml-1.5">Indian</span>}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {LUXURY_TIER_LABEL[b.tier]}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-snug mt-1.5">{b.blurb}</p>
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <a
                        href={b.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={XS_PILL}
                      >
                        Official site ↗
                      </a>
                      {b.onMarketplace && (
                        <a
                          href={amazonUrl(`${b.name} ${marketQuery}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={XS_PILL}
                        >
                          On Amazon ↗
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tier 3 — the marketplace search people would have run anyway. */}
          <section>
            <header className="text-xs font-semibold text-foreground mb-1.5">Marketplace</header>
            <p className="text-[13px] text-muted-foreground leading-snug mb-2.5">
              A plain search for “{accessory.toLowerCase()}”, if you'd rather buy where you already have an account.
            </p>
            <ShopButtons query={marketQuery} size="xs" />
          </section>
        </div>
      )}
    </div>
  );
}

/** The clothing layer for a vibe — key garments, each shoppable. Pass `items` directly for blended/custom vibes. */
export function ClothingRail({
  vibe,
  heading = "Complete the fit",
  items: itemsProp,
}: {
  vibe: string;
  heading?: string;
  items?: ClothingItem[];
}) {
  const items = itemsProp ?? getVibeClothing(vibe);
  if (items.length === 0) return null;

  return (
    <div>
      <div className="eyebrow mb-4">{heading}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((c) => (
          <figure key={c.item} className="group surface surface-hover overflow-hidden">
            <div className="aspect-square bg-muted overflow-hidden">
              {c.image && (
                <img
                  src={c.image}
                  alt={c.item}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <figcaption className="p-3.5 space-y-2.5">
              <div className="text-sm font-medium leading-snug">{c.item}</div>
              <ShopButtons query={c.query} size="xs" />
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
