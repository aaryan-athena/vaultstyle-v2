// The guided tour — what the platform is, and where everything lives.
//
// The problem this solves: there are now thirteen routes and five distinct
// engines (vibe finder, occasions, mix & match, the drawer's gap analysis, the
// pairing checker), and nothing on the page explains that they relate to each
// other. A first-time visitor sees a search box and leaves.
//
// DESIGN NOTES
//
//  * Steps are cross-route on purpose. A tour that only covers the current page
//    can't answer "what is where", which is the actual question.
//  * `target` is a CSS selector resolved at run time, and a step whose target
//    never appears degrades to a centred card rather than dead-ending. That
//    matters because the desktop nav is hidden below `lg`, so a selector that
//    exists on a laptop may not exist on a phone.
//  * Anchors are `#id` where the page already had one, and `[data-tour="..."]`
//    where it didn't. Never a Tailwind class — those get refactored without
//    anyone thinking about the tour.
//
// Persistence mirrors lib/drawer.ts: one module-level store, read from
// localStorage in an effect (never during render, or SSR hydration mismatches),
// with subscribers so the launcher button and the overlay can't disagree.

import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "vault-tour";
const SCHEMA_VERSION = 1;

export type TourStep = {
  id: string;
  /** Route this step lives on. The tour navigates there first if needed. */
  route: string;
  /** CSS selector for the element to spotlight. Omit for a centred card. */
  target?: string;
  title: string;
  body: string;
  /** Preferred side to place the card on; it flips if there's no room. */
  placement?: "top" | "bottom";
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    route: "/",
    title: "Two minutes, and you'll know the whole platform",
    body: "The Vault answers one question: which accessories actually belong with what you wear — and which independent Indian maker to buy them from. There are a few different ways in, so here's the map.",
  },
  {
    id: "search",
    route: "/",
    target: '[data-tour="search"]',
    title: "Start with a vibe, or a whole sentence",
    body: "Type a look you already know — 'streetwear', 'old money' — and matches appear as you type. Or describe the situation in your own words and press Ask AI: 'rooftop party in Dubai, feels expensive' works fine.",
    placement: "bottom",
  },
  {
    id: "doors",
    route: "/",
    target: '[data-tour="doors"]',
    title: "Never worn jewellery? Skip the search",
    body: "These three are for people without a starting point. Start Here asks four questions and names one piece to buy first. Learn explains the rules from zero. Wishlist Match works your taste out from a shopping screenshot — we'll come back to that one.",
    placement: "bottom",
  },
  {
    id: "result",
    route: "/",
    target: "#result",
    title: "Your edit: one hero, then support",
    body: "Every vibe resolves into three tiers. The hero piece does most of the styling work, the recommended edit agrees with it, and add-ons are optional.",
    placement: "top",
  },
  {
    id: "where-to-buy",
    route: "/",
    target: "#result",
    title: "Under every piece: where to buy it",
    body: "'Where to buy' opens three tiers. Homegrown comes first — real Indian labels with a link to their own store. Then the luxury reference, if you want to know what the expensive version is. Then a plain Amazon or Myntra search, if that's simply where you shop. Prices are bands, never a promise; the seller's page is the only honest number.",
    placement: "top",
  },
  {
    id: "occasion",
    route: "/",
    target: "#occasion",
    title: "Occasions, because dress codes matter more than style",
    body: "Pick a real situation — a family wedding, a job interview, a condolence visit — and the same catalog gets filtered to what that occasion actually permits. It also shows what it deliberately left out, and why, so the rule transfers.",
    placement: "top",
  },
  {
    id: "mix",
    route: "/",
    target: "#mix",
    title: "Not one vibe? Blend two or three",
    body: "Pick up to three and Mix & Match merges their palettes, keeps one hero piece from each, and de-duplicates the rest into a single edit that's yours.",
    placement: "top",
  },
  {
    id: "wishlist",
    route: "/wishlist",
    target: '[data-tour="wishlist-upload"]',
    title: "Wishlist Match: skip the questions entirely",
    body: "Screenshot a wishlist, cart or order history from any store — Amazon, Flipkart, Myntra — and drop it here. It reads the clothes you're already saving up for and answers with accessories that go with them. It reads clothes, not jewellery, and the product names need to be legible. The image is processed once and never stored.",
    placement: "bottom",
  },
  {
    id: "makers",
    route: "/makers",
    target: '[data-tour="makers-roster"]',
    title: "The whole point: small Indian labels",
    body: "Studios in Jaipur, Mumbai and Bengaluru that can't outspend a marketplace for your attention, so they lead every recommendation instead. Filter by what they make and what you want to spend; links go to their own store, where they keep the margin.",
    placement: "top",
  },
  {
    id: "curated",
    route: "/curated",
    target: '[data-tour="curated-edits"]',
    title: "Curated Edits: whole sets, already decided",
    body: "Four pieces or fewer, chosen to work together, with the reasoning attached — the first three pieces to own, wedding season, all black. Useful when you don't want to assemble anything yourself.",
    placement: "top",
  },
  {
    id: "learn",
    route: "/learn",
    target: "#checker",
    title: "The rules, and a checker that proves them",
    body: "Six rules cover most of men's accessorising — one metal family, two pieces per limb, match the formality. Build a deliberately bad combination here and it tells you what's wrong and how to fix it. Same engine the rest of the site uses.",
    placement: "top",
  },
  {
    id: "accessories",
    route: "/accessories",
    target: '[data-tour="accessory-grid"]',
    title: "Tell it what you own",
    body: "The glossary defines every piece in the catalog, and each card has an '+ I own this' toggle. Tap the ones you already have — it's stored in your browser only, never sent anywhere.",
    placement: "top",
  },
  {
    id: "drawer",
    route: "/drawer",
    target: '[data-tour="drawer-body"]',
    title: "My Drawer: what to buy next, and why",
    body: "This is the payoff for marking things owned. It works out which vibes you can already pull off, which ones you're one piece away from, and which single purchase unlocks the most new looks. The count next to My Drawer in the header is how many pieces you've marked.",
    placement: "top",
  },
  {
    id: "finish",
    route: "/start",
    title: "That's the tour",
    body: "You're on Start Here now — four questions and you'll have a brief with one piece to buy first. Everything else lives in the header, or the footer if it isn't there. Reopen this tour any time from the ? button.",
  },
];

