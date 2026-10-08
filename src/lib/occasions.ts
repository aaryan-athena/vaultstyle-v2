// Occasion intelligence — a lens over the existing vibe catalog.
//
// Users don't arrive thinking "Old Money"; they arrive thinking "my cousin's
// wedding is Saturday". Most men own enough accessories already — what they
// lack is the judgement of when formality actually matters. So each occasion
// names a dress-code floor and ceiling, and the same drawer produces a
// different answer for a date than for a condolence visit.
//
// No model call: this resolves through blendVibes() and the traits table.

import { VIBES, lookupAccessoryDefinition } from "./vault-data";
import { blendVibes, MIN_MIX } from "./vibe-mixer";
import { getTraits, type Formality } from "./accessory-traits";

export type Occasion = {
  slug: string;
  label: string;
  /** What the occasion actually demands, in one line the user can act on. */
  blurb: string;
  /** Catalog vibes this occasion draws from, best first. */
  vibes: string[];
  /** Nothing below this dress-code level belongs here. */
  formalityFloor: Formality;
  /** Nothing above this either — over-dressing is its own mistake. */
  formalityCeiling: Formality;
  /** Canonical piece names that are wrong here regardless of formality. */
  avoid?: string[];
};

export const OCCASIONS: Occasion[] = [
  {
    slug: "job-interview",
    label: "Job interview",
    blurb: "One quiet piece per limb, nothing that makes noise when you gesture. You want them listening, not counting your rings.",
    vibes: ["Business Casual", "Clean Fit"],
    formalityFloor: 3,
    formalityCeiling: 5,
    avoid: ["Cuban Chain", "Thick Chain", "Flashy Chain", "Layered Chain", "Statement Ring"],
  },
  {
    slug: "client-meeting",
    label: "Client meeting",
    blurb: "Read as competent before you speak. A good watch does more here than any other piece.",
    vibes: ["Business Casual", "Smart Casual"],
    formalityFloor: 3,
    formalityCeiling: 5,
    avoid: ["Thick Chain", "Flashy Chain", "Chunky Ring"],
  },
  {
    slug: "college-presentation",
    label: "College presentation",
    blurb: "Sharper than your classmates, not costumed. One deliberate piece beats a stack.",
    vibes: ["Smart Casual", "Minimal"],
    formalityFloor: 2,
    formalityCeiling: 4,
    avoid: ["Flashy Chain", "Thick Chain"],
  },
  {
    slug: "date-night",
    label: "Date night",
    blurb: "Texture over shine. Something worth noticing up close, since that's the viewing distance.",
    vibes: ["Smart Casual", "Minimal", "Old Money"],
    formalityFloor: 2,
    formalityCeiling: 4,
    avoid: ["Smartwatch", "Tactical Watch", "Sporty Bracelet"],
  },
  {
    slug: "family-wedding",
    label: "Family wedding",
    blurb: "Warm metals with traditional dress. This is the one occasion where more is genuinely allowed.",
    vibes: ["Luxury", "Old Money", "Formal"],
    formalityFloor: 3,
    formalityCeiling: 5,
    avoid: ["Smartwatch", "Tactical Watch", "Sporty Watch", "Sporty Bracelet"],
  },
  {
    slug: "festival",
    label: "Festival / Diwali",
    blurb: "Gold reads correct against festive kurtas in a way silver never quite does.",
    vibes: ["Luxury", "Old Money"],
    formalityFloor: 2,
    formalityCeiling: 5,
    avoid: ["Smartwatch", "Tactical Watch", "Matte Chain", "Utility Ring"],
  },
  {
    slug: "house-party",
    label: "House party",
    blurb: "Low light flattens detail, so scale up. This is where a statement piece earns its place.",
    vibes: ["Partywear", "Edgy"],
    formalityFloor: 1,
    formalityCeiling: 4,
    avoid: ["Cufflinks", "Dress Watch"],
  },
  {
    slug: "casual-friday",
    label: "Casual Friday",
    blurb: "Still an office. Keep the watch, lose the layers you'd wear on a Saturday.",
    vibes: ["Smart Casual", "Monochrome"],
    formalityFloor: 2,
    formalityCeiling: 4,
    avoid: ["Thick Chain", "Flashy Chain", "Layered Chain"],
  },
  {
    slug: "travel-day",
    label: "Airport / travel day",
    blurb: "Anything that sets off a scanner or digs in over six hours is the wrong answer.",
    vibes: ["Minimal", "Sporty"],
    formalityFloor: 1,
    formalityCeiling: 3,
    avoid: ["Cufflinks", "Statement Ring", "Chunky Ring", "Thick Chain", "Layered Chain", "Layered Ring"],
  },
  {
    slug: "beach-holiday",
    label: "Beach holiday",
    blurb: "Salt water destroys plated metal. Wear the materials that don't mind — shell, bead, pearl.",
    vibes: ["Beachwear", "Summer Linen"],
    formalityFloor: 1,
    formalityCeiling: 3,
    avoid: ["Luxury Watch", "Dress Watch", "Cufflinks", "Statement Watch"],
  },
  {
    slug: "gym-to-street",
    label: "Gym to street",
    blurb: "Sweat and metal don't mix. Keep it to what you can rinse off.",
    vibes: ["Sporty", "Streetwear"],
    formalityFloor: 1,
    formalityCeiling: 2,
    avoid: ["Cufflinks", "Dress Watch", "Luxury Watch", "Signet Ring", "Elegant Ring"],
  },
  {
    slug: "condolence",
    label: "Condolence / funeral",
    blurb: "Nothing that catches light or draws a second look. Plain metal, or nothing at all.",
    vibes: ["Formal", "Monochrome"],
    formalityFloor: 3,
    formalityCeiling: 5,
    avoid: [
      "Cuban Chain",
      "Thick Chain",
      "Flashy Chain",
      "Layered Chain",
      "Statement Ring",
      "Statement Watch",
      "Bold Watch",
      "Luxury Watch",
      "Drop Earring",
    ],
  },
];

