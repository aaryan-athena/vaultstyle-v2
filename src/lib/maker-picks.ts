// Which homegrown maker to send someone to, per piece.
//
// This replaces product-options.ts, which listed three invented SKUs per piece
// at invented prices. That data could only ever be wrong: nobody had checked
// the products existed, and any price hardcoded here is stale the next time a
// maker reprices. What we can state truthfully is which real labels make this
// category, why each one is worth a look, and roughly what they charge — then
// hand off to their own store, where the live price is correct by definition.
//
// Ranking is deliberate rather than alphabetical: authored standouts come
// first (someone decided Azga is the answer for cufflinks), then the rest of
// the category, spread across price bands so a first-time buyer and a
// collector both see something usable.

import { MAKERS, getMaker, type Maker, type PriceBand } from "./makers-data";
import { categorize } from "./accessory-category";

export type MakerPick = {
  maker: Maker;
  /** Why this label for this piece. Present only for authored standouts. */
  reason?: string;
  /** Search term for the maker's own store. */
  query: string;
};

/**
 * Pieces where one or two labels are genuinely the right answer, with the
 * reason stated. Everything not listed here falls through to category matching.
 */
const STANDOUTS: Record<string, { id: string; reason: string }[]> = {
  Cufflinks: [
    { id: "azga", reason: "Built their range around exactly this — cufflinks, collar pins, lapel pins" },
    { id: "voylla", reason: "The dependable, well-priced option for formal hardware" },
  ],
  "Cuban Chain": [
    { id: "drip-project", reason: "India's homegrown Cuban and tennis specialist" },
    { id: "zavya", reason: "Cuts their sterling links heavier than most Indian silver labels" },
  ],
  "Thick Chain": [
    { id: "drip-project", reason: "Heavy-gauge chain is the house speciality" },
    { id: "zavya", reason: "Sterling weight without the plated shortcut" },
  ],
  "Flashy Chain": [{ id: "drip-project", reason: "Iced-out done properly rather than as a novelty" }],
  "Layered Chain": [{ id: "shop-lune", reason: "Demi-fine pieces designed to be layered, not worn alone" }],
  "Rope Chain": [{ id: "drip-project", reason: "Rope and Franco are core to their chain range" }],
  "Signet Ring": [
    { id: "misho", reason: "Signet rings in enamel and silver are a signature of the Misho Man line" },
    { id: "quirksmith", reason: "Hand-engraved 925, if you want something on the face" },
  ],
  "Statement Ring": [
    { id: "bhavya-ramesh", reason: "Nail rings and talisman-scale silver — statement is the default here" },
    { id: "studio-metallurgy", reason: "Industrial materials worked into pieces nothing else resembles" },
  ],
  "Chunky Ring": [{ id: "bhavya-ramesh", reason: "Heavy silver at a scale most Indian labels avoid" }],
  "Dark Ring": [{ id: "studio-metallurgy", reason: "Blackened and industrial finishes are the studio's native register" }],
  "Utility Ring": [{ id: "studio-metallurgy", reason: "Hardware as jewellery — gears, fuses, cement" }],
  "Textured Ring": [{ id: "quirksmith", reason: "Hand-worked texture rather than machine finishing" }],
  "Cross Pendant": [{ id: "bhavya-ramesh", reason: "Pendants built as talismans, in weighty silver" }],
  "Pearl Necklace": [
    { id: "misho", reason: "Black pearl pendants are a Misho Man staple" },
    { id: "dhora", reason: "Freshwater pearl worked into genderless, vintage-feeling pieces" },
  ],
  "Shell Necklace": [{ id: "dhora", reason: "Quartz, shell and carved naturals, handcrafted in Jaipur" }],
  "Beaded Bracelet": [{ id: "dhora", reason: "Stone and bead work with a hand-made rather than mass-strung feel" }],
  "Leather Bracelet": [{ id: "voylla", reason: "One of the few homegrown labels doing leather at real prices" }],
  "Dress Watch": [
    { id: "bangalore-watch-co", reason: "Indian-made mechanicals built for exactly this register" },
    { id: "jaipur-watch-co", reason: "Antique-coin dials and hand-engraving, if you want a talking point" },
  ],
  "Luxury Watch": [
    { id: "jaipur-watch-co", reason: "Genuine antique coins set into the dial — the Baagh is the known one" },
    { id: "bangalore-watch-co", reason: "The Apogee: first Indian watch qualified for spaceflight" },
  ],
  "Retro Watch": [{ id: "jaipur-watch-co", reason: "Coins, stamps and miniature painting — retro by construction" }],
  "Sporty Watch": [{ id: "bangalore-watch-co", reason: "Cover Drive and MACH 1 are sports watches by design" }],
  "Field Watch": [{ id: "bangalore-watch-co", reason: "MACH 1 draws directly on Air Force aviation" }],
  "Minimal Watch": [{ id: "bangalore-watch-co", reason: "Clean Indian-made mechanicals, no branding shouting" }],
  "Sleek Watch": [{ id: "bangalore-watch-co", reason: "Slim mechanical cases made in Bengaluru" }],
  "Statement Watch": [{ id: "jaipur-watch-co", reason: "A coin dial is a statement without being loud about it" }],
  "Bold Watch": [{ id: "jaipur-watch-co", reason: "The Baagh's tiger dial carries a room on its own" }],
  "Casual Watch": [{ id: "bangalore-watch-co", reason: "Everyday mechanicals from an Indian workshop" }],
};

/**
 * Categories the homegrown roster genuinely cannot serve. Being straight about
 * this matters more than pretending coverage: no independent Indian jeweller
 * makes a fitness tracker, and sending someone to one who does not would waste
 * their time and embarrass the maker.
 */
const NO_HOMEGROWN_COVERAGE = new Set(["Smartwatch", "Tactical Watch"]);

export const hasHomegrownCoverage = (accessory: string) => !NO_HOMEGROWN_COVERAGE.has(accessory);

/** Store search term — the piece name is already what a shopper would type. */
const queryFor = (accessory: string) => accessory.toLowerCase();

const BAND_ORDER: PriceBand[] = ["accessible", "mid", "premium"];

export function getMakerPicks(accessory: string, limit = 3): MakerPick[] {
  if (!hasHomegrownCoverage(accessory)) return [];

  const query = queryFor(accessory);
  const picks: MakerPick[] = [];
  const taken = new Set<string>();

  for (const { id, reason } of STANDOUTS[accessory] ?? []) {
    const maker = getMaker(id);
    if (!maker || taken.has(id)) continue;
    picks.push({ maker, reason, query });
    taken.add(id);
  }

  // Fill the rest from the category, one price band at a time, so the list
  // spans budgets instead of stacking three premium labels.
  const cat = categorize(accessory);
  const eligible = MAKERS.filter((m) => !taken.has(m.id) && m.makes.includes(cat));

  for (const band of BAND_ORDER) {
    if (picks.length >= limit) break;
    const next = eligible.find((m) => m.priceBand === band && !taken.has(m.id));
    if (next) {
      picks.push({ maker: next, query });
      taken.add(next.id);
    }
  }

  for (const maker of eligible) {
    if (picks.length >= limit) break;
    if (taken.has(maker.id)) continue;
    picks.push({ maker, query });
    taken.add(maker.id);
  }

  return picks.slice(0, limit);
}

/** Makers who sit naturally inside a given vibe — powers the vibe pages. */
export const getMakersForVibe = (vibe: string): Maker[] =>
  MAKERS.filter((m) => m.vibes.includes(vibe));
