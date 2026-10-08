// The teaching layer.
//
// The rest of the app answers "what should I wear?". This answers the question
// underneath it — "why does any of this matter, and what are the actual rules?"
// — for someone who has never worn a chain and isn't sure men are allowed to.
//
// Every lesson here states a rule the app itself enforces in code, so the
// teaching and the tool can't drift apart. Where a lesson names a threshold
// (two per limb, one metal family, three formality steps), that number is the
// same one pairing-rules.ts checks. If a rule changes there, it changes here.

export type Lesson = {
  id: string;
  /** The question a beginner would actually type. */
  question: string;
  /** The rule, in one line, memorable enough to leave with. */
  rule: string;
  body: string[];
  /** Concrete right/wrong, because abstractions don't transfer. */
  example?: { right: string; wrong: string };
  /** Where in the app to go and use this. */
  next?: { label: string; to: string };
};

export const LESSONS: Lesson[] = [
  {
    id: "why",
    question: "Why bother with accessories at all?",
    rule: "Clothes cover you. Accessories are the only part of an outfit that reads as a decision.",
    body: [
      "Two men can wear the same white shirt and dark jeans, and one of them looks finished. The difference is almost never the clothes — it's that one of them is wearing a watch that suits his wrist and a chain that suits his collar, and the other is wearing nothing at all.",
      "This matters because a plain outfit is a neutral signal, and neutral is a wasted one. One well-chosen piece says you thought about how you'd look before you left. That's the whole mechanism. It doesn't require money, and it actively punishes buying a lot.",
    ],
    example: {
      right: "One watch, worn daily, that fits the width of your wrist.",
      wrong: "Four bracelets bought together because the set was discounted.",
    },
    next: { label: "Get one piece to start with", to: "/start" },
  },
  {
    id: "start",
    question: "I own nothing. What do I buy first?",
    rule: "Buy one piece you'll wear every day before you buy anything you'd wear occasionally.",
    body: [
      "The instinct is to buy something for the wedding you have in three weeks. Resist it. An occasion piece gets worn twice a year, which means you never learn how it feels or whether it suits you — and you'll buy the next one just as blindly.",
      "Start with a daily piece: a simple watch, or a thin chain that sits under a collar. Wear it for a month. You'll learn what weight you tolerate, whether you're a silver or gold person, and whether you actually like being someone who wears jewellery. Everything after that is an informed purchase.",
    ],
    example: {
      right: "A plain chain worn daily for a month, then a second piece that layers with it.",
      wrong: "A heavy statement ring bought for one event, worn once, in a drawer since.",
    },
    next: { label: "Four questions to your first piece", to: "/start" },
  },
  {
    id: "metals",
    question: "Can I mix silver and gold?",
    rule: "Pick one metal family and stay in it, until you're deliberately breaking the rule.",
    body: [
      "Silver, steel, white gold and gunmetal are cool metals. Yellow gold, brass and rose gold are warm ones. Cool with cool and warm with warm both read as intentional; one of each usually reads as an accident, because that's what it normally is — a gifted watch worn with a bought chain.",
      "Mixing metals well is a real technique, but it needs a piece that contains both metals to act as a bridge, and it needs the mix repeated rather than isolated. Until then, matching is the cheaper way to look deliberate.",
    ],
    example: {
      right: "Steel watch, silver chain, silver ring — one family, three pieces.",
      wrong: "Gold watch with a silver chain and no other warm metal anywhere.",
    },
    next: { label: "Check a combination", to: "/learn" },
  },
  {
    id: "how-many",
    question: "How much is too much?",
    rule: "Two pieces per limb is layering. Three is clutter.",
    body: [
      "Crowding happens per location, not per outfit. Two bracelets on one wrist is a stack; a watch plus two bracelets on the same wrist is a pile-up, and the watch — the most expensive thing there — stops being visible. Spread pieces across your body instead of loading one spot.",
      "The count that matters is what someone sees in one glance. A ring on each hand reads as two separate decisions. Three rings on one hand reads as a costume, unless that's precisely the look you're going for and the rest of the outfit agrees.",
    ],
    example: {
      right: "Watch on the left wrist, one bracelet on the right, one ring.",
      wrong: "Watch and two bracelets crowded on the same wrist.",
    },
  },
  {
    id: "formality",
    question: "How do I know if a piece suits the occasion?",
    rule: "Nothing you wear should be more than about three dress-code steps away from anything else.",
    body: [
      "Think of formality as a scale from gym clothes to black tie. A chunky street chain sits near the bottom; a slim dress watch sits near the top. Wear both together and you don't look versatile — you look like two outfits arguing.",
      "This is also why over-dressing is a mistake and not a safe default. A dress watch at a beach party is as wrong as a Cuban chain at a job interview; both tell people you misread the room. Match the register, then worry about the style.",
    ],
    example: {
      right: "Field watch with a flannel and boots — all mid-casual, all agreeing.",
      wrong: "Slim gold dress watch with a gym hoodie.",
    },
    next: { label: "See what an occasion actually allows", to: "/drawer" },
  },
  {
    id: "hero",
    question: "How do I put a look together?",
    rule: "One piece leads. Everything else agrees with it.",
    body: [
      "Choose the piece doing the most work — usually the largest, or the most expensive, or the one at the neck. That's the hero, and it sets the metal, the weight and the formality for everything else. The rest of what you wear exists to not argue with it.",
      "This is why a stack of individually good pieces can look bad together: nothing is leading, so nothing is subordinate, and the eye can't find the point. Pick the point yourself.",
    ],
    example: {
      right: "A heavy Cuban chain leading, with a plain band and a quiet watch supporting it.",
      wrong: "A heavy chain, a statement ring and a bold watch all competing at once.",
    },
    next: { label: "Browse the vibes", to: "/vibes" },
  },
  {
    id: "care",
    question: "Will cheap jewellery go green on me?",
    rule: "Buy sterling silver or steel for anything worn daily; save plating for pieces worn occasionally.",
    body: [
      "Plated brass is fine for a piece you wear a few times a year, and it's how you can afford to experiment. But Indian humidity and daily wear will take the plating off, and what's underneath will mark your skin. That's not a defect — it's the material doing what it does.",
      "For a daily piece, 925 sterling silver or stainless steel is the honest floor. Both survive sweat, both can be cleaned, and both cost more than plated brass for exactly that reason.",
    ],
    example: {
      right: "925 silver chain for every day; plated statement pieces for festivals.",
      wrong: "A plated chain worn daily through a Mumbai summer.",
    },
    next: { label: "Makers by budget", to: "/makers" },
  },
];

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);

/**
 * A small, deliberately clash-prone set for the interactive demo. Chosen so a
 * beginner poking at it will trip the metal rule, the crowding rule and the
 * formality rule within a few clicks — the rules teach faster when you cause
 * the failure yourself than when you read about it.
 */
export const DEMO_PIECES = [
  "Dress Watch",
  "Sporty Watch",
  "Cuban Chain",
  "Thin Chain",
  "Signet Ring",
  "Chunky Ring",
  "Leather Bracelet",
  "Beaded Bracelet",
  "Cufflinks",
];