export const occasionBySlug = (slug: string) => OCCASIONS.find((o) => o.slug === slug);

export type OccasionEdit = {
  occasion: Occasion;
  /** Pieces that fit the occasion's dress code, hero pieces first. */
  pieces: string[];
  /** Pieces the source vibes suggested that this occasion rules out, with why. */
  excluded: Array<{ piece: string; reason: string }>;
  palette: string[];
  sourceVibes: string[];
};

/**
 * Resolve an occasion into a filtered edit. Draws pieces from the occasion's
 * vibes (blended when there are two or more), then applies the dress-code
 * window and the avoid list — keeping the rejects so the UI can teach the rule
 * rather than silently dropping pieces.
 */
export function resolveOccasion(occasion: Occasion): OccasionEdit {
  const known = occasion.vibes.filter((v) => VIBES.some((x) => x.vibe === v));
  const blended = known.length >= MIN_MIX ? blendVibes(known) : null;

  const rawLabels = blended
    ? [...blended.mostValuable, ...blended.recommended, ...blended.addOns]
    : (() => {
        const v = VIBES.find((x) => x.vibe === known[0]);
        return v ? [...v.mostValuable, ...v.recommended, ...v.addOns] : [];
      })();

  const palette = blended
    ? blended.colors
    : (VIBES.find((x) => x.vibe === known[0])?.colors ?? []);

  const avoid = new Set(occasion.avoid ?? []);
  const seen = new Set<string>();
  const pieces: string[] = [];
  const excluded: Array<{ piece: string; reason: string }> = [];

  for (const label of rawLabels) {
    const { name } = lookupAccessoryDefinition(label);
    if (seen.has(name)) continue;
    seen.add(name);

    if (avoid.has(name)) {
      excluded.push({ piece: name, reason: "wrong register for this occasion" });
      continue;
    }

    const traits = getTraits(name);
    if (!traits) {
      pieces.push(name);
      continue;
    }
    if (traits.formality < occasion.formalityFloor) {
      excluded.push({ piece: name, reason: "reads too casual here" });
      continue;
    }
    if (traits.formality > occasion.formalityCeiling) {
      excluded.push({ piece: name, reason: "overdressed for this" });
      continue;
    }
    pieces.push(name);
  }

  return { occasion, pieces, excluded, palette, sourceVibes: known };
}

/** The subset of an occasion's edit the user already owns, and what's missing. */
export function occasionAgainstDrawer(occasion: Occasion, owned: ReadonlySet<string>) {
  const edit = resolveOccasion(occasion);
  return {
    ...edit,
    haveIt: edit.pieces.filter((p) => owned.has(p)),
    needIt: edit.pieces.filter((p) => !owned.has(p)),
  };
}
