// The curation layer — edits with a byline.
//
// A DELIBERATE LIMIT, READ THIS BEFORE ADDING ENTRIES
//
// The brief for this feature is "curated sections built with fashion bloggers
// and creators — their affiliate picks and styling recommendations". The
// software for that is below and finished. What is NOT below is a list of real
// creators' names attached to picks they never made.
//
// Putting "curated by @someone" on an edit they didn't curate is a fabricated
// endorsement of a real person, and it's the kind of thing that gets a small
// brand sued rather than shared. So the seed content is authored in-house and
// says so, and `kind: "creator"` entries are added only once a collab is
// actually signed — at which point the maker of the edit supplies the picks.
//
// To add a real collab: add a Curator with kind "creator", their real handle
// and URL, then a CuratedEdit referencing it. Set `disclosure` to whatever the
// arrangement actually is — India's ASCI rules require paid and gifted
// partnerships to be labelled, and the UI renders this string verbatim.

import { ACCESSORY_DEFINITIONS } from "./vault-data";

export type Curator =
  | {
      kind: "house";
      id: string;
      name: string;
      /** What this desk is for, e.g. "Vault editorial". */
      role: string;
    }
  | {
      kind: "creator";
      id: string;
      name: string;
      /** Their handle, without the @. */
      handle: string;
      /** Their own profile or site. */
      url: string;
      bio: string;
      /** Rendered verbatim; required for paid or gifted collabs (ASCI). */
      disclosure: string;
    };

export type CuratedEdit = {
  id: string;
  title: string;
  curatorId: string;
  /** The premise of the edit, in one or two lines. */
  blurb: string;
  /** Canonical accessory names. Unknown names are dropped at read time. */
  pieces: string[];
  /** How to actually wear the set — the part a plain catalog can't give you. */
  stylingNote: string;
  /** Catalog vibes this edit lives in. */
  vibes: string[];
  /** Rough all-in cost of the set, stated as a band. */
  budget?: string;
};

export const CURATORS: Curator[] = [
  {
    kind: "house",
    id: "vault-desk",
    name: "The Vault",
    role: "In-house edit",
  },
];

/**
 * Seed edits, authored in-house. These are real curation — someone decided
 * these sets, and the reasoning is stated — they are simply not pretending to
 * come from anyone else.
 */
export const CURATED_EDITS: CuratedEdit[] = [
  {
    id: "first-three",
    title: "The first three pieces",
    curatorId: "vault-desk",
    blurb:
      "If you own nothing, this is the whole starting kit. One piece per location, one metal family, nothing that can be worn wrong.",
    pieces: ["Minimal Watch", "Thin Chain", "Subtle Ring"],
    stylingNote:
      "Wear all three at once and it still reads as restraint, because nothing here competes: the watch leads, the chain sits under a collar, the ring is a full stop. Keep everything silver-toned and you cannot make a mistake with it. Once you've worn this for a month you'll know whether you want more weight or less.",
    vibes: ["Minimal", "Clean Fit", "Smart Casual", "Business Casual"],
    budget: "₹4,000 – ₹15,000 for all three",
  },
  {
    id: "wedding-season",
    title: "Wedding season, without the costume",
    curatorId: "vault-desk",
    blurb:
      "Indian wedding season punishes both under- and over-dressing. This is the set that survives a sangeet and the office the following Monday.",
    pieces: ["Dress Watch", "Signet Ring", "Elegant Bracelet", "Cufflinks"],
    stylingNote:
      "The dress watch and the signet do the work; the bracelet is optional and the cufflinks only exist if you're in a shirt that has the holes for them. Gold-toned throughout if you're in warm fabrics — cream, beige, deep red — and silver if you're in cooler ones. Resist adding a chain on top: with a kurta collar it either disappears or fights the neckline.",
    vibes: ["Old Money", "Formal", "Luxury", "Preppy"],
    budget: "₹15,000 +",
  },
  {
    id: "all-black",
    title: "All black, no logos",
    curatorId: "vault-desk",
    blurb:
      "For people who dress in one colour on purpose. Blackened and gunmetal finishes, so the hardware reads as texture rather than jewellery.",
    pieces: ["Matte Chain", "Dark Ring", "Black Bracelet", "Tactical Watch"],
    stylingNote:
      "The trick with monochrome is that your accessories should change the surface, not the colour. Matte and blackened finishes add weight without adding a second palette. Skip anything polished — one shiny piece in this set is the only way to break it.",
    vibes: ["Techwear", "Goth", "Monochrome", "Edgy"],
    budget: "₹3,000 – ₹20,000",
  },
  {
    id: "one-chain-five-ways",
    title: "One chain, five outfits",
    curatorId: "vault-desk",
    blurb:
      "An argument for buying one good chain instead of three cheap ones — and the four other pieces that let it work across a whole week.",
    pieces: ["Simple Chain", "Casual Watch", "Leather Bracelet", "Classic Ring"],
    stylingNote:
      "A plain sterling chain is the single most versatile piece in menswear: under a tee it's texture, over one it's a statement, under a collar it's barely there. Rotate what you put beside it — leather for weekends, the watch alone for work — and the same chain reads differently five days running.",
    vibes: ["Casual", "Vintage", "Smart Casual", "Minimal"],
    budget: "₹5,000 – ₹18,000",
  },
];

/**
 * Open collaboration slots — rendered as invitations, not as content.
 *
 * These exist so the page shows what the programme is without needing a signed
 * creator to launch, and so the outreach ask is concrete when it happens.
 */
export const OPEN_COLLAB_SLOTS = [
  {
    id: "menswear-creator",
    label: "A menswear creator's edit",
    pitch:
      "Five pieces you'd actually wear, with your reasoning. We link your picks to the makers and credit you on every one.",
  },
  {
    id: "maker-takeover",
    label: "A maker's own edit",
    pitch:
      "One of the labels on our roster picks their favourite pieces — theirs and other people's — and says why.",
  },
] as const;

export const curatorById = (id: string) => CURATORS.find((c) => c.id === id);

/** Drop any piece that isn't in the catalog, so a typo can't render a dead card. */
export const editPieces = (edit: CuratedEdit) =>
  edit.pieces.filter((p) => p in ACCESSORY_DEFINITIONS);

export const editsByVibe = (vibe: string) =>
  CURATED_EDITS.filter((e) => e.vibes.includes(vibe));
