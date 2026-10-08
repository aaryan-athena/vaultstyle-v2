// The luxury and premium tier — deliberately secondary.
//
// The platform's position is still homegrown-first: small Indian labels lead
// every recommendation, because they're the ones who can't buy attention. But
// "homegrown only" turned out to be the wrong shape for real shoppers, who
// arrive with a reference point ("something like a Cartier Love") or a
// marketplace habit, and were being told that need didn't exist here.
//
// So this file adds the reference tier. It sits under the makers in the UI,
// never above them.
//
// A NOTE ON VERIFICATION, WHICH DIFFERS FROM makers-data.ts
// Every maker site in makers-data.ts was fetched and confirmed live. These
// domains could NOT be checked the same way: luxury houses block datacenter
// and headless traffic outright (Cartier, Rolex, Tiffany and Tanishq all
// return "Access Denied" to an automated request while being perfectly fine in
// a real browser). What's stored here are the canonical official domains, and
// only homepages — no guessed search paths, since an unverifiable deep link is
// how you ship a 404.

import type { PieceCat } from "./accessory-category";

export type LuxuryTier = "premium" | "fine";

export const LUXURY_TIER_LABEL: Record<LuxuryTier, string> = {
  premium: "₹15,000 – ₹80,000",
  fine: "₹1,00,000 +",
};

export type LuxuryBrand = {
  id: string;
  name: string;
  /** Indian houses are called out, since the platform's centre of gravity is India. */
  origin: "india" | "global";
  site: string;
  makes: PieceCat[];
  tier: LuxuryTier;
  /** One line on what they're actually the reference for. */
  blurb: string;
  /**
   * Whether Indian marketplaces genuinely stock the brand. Only these get a
   * brand-scoped marketplace search; for the rest that search returns
   * counterfeits and "inspired by" listings, which is worse than no link.
   */
  onMarketplace: boolean;
};

export const LUXURY_BRANDS: LuxuryBrand[] = [
  // ── Watches ──────────────────────────────────────────────────────────
  {
    id: "rolex",
    name: "Rolex",
    origin: "global",
    site: "https://www.rolex.com/",
    makes: ["Watch"],
    tier: "fine",
    blurb: "The default reference for a status watch, and the one most others are measured against.",
    onMarketplace: false,
  },
  {
    id: "omega",
    name: "Omega",
    origin: "global",
    site: "https://www.omegawatches.com/",
    makes: ["Watch"],
    tier: "fine",
    blurb: "Swiss mechanicals with more range than Rolex at the entry end — Seamaster and Speedmaster.",
    onMarketplace: false,
  },
  {
    id: "tag-heuer",
    name: "TAG Heuer",
    origin: "global",
    site: "https://www.tagheuer.com/in/en/",
    makes: ["Watch"],
    tier: "fine",
    blurb: "Sports chronographs — the usual first Swiss watch, and widely stocked in India.",
    onMarketplace: false,
  },
  {
    id: "tissot",
    name: "Tissot",
    origin: "global",
    site: "https://www.tissotwatches.com/",
    makes: ["Watch"],
    tier: "premium",
    blurb: "The sensible entry to Swiss watchmaking; the PRX is the one everyone means.",
    onMarketplace: true,
  },
  {
    id: "montblanc",
    name: "Montblanc",
    origin: "global",
    site: "https://www.montblanc.com/",
    makes: ["Watch", "Other", "Bracelet"],
    tier: "fine",
    blurb: "Watches, leather and the cufflinks most often given as a formal gift.",
    onMarketplace: false,
  },
  {
    id: "titan",
    name: "Titan",
    origin: "india",
    site: "https://www.titan.co.in/",
    makes: ["Watch"],
    tier: "premium",
    blurb: "India's own watchmaker at scale — the Edge and Nebula lines sit well above their price.",
    onMarketplace: true,
  },
  {
    id: "fossil",
    name: "Fossil",
    origin: "global",
    site: "https://www.fossil.in/",
    makes: ["Watch", "Bracelet"],
    tier: "premium",
    blurb: "Accessible premium, and the easiest place to find a bracelet-and-watch pairing.",
    onMarketplace: true,
  },

  // ── Fine jewellery ───────────────────────────────────────────────────
  {
    id: "cartier",
    name: "Cartier",
    origin: "global",
    site: "https://www.cartier.com/",
    makes: ["Ring", "Bracelet", "Chain"],
    tier: "fine",
    blurb: "The Love bracelet and Juste un Clou are the reference points most men's fine jewellery answers to.",
    onMarketplace: false,
  },
  {
    id: "bulgari",
    name: "Bvlgari",
    origin: "global",
    site: "https://www.bulgari.com/",
    makes: ["Ring", "Chain", "Bracelet"],
    tier: "fine",
    blurb: "Roman, architectural and heavier than most — B.zero1 for rings, Serpenti for statement pieces.",
    onMarketplace: false,
  },
  {
    id: "tiffany",
    name: "Tiffany & Co.",
    origin: "global",
    site: "https://www.tiffany.com/",
    makes: ["Chain", "Ring", "Bracelet", "Other"],
    tier: "fine",
    blurb: "Sterling done at fine-jewellery standard; the men's chains and cufflinks are quietly strong.",
    onMarketplace: false,
  },
  {
    id: "gucci",
    name: "Gucci",
    origin: "global",
    site: "https://www.gucci.com/",
    makes: ["Ring", "Chain", "Bracelet"],
    tier: "fine",
    blurb: "Where a statement ring reads as fashion rather than heirloom — Interlocking G, Lion Head.",
    onMarketplace: false,
  },

  // ── Indian premium jewellery ─────────────────────────────────────────
  {
    id: "tanishq",
    name: "Tanishq",
    origin: "india",
    site: "https://www.tanishq.co.in/",
    makes: ["Chain", "Ring", "Bracelet", "Earring"],
    tier: "premium",
    blurb: "Hallmarked gold with a buyback you can actually rely on — the default for gold in India.",
    onMarketplace: false,
  },
  {
    id: "caratlane",
    name: "CaratLane",
    origin: "india",
    site: "https://www.caratlane.com/",
    makes: ["Chain", "Ring", "Bracelet", "Earring"],
    tier: "premium",
    blurb: "A Tata company — lighter, everyday gold and diamond pieces at transparent prices.",
    onMarketplace: false,
  },
  {
    id: "bluestone",
    name: "BlueStone",
    origin: "india",
    site: "https://www.bluestone.com/",
    makes: ["Ring", "Chain", "Bracelet"],
    tier: "premium",
    blurb: "Strong men's range in gold and platinum, with certification on every stone.",
    onMarketplace: false,
  },
];

export const getLuxuryBrand = (id: string) => LUXURY_BRANDS.find((b) => b.id === id);

/**
 * Luxury houses worth naming for a piece, Indian premium first.
 *
 * Indian brands lead within this tier for the same reason the makers lead
 * overall — this is an Indian platform, and a reachable Tanishq reference is
 * more useful to most readers than an unreachable Cartier one.
 */
export function getLuxuryFor(cat: PieceCat, limit = 3): LuxuryBrand[] {
  const matching = LUXURY_BRANDS.filter((b) => b.makes.includes(cat));
  const indiaFirst = [
    ...matching.filter((b) => b.origin === "india"),
    ...matching.filter((b) => b.origin === "global"),
  ];
  return indiaFirst.slice(0, limit);
}
