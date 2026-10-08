// The maker roster — independent and homegrown Indian labels.
//
// This file replaces the old global-brand product list (Rolex, Cartier, Casio,
// Fossil). The point of the platform changed: instead of racing Amazon on
// listings for brands everyone already knows, it points at small Indian labels
// that don't have the ad budget to be found.
//
// TWO RULES THIS FILE EXISTS TO KEEP
//
//  1. Every maker here is real, and `site` is a live storefront that was
//     checked by hand. These are other people's businesses — a dead link or a
//     misattributed city is a real-world error, not a rendering bug.
//  2. No invented SKUs. The old file listed exact products at exact prices
//     ("Iced Cuban 12mm — ₹6,500") that nobody had verified and that go stale
//     the week a maker reprices. We store what is durably true instead: who the
//     maker is, what categories they actually make, and a price BAND. The link
//     goes to their own store, where the live price is by definition correct.
//
// `priceBand` is a rough per-piece range for orientation only, and is rendered
// as an approximation. When in doubt, widen the band rather than guess narrow.

import type { PieceCat } from "./accessory-category";

export type PriceBand = "accessible" | "mid" | "premium";

export const PRICE_BAND_LABEL: Record<PriceBand, string> = {
  accessible: "₹500 – ₹3,000",
  mid: "₹3,000 – ₹12,000",
  premium: "₹12,000 +",
};

export const PRICE_BAND_NOTE: Record<PriceBand, string> = {
  accessible: "Everyday pieces, first-buy friendly",
  mid: "Sterling silver and demi-fine",
  premium: "Designer and collector pieces",
};

export type Maker = {
  id: string;
  name: string;
  /** Where the workshop or studio actually is. Omitted when unverified. */
  city?: string;
  /** Named founder, where publicly on record. */
  founder?: string;
  /** One line on what makes them worth knowing — not marketing copy. */
  blurb: string;
  /** Their own storefront. Checked live; no marketplace middlemen. */
  site: string;
  /** Categories this label genuinely makes, driving what it gets suggested for. */
  makes: PieceCat[];
  priceBand: PriceBand;
  /** Materials they're known for, in the vocabulary of accessory-traits.ts. */
  materials: string[];
  /** Vibes from the catalog this label sits naturally inside. */
  vibes: string[];
};

