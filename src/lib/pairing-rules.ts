// The conflict engine — the difference between a catalog and a stylist.
//
// A catalog lists what exists. A stylist tells you that your silver chain is
// fighting your gold watch, and why. Every rule here returns a `why` and a
// `fix`, because the point is that the user learns the rule once and stops
// needing the app for it.
//
// Deliberately conservative: a false alarm teaches a wrong rule, which is worse
// than staying quiet. Rules only fire on combinations that are actually wrong,
// not merely unusual.

import { getTraits, METAL_FAMILY, FORMALITY_LABEL, type Metal } from "./accessory-traits";
import type { Slot } from "./accessory-category";

export type Severity = "clash" | "caution" | "note";

export type Conflict = {
  severity: Severity;
  title: string;
  /** The rule, stated so it transfers to outfits the app has never seen. */
  why: string;
  fix: string;
  /** Pieces implicated, for highlighting in the UI. */
  pieces: string[];
};

const SLOT_LABEL: Record<Slot, string> = {
  neck: "at the neck",
  wrist: "on the wrist",
  finger: "on the hand",
  ear: "at the ear",
  cuff: "on the cuff",
};

/** Two items in one slot is layering; three is clutter. */
const SLOT_LIMIT = 2;

/** A dress-code spread this wide reads as two different outfits. */
const FORMALITY_SPREAD_LIMIT = 3;

type Piece = { name: string; traits: NonNullable<ReturnType<typeof getTraits>> };

function metalMismatch(pieces: Piece[]): Conflict | null {
  const metalled = pieces.filter((p) => METAL_FAMILY[p.traits.metal] !== "neutral");
  if (metalled.length < 2) return null;

  const cool = metalled.filter((p) => METAL_FAMILY[p.traits.metal] === "cool");
  const warm = metalled.filter((p) => METAL_FAMILY[p.traits.metal] === "warm");
  if (cool.length === 0 || warm.length === 0) return null;

  const minority = cool.length <= warm.length ? cool : warm;
  const majorityTone = cool.length <= warm.length ? "warm" : "cool";
  const majorityMetal: Metal = (cool.length <= warm.length ? warm : cool)[0].traits.metal;

  return {
    severity: "clash",
    title: "Metal mismatch",
    why: `You're mixing cool metal (${cool.map((p) => p.traits.metal).join(", ")}) with warm (${warm.map((p) => p.traits.metal).join(", ")}). Metals set the temperature of a fit — two temperatures at once reads as accidental rather than chosen, because the eye can't tell which one is the intent.`,
    fix: `Commit to one. You're mostly ${majorityTone} here, so swap ${minority.map((p) => p.name.toLowerCase()).join(" and ")} for a ${majorityMetal.toLowerCase()} equivalent — or drop it and let the rest carry the look.`,
    pieces: minority.map((p) => p.name),
  };
}

function weightClash(pieces: Piece[]): Conflict | null {
  const statement = pieces.filter((p) => p.traits.weight === "statement");
  const delicate = pieces.filter((p) => p.traits.weight === "delicate");
  if (statement.length === 0 || delicate.length === 0) return null;

  // Only a problem when they sit close enough to be read together — a chunky
  // ring beside a dress watch is a clash; the same ring with thin earrings
  // across the body is just contrast.
  const adjacent = new Set<Slot>(["wrist", "finger"]);
  const nearStatement = statement.filter((p) => adjacent.has(p.traits.slot));
  const nearDelicate = delicate.filter((p) => adjacent.has(p.traits.slot));
  if (nearStatement.length === 0 || nearDelicate.length === 0) return null;

  return {
    severity: "caution",
    title: "Weight clash on the hand",
    why: `${nearStatement[0].name} is a heavy piece and ${nearDelicate[0].name} is a fine one, worn within a few inches of each other. Side by side, the heavy piece makes the fine one look like an afterthought instead of a choice.`,
    fix: `Match the weights — pair the statement piece with something equally substantial, or move one to the other hand so they're read separately.`,
    pieces: [nearStatement[0].name, nearDelicate[0].name],
  };
}

function slotCrowding(pieces: Piece[]): Conflict[] {
  const bySlot = new Map<Slot, Piece[]>();
  for (const p of pieces) {
    const list = bySlot.get(p.traits.slot) ?? [];
    list.push(p);
    bySlot.set(p.traits.slot, list);
  }

  const out: Conflict[] = [];
  for (const [slot, list] of bySlot) {
    if (list.length <= SLOT_LIMIT) continue;
    out.push({
      severity: "caution",
      title: `Too much ${SLOT_LABEL[slot]}`,
      why: `${list.length} pieces ${SLOT_LABEL[slot]} at once. Past two, individual pieces stop being visible and the whole area reads as a single busy mass — you lose the piece you actually wanted to show.`,
      fix: `Cut back to two and pick which one is the hero. The rest can rotate in on other days.`,
      pieces: list.map((p) => p.name),
    });
  }
  return out;
}