export type TourState = {
  /** True once the tour has been completed or dismissed at least once. */
  seen: boolean;
  active: boolean;
  index: number;
  /** False until storage has been read on the client. Gate UI on this. */
  ready: boolean;
};

const EMPTY: TourState = { seen: false, active: false, index: 0, ready: false };

let state: TourState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

function readSeen(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { version?: number; seen?: boolean };
    return parsed?.version === SCHEMA_VERSION && parsed.seen === true;
  } catch {
    // Malformed JSON, or storage blocked entirely (Safari private mode).
    return false;
  }
}

function writeSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, seen: true }));
  } catch {
    // Quota or private mode — the session still works, it just re-offers later.
  }
}

function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = { ...state, seen: readSeen(), ready: true };
  emit();
}

const commit = (next: Partial<TourState>) => {
  state = { ...state, ...next };
  emit();
};

export function useTour() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(loadOnce, []);

  const start = useCallback((index = 0) => commit({ active: true, index }), []);

  /** Ends the tour and records it, so the first-visit prompt stops appearing. */
  const end = useCallback(() => {
    writeSeen();
    commit({ active: false, index: 0, seen: true });
  }, []);

  const next = useCallback(() => {
    if (state.index >= TOUR_STEPS.length - 1) {
      writeSeen();
      commit({ active: false, index: 0, seen: true });
      return;
    }
    commit({ index: state.index + 1 });
  }, []);

  const back = useCallback(() => {
    commit({ index: Math.max(0, state.index - 1) });
  }, []);

  const goTo = useCallback((index: number) => {
    commit({ index: Math.min(Math.max(0, index), TOUR_STEPS.length - 1) });
  }, []);

  /** Records the prompt as answered without running the tour. */
  const dismiss = useCallback(() => {
    writeSeen();
    commit({ seen: true, active: false });
  }, []);

  return {
    ...snapshot,
    step: TOUR_STEPS[snapshot.index],
    total: TOUR_STEPS.length,
    start,
    end,
    next,
    back,
    goTo,
    dismiss,
  };
}