export const MAKERS: Maker[] = [
  {
    id: "misho",
    name: "Misho",
    city: "Mumbai",
    founder: "Suhani Parekh",
    blurb:
      "Sculptural, brutalist-leaning pieces built around structure rather than sparkle. The Misho Man line runs to signet rings, zodiac medallions and black pearl pendants.",
    site: "https://misho.in/",
    makes: ["Ring", "Chain", "Earring"],
    priceBand: "premium",
    materials: ["metal", "pearl"],
    vibes: ["Minimal", "Clean Fit", "Luxury", "Monochrome", "Old Money"],
  },
  {
    id: "studio-metallurgy",
    name: "Studio Metallurgy",
    founder: "Advaeita Mathew",
    blurb:
      "Started with jewellery made from industrial spare parts — fuses, watch mechanisms, copper dust — and still builds around cement, gears and hardware nobody else treats as precious.",
    site: "https://studiometallurgy.com/",
    makes: ["Ring", "Bracelet", "Earring", "Other"],
    priceBand: "premium",
    materials: ["metal"],
    vibes: ["Techwear", "Edgy", "Monochrome", "Goth", "Grunge"],
  },
  {
    id: "bhavya-ramesh",
    name: "Bhavya Ramesh",
    city: "Jaipur",
    founder: "Bhavya Ramesh",
    blurb:
      "Bold silver worked by a team of around forty artisans out of a Jaipur warehouse. Known for nail rings and pieces that read as talismans rather than accessories.",
    site: "https://bhavyaramesh.com/",
    makes: ["Ring", "Chain", "Earring", "Bracelet"],
    priceBand: "mid",
    materials: ["metal", "pearl"],
    vibes: ["Edgy", "Goth", "Grunge", "Y2K", "Partywear"],
  },
  {
    id: "drip-project",
    name: "Drip Project",
    blurb:
      "Cuban, tennis, rope and Franco chains done properly at a price that isn't a joke. The closest thing India has to a homegrown iced-out specialist.",
    site: "https://dripproject.co/",
    makes: ["Chain", "Bracelet", "Ring", "Earring"],
    priceBand: "mid",
    materials: ["metal"],
    vibes: ["Streetwear", "Y2K", "Partywear", "Sporty", "Edgy"],
  },
  {
    id: "dhora",
    name: "Dhora India",
    city: "Jaipur",
    blurb:
      "Handcrafted and deliberately genderless — clear quartz pendants, celestial carvings, freshwater pearl. Pieces that look older than they are.",
    site: "https://dhora.in/",
    makes: ["Chain", "Ring", "Earring", "Bracelet"],
    priceBand: "mid",
    materials: ["metal", "pearl", "bead"],
    vibes: ["Vintage", "Beachwear", "Summer Linen", "Old Money"],
  },
  {
    id: "quirksmith",
    name: "Quirksmith",
    city: "Bengaluru",
    blurb:
      "Handcrafted 925 silver with engraving as the point rather than a finishing touch. Went through Shark Tank India and kept the workshop small.",
    site: "https://quirksmith.com/",
    makes: ["Ring", "Chain", "Bracelet", "Earring"],
    priceBand: "mid",
    materials: ["metal"],
    vibes: ["Casual", "Minimal", "Vintage", "Smart Casual"],
  },
  {
    id: "azga",
    name: "Azga",
    founder: "Nikita & Namita",
    blurb:
      "A sister-run label that took the part of menswear everyone else skips seriously: cufflinks, lapel pins, collar pins and brooches.",
    site: "https://www.azga.in/",
    makes: ["Other", "Ring"],
    priceBand: "mid",
    materials: ["metal"],
    vibes: ["Formal", "Business Casual", "Old Money", "Preppy", "Luxury"],
  },
  {
    id: "aulerth",
    name: "Aulerth",
    founder: "Vivek Ramabhadran",
    blurb:
      "Recycled metals and lab-grown stones, made in collaboration with Indian couture names. Statement scale, with the sustainability worked in rather than bolted on.",
    site: "https://aulerth.com/",
    makes: ["Ring", "Chain", "Bracelet", "Earring"],
    priceBand: "premium",
    materials: ["metal"],
    vibes: ["Luxury", "Partywear", "Formal"],
  },
  {
    id: "shop-lune",
    name: "Shop Lune",
    blurb:
      "Demi-fine and celestial — silver, gold and bronze worked with Indian techniques into pieces meant to be layered and travelled in.",
    site: "https://www.shoplune.in/",
    makes: ["Chain", "Earring", "Ring", "Bracelet"],
    priceBand: "mid",
    materials: ["metal", "bead"],
    vibes: ["Beachwear", "Summer Linen", "Minimal", "Vintage"],
  },
  {
    id: "zavya",
    name: "ZAVYA",
    blurb:
      "A 925 sterling silver label with an unusually deep men's range — the chains and bands are cut heavier than most Indian silver brands bother with.",
    site: "https://zavya.co.in/",
    makes: ["Chain", "Ring", "Bracelet"],
    priceBand: "mid",
    materials: ["metal"],
    vibes: ["Streetwear", "Edgy", "Monochrome", "Casual"],
  },
  {
    id: "giva",
    name: "GIVA",
    city: "Bengaluru",
    blurb:
      "925 silver at a first-buy price, with anti-tarnish finishing that survives Indian humidity. The sensible place to start a collection.",
    site: "https://www.giva.co/",
    makes: ["Chain", "Ring", "Bracelet", "Earring"],
    priceBand: "accessible",
    materials: ["metal", "pearl"],
    vibes: ["Minimal", "Casual", "Clean Fit", "Smart Casual", "Business Casual"],
  },
  {
    id: "salty",
    name: "Salty",
    blurb:
      "Trend-led and anti-tarnish, aimed squarely at people buying their first chain and not wanting to spend silver money to find out if they like it.",
    site: "https://salty.co.in/",
    makes: ["Chain", "Ring", "Bracelet", "Earring"],
    priceBand: "accessible",
    materials: ["metal", "bead"],
    vibes: ["Streetwear", "Y2K", "Sporty", "Casual", "Partywear"],
  },
  {
    id: "eurumme",
    name: "Eurumme",
    blurb:
      "Small-batch and quietly designed — the kind of thin chains and stacking pieces that do their work without announcing a brand.",
    site: "https://eurumme.com/",
    makes: ["Chain", "Ring", "Bracelet", "Earring"],
    priceBand: "accessible",
    materials: ["metal", "bead"],
    vibes: ["Minimal", "Clean Fit", "Casual", "Monochrome"],
  },
  {
    id: "voylla",
    name: "Voylla",
    city: "Jaipur",
    blurb:
      "Jaipur-based and enormous by homegrown standards, which makes it the reliable option for formal hardware — cufflinks, tie pins, brooches — at real prices.",
    site: "https://www.voylla.com/",
    makes: ["Other", "Chain", "Ring", "Bracelet"],
    priceBand: "accessible",
    materials: ["metal"],
    vibes: ["Formal", "Business Casual", "Preppy", "Vintage"],
  },
  {
    id: "bangalore-watch-co",
    name: "Bangalore Watch Company",
    city: "Bengaluru",
    founder: "Nirupesh Joshi & Mercy Amalraj",
    blurb:
      "Founded 2018, building Indian-themed mechanical watches — Cover Drive for cricket, MACH 1 for Air Force aviation, and the Apogee, the first Indian watch qualified for spaceflight.",
    site: "https://www.bangalorewatchco.in/",
    makes: ["Watch"],
    priceBand: "premium",
    materials: ["metal", "leather"],
    vibes: ["Formal", "Business Casual", "Clean Fit", "Smart Casual", "Old Money", "Rugged"],
  },
  {
    id: "jaipur-watch-co",
    name: "Jaipur Watch Company",
    city: "Jaipur",
    founder: "Gaurav Mehta",
    blurb:
      "Since 2013, watches built around genuine antique coins, stamps and hand-engraving. The Baagh is probably the best-known homegrown Indian watch there is.",
    site: "https://jaipur.watch/",
    makes: ["Watch"],
    priceBand: "premium",
    materials: ["metal", "leather"],
    vibes: ["Vintage", "Old Money", "Luxury", "Formal", "Preppy"],
  },
];

export const MAKERS_BY_ID: Record<string, Maker> = Object.fromEntries(
  MAKERS.map((m) => [m.id, m]),
);

export const getMaker = (id: string): Maker | undefined => MAKERS_BY_ID[id];

/** Every city on the roster, for the maker directory's filter. */
export const MAKER_CITIES = [...new Set(MAKERS.map((m) => m.city).filter(Boolean))].sort() as string[];
