# VAULT — Change log

## Summary

VAULT has gained a personalisation layer. Until now every visitor saw identical
content and the app had no opinions: it described what an aesthetic contains but
never told anyone what *they* should do next, and never told anyone they were
wrong. It was, structurally, a browsable catalog.

This change adds two things the platform never had — **knowledge of what the user
owns**, and **judgements about combinations** — which together turn the same
55-piece catalog into a purchasing advisor and a teacher. No backend was added;
both are pure logic over data that already existed.

- **Baseline** described below is commit `97b3d3a`, which already included the
  earring expansion and the legibility system.
- **New work** is the advisor layer: 8 new files, 4 modified.

---

## What was already there (baseline, `97b3d3a`)

### Discovery
| Feature | Detail |
|---|---|
| Vibe taxonomy | 22 named aesthetics, each with definition, outfit class (Casual/Formal), metal palette, and three ranked accessory tiers — hero / recommended / add-ons |
| Lexical search | Client-side weighted token scorer across five indexed fields (name 40, outfit class 20, palette 18, accessories 15, definition 10) |
| AI natural-language search | Groq / Llama 3.3 70B behind a Zod schema gate **and** a catalog whitelist, so the model can interpret freely but can never invent a vibe that becomes a clickable link |
| Vibe blending | Combine 2–3 vibes into a derived edit, preserving one hero piece per source vibe |

### Catalog
| Dataset | Records |
|---|---|
| Vibes | 22 |
| Accessory classes | 55 across 7 families (chains, rings, watches, bracelets, earrings, cufflinks, neckwear) |
| Product options | 165 — three price tiers per piece, as constructed Amazon/Myntra deep links (nothing scraped, nothing to go stale) |
| Garments | 90 across all 22 vibes |
| Metal swatches | 11 |
| Imagery | 55 accessory photos + 22 vibe flat lays, 1024², bundled and content-hashed |

