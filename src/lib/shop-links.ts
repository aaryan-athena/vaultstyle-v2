// Outbound links.
//
// The platform's default used to be a pre-filled Amazon or Myntra search. That
// made sense when the catalog named global brands; it doesn't now. A homegrown
// maker's own storefront is where their full range, real stock and real price
// live — and sending buyers there is the entire social point of the pivot, since
// a marketplace sale earns the maker less and teaches the buyer nothing about
// who made the piece.
//
// So: maker storefronts are primary. The marketplace builders survive only as
// a labelled last resort for categories no maker on the roster covers.

import type { Maker } from "./makers-data";

/**
 * Storefronts that answer Shopify's `/search?q=` route. Verified by hand — the
 * rest 404 on it, so they get a homepage link instead of a broken search page.
 * Re-check with a HEAD request before adding an id here.
 */
const NO_STORE_SEARCH = new Set(["misho", "dhora", "shop-lune"]);

/** Deep-link into a maker's own store for a piece, falling back to their homepage. */
export function makerUrl(maker: Maker, query?: string): string {
  if (!query || NO_STORE_SEARCH.has(maker.id)) return maker.site;
  const base = maker.site.endsWith("/") ? maker.site.slice(0, -1) : maker.site;
  return `${base}/search?q=${encodeURIComponent(query)}`;
}

/** True when the link will land on a filtered result rather than the front page. */
export const makerLinkIsSearch = (maker: Maker) => !NO_STORE_SEARCH.has(maker.id);

// ── Marketplace fallbacks ────────────────────────────────────────────────
// Kept for the handful of categories the roster can't serve (a smartwatch is
// not something an independent Indian jeweller makes). Label these clearly in
// the UI as leaving the homegrown roster.

export const amazonUrl = (query: string) =>
  `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

export const myntraUrl = (query: string) =>
  `https://www.myntra.com/${query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")}?rawQuery=${encodeURIComponent(query)}`;