function formalitySpread(pieces: Piece[]): Conflict | null {
  if (pieces.length < 2) return null;
  const sorted = [...pieces].sort((a, b) => a.traits.formality - b.traits.formality);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  if (high.traits.formality - low.traits.formality < FORMALITY_SPREAD_LIMIT) return null;

  return {
    severity: "clash",
    title: "Two different dress codes",
    why: `${high.name} belongs to ${FORMALITY_LABEL[high.traits.formality].toLowerCase()} territory and ${low.name} to ${FORMALITY_LABEL[low.traits.formality].toLowerCase()}. Worn together they argue about what the occasion is, and the casual piece wins — it drags the formal one down rather than dressing itself up.`,
    fix: `Decide the occasion first, then keep every piece within one step of it. Swap ${low.name.toLowerCase()} for something nearer ${FORMALITY_LABEL[high.traits.formality].toLowerCase()}.`,
    pieces: [high.name, low.name],
  };
}

/**
 * Season is derived from the month, not a weather API — the advice is about
 * Indian seasons broadly (monsoon humidity, peak summer heat), which a live
 * temperature reading wouldn't sharpen. Pass a month to keep it testable.
 */
function seasonalNotes(pieces: Piece[], month: number): Conflict[] {
  const out: Conflict[] = [];

  const monsoon = month >= 5 && month <= 8; // June–September
  const peakSummer = month >= 2 && month <= 4; // March–May

  if (monsoon) {
    const leather = pieces.filter((p) => p.traits.material === "leather");
    if (leather.length > 0) {
      out.push({
        severity: "note",
        title: "Monsoon — leather at risk",
        why: `${leather.map((p) => p.name).join(", ")} ${leather.length > 1 ? "are" : "is"} leather, and repeated soaking followed by drying stiffens and cracks it permanently. Humidity alone will do it over a season.`,
        fix: `Rotate to metal, bead or cord for the wet months and put the leather away dry.`,
        pieces: leather.map((p) => p.name),
      });
    }
  }

  if (peakSummer) {
    const heavy = pieces.filter((p) => p.traits.weight === "statement" && p.traits.material === "metal");
    if (heavy.length > 0) {
      out.push({
        severity: "note",
        title: "Peak summer — heavy metal",
        why: `${heavy.map((p) => p.name).join(", ")} sit against skin all day in this heat. Heavy metal traps sweat underneath, which tarnishes plating and irritates the skin.`,
        fix: `Go lighter until the rains — thinner chains, smaller pieces, and take them off before anything strenuous.`,
        pieces: heavy.map((p) => p.name),
      });
    }
  }

  return out;
}

const SEVERITY_ORDER: Record<Severity, number> = { clash: 0, caution: 1, note: 2 };

/**
 * Check a combination of pieces. Returns an empty array when the look is sound —
 * callers should say so explicitly rather than rendering nothing.
 *
 * @param month 0-indexed month; defaults to the current one. Injectable for tests.
 */
export function checkLook(names: string[], month?: number): Conflict[] {
  const pieces: Piece[] = names
    .map((name) => {
      const traits = getTraits(name);
      return traits ? { name, traits } : null;
    })
    .filter((p): p is Piece => p !== null);

  if (pieces.length < 2) return [];

  const m = month ?? new Date().getMonth();

  const conflicts: Conflict[] = [
    metalMismatch(pieces),
    weightClash(pieces),
    formalitySpread(pieces),
    ...slotCrowding(pieces),
    ...seasonalNotes(pieces, m),
  ].filter((c): c is Conflict => c !== null);

  return conflicts.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/** One-line verdict for a look, for compact UI. */
export function verdict(conflicts: Conflict[]): { tone: Severity | "clear"; line: string } {
  if (conflicts.length === 0) return { tone: "clear", line: "This combination holds up." };
  const worst = conflicts[0].severity;
  if (worst === "clash") return { tone: "clash", line: "Something's fighting here." };
  if (worst === "caution") return { tone: "caution", line: "Workable, with one adjustment." };
  return { tone: "note", line: "Sound — one seasonal note." };
}