Also present: a reverse index from each accessory to every vibe recommending it,
and a morphological normaliser collapsing label variants ("shell/pearl
necklaces", plurals, adjectival forms) onto canonical keys.

### Editorial & chrome
Accessory glossary with category filter and search · Lookbook (22 plates) ·
Journal (6 entries) · The Method · Founder · dark/light theming · SSR ·
`panel` / `panel-solid` legibility system over the fixed hero background.

### What the baseline could not do
Remember anything about the user, know what they own, judge a combination, or
answer "what should I buy next".

---

## New in this change

### 1. The Drawer — what you own

[`src/lib/drawer.ts`](../src/lib/drawer.ts) · [`src/routes/drawer.tsx`](../src/routes/drawer.tsx)

Tap **"I own this"** on any piece in the glossary and it lands in your drawer.
This is the keystone — three of the other features are meaningless without it.

Implementation notes worth knowing:

- **One storage boundary.** No other file touches drawer storage. Swapping to a
  real backend later means changing `read`/`write` in that one module, not
  chasing `localStorage` calls through components.
- **Cross-component sync** via `useSyncExternalStore` over a module-level store,
  so the nav badge, the glossary toggles and the drawer page cannot drift apart.
- **SSR-safe by construction.** `getServerSnapshot` returns an empty state and
  the storage read happens in an effect, so the server markup and the first
  client paint agree. Callers gate on `ready`.
- **Stale keys rejected on read**, so a drawer saved before a catalog change
  can't surface a deleted accessory or poison the gap analysis.
- Storage failures (Safari private mode, quota) degrade to "nothing owned"
  rather than throwing.

### 2. Complete the Set — what to buy next

[`src/lib/gap-analysis.ts`](../src/lib/gap-analysis.ts)

Ranks every piece you *don't* own by what acquiring it would actually do for
your collection — how many vibes it makes wearable, then how much coverage it
adds. Each suggestion carries its existing three price tiers, which is the shift
from stylist to purchasing advisor.

Real output for a drawer holding only a dress watch:

> **Signet Ring** — unlocks Old Money, Formal, Preppy, Summer Linen

Also derives **near misses** ("Y2K is 1 piece away — add a flashy chain") and
**dormant pieces** — owned items not yet supporting any wearable vibe. That last
one is a no-logging stand-in for wear tracking: it asks whether a piece is doing
work, rather than asking you to record every time you wear something.

### 3. Occasion Finder — when formality actually matters

[`src/lib/occasions.ts`](../src/lib/occasions.ts)

Twelve real occasions — job interview, client meeting, college presentation,
date night, family wedding, festival/Diwali, house party, casual Friday,
airport/travel, beach holiday, gym-to-street, condolence. Each declares a dress
code **floor and ceiling**, because overdressing is its own mistake.

The same catalog answers differently:

| Occasion | Returns |
|---|---|
| Condolence / funeral | Dress Watch, Sleek Watch, Cufflinks, Elegant Ring, Clean Chain… |
| Gym to street | Smartwatch, Cuban Chain, Sporty Bracelet, Chunky Ring, Hoop Earring… |

Rejected pieces are kept and shown under **"Leave at home"** with the reason, so
the exclusion teaches as much as the inclusion. Resolution reuses the existing
`blendVibes()` — no new AI call, no new data.

### 4. Conflict engine — the rule, once

[`src/lib/pairing-rules.ts`](../src/lib/pairing-rules.ts) ·
[`src/lib/accessory-traits.ts`](../src/lib/accessory-traits.ts)

The differentiator. A catalog lists what exists; a stylist tells you your silver
chain is fighting your gold watch **and why**. Every finding returns a `why` and
a `fix`, phrased to transfer to outfits the app has never seen.

| Rule | Severity | Fires on |
|---|---|---|
| Metal mismatch | clash | Cool metals (Silver/Gunmetal/Chrome) mixed with warm (Gold/Rose Gold) |
| Two different dress codes | clash | Formality spread ≥ 3 across the look |
| Weight clash | caution | A statement piece beside a delicate one on hand or wrist |
| Slot crowding | caution | More than two pieces in one slot |
| Seasonal note | note | Leather in monsoon (Jun–Sep), heavy metal in peak summer (Mar–May) |

Deliberately conservative — a false alarm teaches a wrong rule, which is worse
than staying quiet. Rules only fire on combinations that are actually wrong, not
merely unusual. Verified: a sound pairing (minimal ring + clean chain) returns
clear rather than inventing a problem.

Enabled by a new hand-authored traits table — `slot`, `metal`, `material`,
`weight`, `formality` for all 55 pieces, with a dev-only drift guard warning if
a new accessory arrives without traits.

Surfaced in three places: on the blended-vibe edit (so the mixer now gives
feedback), against your own pieces for a chosen occasion, and as a
pick-up-to-five checker on `/drawer`.

---

## A bug worth recording

The first version of `rankAcquisitions` **returned an identical list for an empty
drawer and a stocked one**, with every piece reporting "unlocks 0" — the advice
wasn't personal at all.

The cause was the unlock threshold: "hero piece + 50% of the edit". Vibes carry
5–7 pieces, so no single purchase could ever cross that line, and the ranking
silently degraded into a static popularity list (the pieces appearing in the most
vibes) rather than advice.

The model now matches the thesis the platform already states on The Method page —
the hero does about 70% of the styling work — so a vibe is wearable at **hero
piece + one supporting piece**. Single purchases became decisive and the output
is now drawer-specific. This is why `VibeCoverage` carries `toUnlock` and
`unlockNeeds` rather than only a raw percentage.

---

## Deliberately not built

From the ten features proposed, six were cut or reframed:

| Proposal | Decision |
|---|---|
| Photo upload for "complete the set" | Cut the upload; a tap-to-own checklist is more accurate and instant. Vision adds file handling, storage, a multimodal call, and misidentification handling — and the user still has to correct it. |
| Style fingerprinting after 10–15 sessions | Deferred. Needs accounts and gives a first-time visitor nothing. The Drawer delivers the same "knows my taste" effect on visit one, computed rather than learned. |
| Wear-frequency logging | Reframed as dormant pieces. True logging needs daily user discipline that won't hold. |
| Weather API for seasonal rotation | Reframed as month-derived notes. A live temperature reading wouldn't sharpen advice about monsoon humidity. |
| Share a look as an image | Deferred. Canvas export is blocked by cross-origin taint — garment photos are hotlinked from Unsplash. A URL-encoded look is trivial by comparison and equally shareable. |
| Outfit rating · stylist leaderboard | Deferred. Both need a backend, accounts, moderation, and a user base. |

Cheap follow-ups now unblocked: saved/named looks ("Interview outfit") — the
persisted shape is already reserved — and a shareable look URL.

---

## Verification status

Passing: `npx tsc --noEmit` clean · `npm run build` clean · ESLint clean on all
new files · trait table covers all 55 accessories with no orphans · rule engine
probed directly (each rule fires on its intended case, stays silent on sound
pairings, and seasonal notes respect the month) · SSR checked by fetching
rendered HTML — `/`, `/drawer` and `/accessories` all return 200 with expected
markup, and `/drawer` correctly serves its pre-hydration gate.

**Not verified:** the interactive click-through. There is no browser automation
in the build environment, so *"toggle owned → hard reload → still owned"* and
*"no hydration warning in console"* were reasoned about, not observed. Worth a
two-minute manual pass in `npm run dev`.

`npm run lint` reports ~539 pre-existing Prettier errors on untouched lines,
unrelated to this change.

**Known limitation:** the drawer is per-device and per-browser. This is stated in
the UI on `/drawer` so it doesn't become a support question, and it marks where
cross-device sync would land later.

---

## File manifest

**New**

| File | Purpose |
|---|---|
| `src/lib/accessory-category.ts` | Category + body-slot derivation, lifted out of the glossary route where it was trapped |
| `src/lib/accessory-traits.ts` | Hand-authored traits for 55 pieces + drift guard |
| `src/lib/drawer.ts` | Sole storage boundary; `useDrawer()` hook |
| `src/lib/gap-analysis.ts` | Vibe coverage, acquisition ranking, near misses, dormant pieces |
| `src/lib/occasions.ts` | 12 occasions and their resolution against the catalog and the drawer |
| `src/lib/pairing-rules.ts` | The five conflict rules and the look verdict |
| `src/components/Drawer.tsx` | `OwnToggle`, `ConflictList`, `LookCheck`, empty state |
| `src/routes/drawer.tsx` | The `/drawer` hub |

**Modified**

| File | Change |
|---|---|
| `src/routes/accessories.tsx` | Own-it toggle per card; imports the lifted category helper instead of defining it |
| `src/routes/index.tsx` | New Occasions section, conflict check on the blended edit, section-nav entry |
| `src/components/SiteChrome.tsx` | `My Drawer` nav link with live owned count, footer link |
| `src/routeTree.gen.ts` | Regenerated for the new route |
