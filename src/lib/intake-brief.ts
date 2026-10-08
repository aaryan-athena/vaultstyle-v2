// Intake answers → a concrete brief, with no model involved.
//
// The AI writes the covering note (see api/onboarding.functions.ts), but it must
// never be the thing that decides what you're shown: the key can be missing,
// the call can fail, and the answer still has to be good. So the actual
// selection happens here, deterministically, out of engines that already exist —
// occasions.ts for the dress-code window, accessory-traits.ts for formality,
// maker-picks.ts for where to buy.
//
// The AI layer then explains this brief. It never replaces it.

import { occasionBySlug, resolveOccasion, type Occasion } from "./occasions";
import { getTraits, FORMALITY_LABEL, type Formality } from "./accessory-traits";
import { categorize } from "./accessory-category";
import { getMakerPicks } from "./maker-picks";
import type { Intake, LookingFor, OwnsAlready, WearFrequency } from "./onboarding";
import type { Maker } from "./makers-data";

export type BriefPick = {
  piece: string;
  /** Why this piece, in terms the reader can reuse next time. */
  why: string;
  formality?: Formality;
  makers: Maker[];
};

export type IntakeBrief = {
  occasion: Occasion;
  /** The single piece to buy first, if there is a clear one. */
  lead: BriefPick | null;
  /** Everything else worth considering, best first. */
  alternates: BriefPick[];
  /** Pieces this occasion actively rules out, kept so the rule is teachable. */
  ruledOut: Array<{ piece: string; reason: string }>;
  palette: string[];
  sourceVibes: string[];
  /** One line summarising the constraint the answers implied. */
  constraint: string;
};

/**
 * How many pieces to put in front of someone, by how much they already own.
 * A first-timer shown eight options buys nothing; someone filling gaps wants
 * the range.
 */
const BREADTH: Record<OwnsAlready, number> = { none: 3, few: 4, several: 6 };

/** Everyday wear caps how precious a piece can sensibly be, and vice versa. */
const WEAR_NOTE: Record<WearFrequency, string> = {
  daily: "worn daily, so it has to be tough and quiet enough to disappear",
  weekly: "worn most weeks, so it can carry a bit more personality",
  occasions: "worn for occasions, so it can be the piece people notice",
  first: "a first piece, so it should be the kind of thing that can't be worn wrong",
};

const OWNS_NOTE: Record<OwnsAlready, string> = {
  none: "starting from nothing",
  few: "already has a piece or two",
  several: "filling gaps in a collection",
};

/**
 * Preference order within an occasion's edit, given what they said they want.
 * A stated category wins; "Unsure" falls back to the occasion's own ordering,
 * which already puts hero pieces first.
 */
function rank(pieces: string[], looking: LookingFor, wear: WearFrequency): string[] {
  const scored = pieces.map((piece, i) => {
    let score = -i; // preserve the occasion's hero-first ordering as the baseline
    if (looking !== "Unsure" && categorize(piece) === looking) score += 100;

    const traits = getTraits(piece);
    if (traits) {
      // Daily wear wants restraint; occasion wear can take weight.
      if (wear === "daily" && traits.weight === "delicate") score += 12;
      if (wear === "daily" && traits.weight === "statement") score -= 12;
      if (wear === "occasions" && traits.weight === "statement") score += 10;
      if (wear === "first" && traits.weight === "delicate") score += 14;
      if (wear === "first" && traits.weight === "statement") score -= 16;
    }
    return { piece, score };
  });

  return scored.sort((a, b) => b.score - a.score).map((s) => s.piece);
}

function whyFor(piece: string, intake: Intake, isLead: boolean): string {
  const traits = getTraits(piece);
  const cat = categorize(piece).toLowerCase();
  const bits: string[] = [];

  if (isLead && intake.looking !== "Unsure" && categorize(piece) === intake.looking) {
    bits.push(`the ${cat} you asked for`);
  } else if (isLead) {
    bits.push("the piece that does the most work here");
  }

  if (traits) {
    bits.push(`${FORMALITY_LABEL[traits.formality].toLowerCase()} register`);
    if (traits.material !== "metal") bits.push(`${traits.material} rather than metal`);
    if (traits.weight === "delicate" && (intake.wear === "daily" || intake.wear === "first")) {
      bits.push("light enough to forget you're wearing it");
    }
    if (traits.weight === "statement" && intake.wear === "occasions") {
      bits.push("enough presence to be the point of the outfit");
    }
  }

  if (intake.owns === "none" && isLead) bits.push("nothing else needed to make it work");

  return bits.length ? bits.join(" · ") : "fits the dress code for this";
}

export function buildBrief(intake: Intake): IntakeBrief | null {
  const occasion = occasionBySlug(intake.occasion);
  if (!occasion) return null;

  const edit = resolveOccasion(occasion);
  const ordered = rank(edit.pieces, intake.looking, intake.wear);

  const toPick = (piece: string, isLead: boolean): BriefPick => ({
    piece,
    why: whyFor(piece, intake, isLead),
    formality: getTraits(piece)?.formality,
    makers: getMakerPicks(piece, 2).map((p) => p.maker),
  });

  const lead = ordered.length ? toPick(ordered[0], true) : null;
  const alternates = ordered.slice(1, 1 + BREADTH[intake.owns]).map((p) => toPick(p, false));

  const constraint = `${OWNS_NOTE[intake.owns]}, ${WEAR_NOTE[intake.wear]} — held to ${
    FORMALITY_LABEL[occasion.formalityFloor].toLowerCase()
  } through ${FORMALITY_LABEL[occasion.formalityCeiling].toLowerCase()} for ${occasion.label.toLowerCase()}.`;

  return {
    occasion,
    lead,
    alternates,
    ruledOut: edit.excluded.slice(0, 4),
    palette: edit.palette,
    sourceVibes: edit.sourceVibes,
    constraint,
  };
}
