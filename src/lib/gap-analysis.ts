// "Shop to complete the set" — set maths over the drawer and the vibe catalog.
//
// The question this answers is not "what matches?" but "what single purchase
// buys me the most new looks?" That turns a catalog into a purchasing advisor,
// and it needs no model call: every input already exists in vault-data.

import { VIBES, lookupAccessoryDefinition, type VibeEntry } from "./vault-data";

/**
 * A vibe is wearable once you own its hero piece plus one supporting piece.
 *
 * This follows the platform's own thesis (see /about): the hero does about 70%
 * of the styling work and the rest agree with it. An earlier version required
 * half the full edit, which was unreachable — vibes carry 5–7 pieces, so no
 * single purchase could ever cross the line and every piece reported "unlocks
 * 0". That made the ranking a static popularity list rather than advice.
 */
const MIN_PIECES_TO_WEAR = 2;

/** Canonical, de-duplicated piece list for a vibe, hero pieces first. */
export function piecesFor(vibe: VibeEntry): { hero: string[]; all: string[] } {
  const seen = new Set<string>();
  const canon = (labels: string[]) =>
    labels
      .map((l) => lookupAccessoryDefinition(l).name)
      .filter((n) => {
        if (seen.has(n)) return false;
        seen.add(n);
        return true;
      });

  const hero = canon(vibe.mostValuable);
  const rest = canon([...vibe.recommended, ...vibe.addOns]);
  return { hero, all: [...hero, ...rest] };
}

export type VibeCoverage = {
  vibe: string;
  outfitType: VibeEntry["outfitType"];
  owned: string[];
  missing: string[];
  total: number;
  hasHero: boolean;
  pct: number;
  unlocked: boolean;
  /** How many purchases away from wearable. 0 when already unlocked. */
  toUnlock: number;
  /** The specific pieces that would get it there, best first. */
  unlockNeeds: string[];
};

export function vibeCoverage(owned: ReadonlySet<string>, vibe: VibeEntry): VibeCoverage {
  const { hero, all } = piecesFor(vibe);
  const ownedPieces = all.filter((p) => owned.has(p));
  const pct = all.length === 0 ? 0 : ownedPieces.length / all.length;
  const hasHero = hero.length > 0 && hero.some((h) => owned.has(h));
  const unlocked = hasHero && ownedPieces.length >= MIN_PIECES_TO_WEAR;

  // Buying the hero also increments the piece count, so the two requirements
  // partly satisfy each other — don't double-count them.
  const missingHeroes = hero.filter((h) => !owned.has(h));
  const shortfall = Math.max(0, MIN_PIECES_TO_WEAR - ownedPieces.length);
  const toUnlock = unlocked
    ? 0
    : hasHero
      ? shortfall
      : 1 + Math.max(0, MIN_PIECES_TO_WEAR - 1 - ownedPieces.length);

  // Lead with the hero if it's missing — it's the piece that does the work.
  const others = all.filter((p) => !owned.has(p) && !missingHeroes.includes(p));
  const unlockNeeds = (hasHero ? others : [...missingHeroes.slice(0, 1), ...others]).slice(
    0,
    Math.max(toUnlock, 1),
  );

  return {
    vibe: vibe.vibe,
    outfitType: vibe.outfitType,
    owned: ownedPieces,
    missing: all.filter((p) => !owned.has(p)),
    total: all.length,
    hasHero,
    pct,
    unlocked,
    toUnlock,
    unlockNeeds,
  };
}

export const coverageAll = (owned: ReadonlySet<string>): VibeCoverage[] =>
  VIBES.map((v) => vibeCoverage(owned, v));

export type Acquisition = {
  piece: string;
  /** Vibes that flip from locked to unlocked if this piece is acquired. */
  unlocks: string[];
  /** Vibes this piece appears in that are still incomplete. */
  advances: string[];
  /** Sum of coverage gained across all vibes, as a fraction of a vibe each. */
  coverageGain: number;
};

/**
 * Rank every unowned piece by what acquiring it would do for the collection.
 * Sorted by vibes unlocked, then by total coverage gained.
 */
export function rankAcquisitions(owned: ReadonlySet<string>, limit = 8): Acquisition[] {
  const before = coverageAll(owned);
  const unlockedBefore = new Set(before.filter((c) => c.unlocked).map((c) => c.vibe));

  // Every piece that appears in any vibe but isn't owned yet.
  const candidates = new Set<string>();
  for (const c of before) for (const m of c.missing) candidates.add(m);

  const ranked: Acquisition[] = [];

  for (const piece of candidates) {
    const hypothetical = new Set(owned);
    hypothetical.add(piece);

    const unlocks: string[] = [];
    const advances: string[] = [];
    let coverageGain = 0;

    for (const prev of before) {
      if (!prev.missing.includes(piece)) continue;
      const vibe = VIBES.find((v) => v.vibe === prev.vibe)!;
      const next = vibeCoverage(hypothetical, vibe);

      coverageGain += next.pct - prev.pct;
      if (next.unlocked && !unlockedBefore.has(prev.vibe)) unlocks.push(prev.vibe);
      else advances.push(prev.vibe);
    }

    ranked.push({ piece, unlocks, advances, coverageGain });
  }

  return ranked
    .sort(
      (a, b) =>
        b.unlocks.length - a.unlocks.length ||
        b.coverageGain - a.coverageGain ||
        a.piece.localeCompare(b.piece),
    )
    .slice(0, limit);
}

/** Vibes closest to wearable but not there yet — the "you're 1 piece away" line. */
export function nearMisses(owned: ReadonlySet<string>, limit = 3): VibeCoverage[] {
  return coverageAll(owned)
    .filter((c) => !c.unlocked && c.owned.length > 0)
    .sort((a, b) => a.toUnlock - b.toUnlock || b.pct - a.pct)
    .slice(0, limit);
}

/**
 * Owned pieces that appear in no unlocked vibe — the dormant end of the drawer.
 * A no-logging stand-in for wear tracking: it asks "is this piece doing any
 * work?" rather than asking the user to record every time they wear something.
 */
export function dormantPieces(owned: ReadonlySet<string>): string[] {
  const unlocked = coverageAll(owned).filter((c) => c.unlocked);
  const working = new Set(unlocked.flatMap((c) => c.owned));
  return [...owned].filter((p) => !working.has(p)).sort();
}
