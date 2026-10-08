// The Drawer — what the user owns, held in this browser only.
//
// This module is the single boundary for that state: no other file touches
// localStorage for it. Swapping to a real backend later means changing `read`
// and `write` here, not chasing storage calls through components.
//
// Two hazards this file exists to contain:
//
//  1. SSR/hydration. The server has no localStorage, so the first client render
//     must agree with the server's empty snapshot. Reading storage during
//     render would produce a hydration mismatch, so the load happens in an
//     effect and callers gate on `ready`.
//  2. Cross-component sync. The nav count, the glossary toggles and the drawer
//     page all read the same state, so it lives in one module-level store with
//     subscribers rather than per-component useState copies that drift apart.

import { useCallback, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { ACCESSORY_DEFINITIONS } from "./vault-data";

const STORAGE_KEY = "vault-drawer";
const SCHEMA_VERSION = 1;

/** Reserved for the saved-looks feature; persisted now so the shape is stable. */
export type SavedLook = {
  id: string;
  name: string;
  items: string[];
  createdAt: number;
};

type Persisted = {
  version: number;
  owned: string[];
  looks: SavedLook[];
};

export type DrawerState = {
  owned: ReadonlySet<string>;
  looks: readonly SavedLook[];
  /** False until storage has been read on the client. Gate UI on this. */
  ready: boolean;
};

const EMPTY: DrawerState = { owned: new Set(), looks: [], ready: false };

let state: DrawerState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

function read(): { owned: string[]; looks: SavedLook[] } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { owned: [], looks: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (parsed?.version !== SCHEMA_VERSION) return { owned: [], looks: [] };

    // Drop anything that no longer exists in the catalog, so a stale drawer
    // can't surface a deleted accessory or poison the gap analysis.
    const owned = Array.isArray(parsed.owned)
      ? parsed.owned.filter((n): n is string => typeof n === "string" && n in ACCESSORY_DEFINITIONS)
      : [];
    const looks = Array.isArray(parsed.looks)
      ? parsed.looks.filter(
          (l): l is SavedLook =>
            !!l && typeof l.id === "string" && typeof l.name === "string" && Array.isArray(l.items),
        )
      : [];
    return { owned, looks };
  } catch {
    // Malformed JSON, or storage blocked entirely (Safari private mode).
    return { owned: [], looks: [] };
  }
}

function write(next: DrawerState) {
  try {
    const payload: Persisted = {
      version: SCHEMA_VERSION,
      owned: [...next.owned],
      looks: [...next.looks],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or storage unavailable — keep the in-memory state so the
    // session still works, and accept that it won't survive a reload.
  }
}

/** Read storage once per page load. Safe to call repeatedly. */
function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const { owned, looks } = read();
  state = { owned: new Set(owned), looks, ready: true };
  emit();
}

function commit(next: DrawerState) {
  state = next;
  write(next);
  emit();
}

export function useDrawer() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(loadOnce, []);

  const toggle = useCallback((name: string) => {
    const owned = new Set(state.owned);
    if (owned.has(name)) owned.delete(name);
    else owned.add(name);
    commit({ ...state, owned, ready: true });
  }, []);

  const remove = useCallback((name: string) => {
    if (!state.owned.has(name)) return;
    const owned = new Set(state.owned);
    owned.delete(name);
    commit({ ...state, owned, ready: true });
  }, []);

  const clear = useCallback(() => {
    commit({ ...state, owned: new Set(), ready: true });
  }, []);

  const isOwned = useCallback((name: string) => snapshot.owned.has(name), [snapshot]);

  return {
    owned: snapshot.owned,
    looks: snapshot.looks,
    ready: snapshot.ready,
    count: snapshot.owned.size,
    isOwned,
    toggle,
    remove,
    clear,
  };
}
