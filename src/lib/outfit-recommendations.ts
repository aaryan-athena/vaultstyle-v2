export type Outfit = {
  id: string;
  name: string;
  blurb: string;
  palette: string[];
};

export type Piece = {
  name: string;
  category: "Earrings" | "Necklace" | "Bracelet" | "Ring" | "Brooch";
  detail: string;
  metal: string;
};

export type Recommendation = {
  mood: string;
  story: string;
  pieces: Piece[];
};

export const OUTFITS: Outfit[] = [
  { id: "little-black-dress", name: "Little Black Dress", blurb: "An evening classic, sharp and timeless.", palette: ["#0a0a0a", "#1a1a1a", "#c9a84c"] },
  { id: "white-linen", name: "White Linen Set", blurb: "Sun-drenched, breezy, effortlessly luxe.", palette: ["#faf6ee", "#e8e0cf", "#b89968"] },
  { id: "denim-tee", name: "Denim & White Tee", blurb: "Everyday uniform, quietly elevated.", palette: ["#3a5f7d", "#ffffff", "#d4af7a"] },
  { id: "silk-saree", name: "Silk Saree", blurb: "Heritage drape, festive and regal.", palette: ["#7a1f2b", "#c9a84c", "#f4e7c1"] },
  { id: "power-suit", name: "Tailored Power Suit", blurb: "Boardroom presence with a quiet edge.", palette: ["#1f2a37", "#4a5568", "#e5e7eb"] },
  { id: "boho-maxi", name: "Boho Maxi Dress", blurb: "Wandering spirit, layered textures.", palette: ["#9b6b3f", "#d49a5a", "#e8c8a0"] },
  { id: "cocktail-jumpsuit", name: "Cocktail Jumpsuit", blurb: "After-dark glamour, sleek lines.", palette: ["#2c1f3d", "#6b4a8f", "#d8b4f8"] },
  { id: "bridal-lehenga", name: "Bridal Lehenga", blurb: "The most important day, dressed in light.", palette: ["#a51d2d", "#e8b923", "#fce8a4"] },
];

export const RECOMMENDATIONS: Record<string, Recommendation> = {
  "little-black-dress": {
    mood: "Quiet drama",
    story: "Let one piece speak. A sculptural drop earring, a bare neckline, and the room turns.",
    pieces: [
      { name: "Cascade Drop Earrings", category: "Earrings", detail: "Faceted onyx with diamond pavé", metal: "18k White Gold" },
      { name: "Solitaire Tennis Bracelet", category: "Bracelet", detail: "Single line of round brilliants", metal: "Platinum" },
      { name: "Signet Ring", category: "Ring", detail: "Polished oval, monogram-ready", metal: "18k Yellow Gold" },
    ],
  },
  "white-linen": {
    mood: "Sunlit minimal",
    story: "Warm gold against fresh linen — the jewellery equivalent of a citrus aperitivo.",
    pieces: [
      { name: "Huggie Hoops", category: "Earrings", detail: "Brushed satin finish", metal: "14k Yellow Gold" },
      { name: "Layered Chain Necklace", category: "Necklace", detail: "Two strands, paperclip and rope", metal: "18k Vermeil" },
      { name: "Coin Charm Bracelet", category: "Bracelet", detail: "Hand-stamped medallion", metal: "Recycled Gold" },
    ],
  },
  "denim-tee": {
    mood: "Quietly elevated",
    story: "Small, considered pieces. Nothing tries too hard — and that is the trick.",
    pieces: [
      { name: "Stud Earrings", category: "Earrings", detail: "3mm freshwater pearls", metal: "14k Gold Posts" },
      { name: "Pendant Necklace", category: "Necklace", detail: "Single bezel-set diamond", metal: "14k Yellow Gold" },
      { name: "Stacking Rings", category: "Ring", detail: "Set of three plain bands", metal: "Mixed Metals" },
    ],
  },
  "silk-saree": {
    mood: "Heritage opulence",
    story: "Lean into the festival. Temple work, deep emeralds, and the weight of generations.",
    pieces: [
      { name: "Jhumka Earrings", category: "Earrings", detail: "Temple bells with pearl drops", metal: "22k Gold" },
      { name: "Choker & Long Haar Set", category: "Necklace", detail: "Kundan with uncut diamonds", metal: "22k Gold" },
      { name: "Bangle Stack", category: "Bracelet", detail: "Seven enamelled bangles", metal: "22k Gold & Meenakari" },
      { name: "Maang Tikka", category: "Brooch", detail: "Polki centerpiece", metal: "22k Gold" },
    ],
  },
  "power-suit": {
    mood: "Quiet authority",
    story: "Architecture for the body. Sharp angles, brushed surfaces, nothing that jangles.",
    pieces: [
      { name: "Bar Earrings", category: "Earrings", detail: "Brushed linear drop", metal: "Sterling Silver" },
      { name: "Chain Link Necklace", category: "Necklace", detail: "Mariner link, mid-weight", metal: "18k White Gold" },
      { name: "Cuff Bracelet", category: "Bracelet", detail: "Hammered open cuff", metal: "Platinum-Plated" },
    ],
  },
  "boho-maxi": {
    mood: "Wandering warmth",
    story: "Layer it on. Turquoise, hammered gold, and a story for every charm.",
    pieces: [
      { name: "Threader Earrings", category: "Earrings", detail: "Turquoise & coral beads", metal: "Brushed Gold" },
      { name: "Long Pendant Necklace", category: "Necklace", detail: "Tigereye with tassel", metal: "Antiqued Brass" },
      { name: "Wrap Bracelet", category: "Bracelet", detail: "Leather with stone inlays", metal: "Mixed" },
      { name: "Stacking Rings", category: "Ring", detail: "Five textured bands", metal: "Yellow Gold" },
    ],
  },
  "cocktail-jumpsuit": {
    mood: "After-dark glamour",
    story: "Catch the light. Let earrings do the work and keep wrists clean.",
    pieces: [
      { name: "Chandelier Earrings", category: "Earrings", detail: "Amethyst & diamond cascade", metal: "18k White Gold" },
      { name: "Cocktail Ring", category: "Ring", detail: "Cushion-cut tanzanite, halo set", metal: "Platinum" },
      { name: "Delicate Anklet", category: "Bracelet", detail: "Fine chain with bezel stones", metal: "14k Gold" },
    ],
  },
  "bridal-lehenga": {
    mood: "Generational radiance",
    story: "Every piece earns its place. Layer with intention; this is the photograph that lasts.",
    pieces: [
      { name: "Chandbali Earrings", category: "Earrings", detail: "Polki with emerald drops", metal: "22k Gold" },
      { name: "Rani Haar Necklace", category: "Necklace", detail: "Multi-layered polki & pearl", metal: "22k Gold" },
      { name: "Kada Bangles", category: "Bracelet", detail: "Pair of broad temple kadas", metal: "22k Gold" },
      { name: "Statement Ring", category: "Ring", detail: "Uncut diamond cluster", metal: "22k Gold" },
      { name: "Maang Tikka & Nath", category: "Brooch", detail: "Matching bridal set", metal: "22k Gold & Pearl" },
    ],
  },
};
