// The intake questionnaire — V1's stand-in for a recommendation engine.
//
// Four questions, because that is roughly how many a stranger will answer
// before leaving. They are chosen so each one narrows the catalog along an axis
// the app already reasons about:
//
//   looking  → category, which the maker roster and traits table both key on
//   occasion → an existing Occasion, so answers resolve through occasions.ts
//   wear     → formality band; a daily piece and a wedding piece differ here
//   owns     → whether to recommend a first piece or something that layers
//
// Nothing here calls a model. The questions produce a structured brief; the
// model in onboarding.functions.ts writes prose around it, and the app can
// still answer usefully if that call fails.
//
// Persistence mirrors lib/drawer.ts: one module-level store, read from
// localStorage in an effect (never during render, or SSR hydration mismatches),
// with subscribers so the nav and the results page cannot drift apart.

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { OCCASIONS } from "./occasions";
import type { PieceCat } from "./accessory-category";

const STORAGE_KEY = "vault-intake";
const SCHEMA_VERSION = 1;

export type LookingFor = PieceCat | "Unsure";
export type WearFrequency = "daily" | "weekly" | "occasions" | "first";
export type OwnsAlready = "none" | "few" | "several";

export type Intake = {
  looking: LookingFor;
  occasion: string; // Occasion slug
  wear: WearFrequency;
  owns: OwnsAlready;
};

export type IntakeState = {
  intake: Intake | null;
  /** False until storage has been read on the client. Gate UI on this. */
  ready: boolean;
};

// ── Question definitions ─────────────────────────────────────────────────
// Kept as data so the flow renders itself and adding a question is a one-line
// change rather than new JSX.

export type Choice<T extends string> = { value: T; label: string; hint?: string };

export const LOOKING_CHOICES: Choice<LookingFor>[] = [
  { value: "Chain", label: "A chain", hint: "Necklaces, pendants" },
  { value: "Ring", label: "A ring", hint: "Bands, signets" },
  { value: "Bracelet", label: "A bracelet", hint: "Cuffs, beads, leather" },
  { value: "Watch", label: "A watch", hint: "The one piece that always reads as effort" },
  { value: "Earring", label: "An earring", hint: "Studs, hoops, cuffs" },
  { value: "Unsure", label: "No idea yet", hint: "Perfectly normal — we'll pick for you" },
];

export const WEAR_CHOICES: Choice<WearFrequency>[] = [
  { value: "daily", label: "Every day", hint: "It has to survive a commute" },
  { value: "weekly", label: "Most weeks", hint: "Going out, not going to work" },
  { value: "occasions", label: "Occasions only", hint: "Weddings, festivals, events" },
  { value: "first", label: "This is my first piece", hint: "Start with one thing that can't go wrong" },
];

export const OWNS_CHOICES: Choice<OwnsAlready>[] = [
  { value: "none", label: "Nothing yet", hint: "Blank slate" },
  { value: "few", label: "One or two", hint: "A watch, maybe a chain" },
  { value: "several", label: "A fair few", hint: "I'm looking to fill gaps" },
];

/** Occasions, presented in the questionnaire's own order of everyday-ness. */
export const OCCASION_CHOICES: Choice<string>[] = OCCASIONS.map((o) => ({
  value: o.slug,
  label: o.label,
  hint: undefined,
}));

export const QUESTION_COUNT = 4;

/** How many answers are filled in — drives the progress indicator. */
export const answeredCount = (partial: Partial<Intake>) =>
  [partial.looking, partial.occasion, partial.wear, partial.owns].filter(Boolean).length;

export const isComplete = (partial: Partial<Intake>): partial is Intake =>
  answeredCount(partial) === QUESTION_COUNT;

// ── Store ───────────────────────────────────────────────────────────────

const EMPTY: IntakeState = { intake: null, ready: false };

let state: IntakeState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

const VALID_OCCASIONS = new Set(OCCASIONS.map((o) => o.slug));
const VALID_LOOKING = new Set(LOOKING_CHOICES.map((c) => c.value));
const VALID_WEAR = new Set(WEAR_CHOICES.map((c) => c.value));
const VALID_OWNS = new Set(OWNS_CHOICES.map((c) => c.value));

/** Validate on read: a stale or hand-edited value must not reach the engine. */
function read(): Intake | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number; intake?: Partial<Intake> };
    if (parsed?.version !== SCHEMA_VERSION || !parsed.intake) return null;

    const { looking, occasion, wear, owns } = parsed.intake;
    if (
      typeof looking !== "string" ||
      typeof occasion !== "string" ||
      typeof wear !== "string" ||
      typeof owns !== "string" ||
      !VALID_LOOKING.has(looking as LookingFor) ||
      !VALID_OCCASIONS.has(occasion) ||
      !VALID_WEAR.has(wear as WearFrequency) ||
      !VALID_OWNS.has(owns as OwnsAlready)
    ) {
      return null;
    }
    return {
      looking: looking as LookingFor,
      occasion,
      wear: wear as WearFrequency,
      owns: owns as OwnsAlready,
    };
  } catch {
    // Malformed JSON, or storage blocked entirely (Safari private mode).
    return null;
  }
}

function write(intake: Intake | null) {
  try {
    if (!intake) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, intake }));
  } catch {
    // Quota or private mode — keep in-memory state, accept it won't persist.
  }
}

function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = { intake: read(), ready: true };
  emit();
}

export function useIntake() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(loadOnce, []);

  const save = useCallback((intake: Intake) => {
    state = { intake, ready: true };
    write(intake);
    emit();
  }, []);

  const clear = useCallback(() => {
    state = { intake: null, ready: true };
    write(null);
    emit();
  }, []);

  return { intake: snapshot.intake, ready: snapshot.ready, save, clear };
}
