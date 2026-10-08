// Category derivation from a canonical accessory name.
// Lifted out of routes/accessories.tsx — the drawer, gap analysis and pairing
// rules all need the same classification, so it can only live in one place.

export const CATEGORIES = ["All", "Chain", "Ring", "Watch", "Bracelet", "Earring", "Other"] as const;
export type Cat = (typeof CATEGORIES)[number];

/** Categories a piece can actually be (everything except the "All" filter pseudo-value). */
export type PieceCat = Exclude<Cat, "All">;

export function categorize(name: string): PieceCat {
  const n = name.toLowerCase();
  // Earrings first — "Cross Earring" would otherwise be swallowed by the chain
  // rule, and every earring contains the substring "ring".
  if (n.includes("earring")) return "Earring";
  if (n.includes("chain") || n.includes("necklace") || n.includes("pendant")) return "Chain";
  if (n.includes("ring")) return "Ring";
  if (n.includes("watch")) return "Watch";
  if (n.includes("bracelet")) return "Bracelet";
  return "Other";
}

/** Where on the body a piece is worn — drives the slot-crowding pairing rule. */
export type Slot = "neck" | "wrist" | "finger" | "ear" | "cuff";

const CAT_TO_SLOT: Record<PieceCat, Slot> = {
  Chain: "neck",
  Ring: "finger",
  Watch: "wrist",
  Bracelet: "wrist",
  Earring: "ear",
  Other: "cuff",
};

export const slotFor = (name: string): Slot => CAT_TO_SLOT[categorize(name)];
