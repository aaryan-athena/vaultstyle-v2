import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { HelpCircle, X } from "lucide-react";
import { TOUR_STEPS, useTour } from "@/lib/tour";

/**
 * The tour overlay. Mounted once in __root.tsx so a step can point at anything
 * on any route.
 *
 * Two things make this harder than a static tooltip, and most of the code below
 * is one or the other:
 *
 *  1. The target may not exist yet. Steps navigate between routes, so after a
 *     route change the element appears asynchronously. We poll briefly rather
 *     than guess a timeout, and fall back to a centred card if it never shows —
 *     which is also what happens on a phone for a desktop-only target.
 *  2. The target moves. Scrolling it into view changes its rect, and so does a
 *     resize, so the rect is re-measured on both.
 */

/** Breathing room around the spotlight, in px. */
const PAD = 8;
/** How long to wait for a step's target to appear before centring instead. */
const TARGET_TIMEOUT_MS = 1600;
/**
 * A target taller than this fraction of the viewport is "tall" — several tour
 * targets are whole page sections, and one is a grid 40,000px high. Ringing the
 * true bounds of those puts the highlight off-screen in both directions, so the
 * dimming reads as a bug. Tall targets get scrolled to their top and
 * spotlighted a viewport-slice deep instead.
 */
const TALL_RATIO = 0.7;
/** A tall target's slice never shrinks below this, even to make room. */
const MIN_TALL_SLICE = 0.28;

type Rect = { top: number; left: number; width: number; height: number };

/**
 * Intersect the target with the viewport, capping tall targets to a slice.
 *
 * For a tall target the slice height is arbitrary — the whole section is the
 * subject, and we're only choosing how much of it to ring — so it's sized to
 * leave room for the card underneath rather than to a fixed fraction. That is
 * what stops the card from being centred on top of what it's describing.
 */
function spotlightRect(rect: Rect, vw: number, vh: number, cardH: number): Rect | null {
  const tall = rect.height > vh * TALL_RATIO;

  const top = Math.max(12, rect.top - PAD);
  const left = Math.max(8, rect.left - PAD);
  const right = Math.min(vw - 8, rect.left + rect.width + PAD);

  const roomForCard = cardH ? vh - cardH - 36 : vh - 12;
  const bottom = tall
    ? Math.max(top + vh * MIN_TALL_SLICE, Math.min(vh - 12, roomForCard))
    : Math.min(vh - 12, rect.top + rect.height + PAD);

  const width = right - left;
  const height = bottom - top;
  if (width <= 0 || height <= 0) return null;
  return { top, left, width, height };
}

export function TourOverlay() {
  const { active, ready, index, step, total, next, back, end, goTo } = useTour();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });

  const [rect, setRect] = useState<Rect | null>(null);
  const [settled, setSettled] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // The card's own height, measured rather than assumed. It varies a lot —
  // 280px on a desktop, 360px on a narrow phone where the same copy wraps to
  // more lines — and positioning against a guessed height is what pushes the
  // card off the bottom of a small screen.
  const [cardH, setCardH] = useState(0);
  useEffect(() => {
    const el = cardRef.current;
    if (!active || !el || typeof ResizeObserver === "undefined") return;
    // getBoundingClientRect, not entry.contentRect: contentRect excludes the
    // card's own padding, which under-reports its real height by ~48px and is
    // enough to push the card off the bottom of a phone.
    const sync = () => setCardH(el.getBoundingClientRect().height);
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [active, index, settled]);

  // Route the step needs. Navigation is a side effect of the step changing,
  // not of rendering, so it lives in an effect.
  useEffect(() => {
    if (!active || !step) return;
    if (pathname !== step.route) {
      navigate({ to: step.route });
    }
  }, [active, step, pathname, navigate]);

  // Find and measure the target, retrying while the new route mounts.
  useEffect(() => {
    if (!active || !step) return;

    setSettled(false);
    setRect(null);

    if (!step.target) {
      setSettled(true);
      return;
    }
    // Don't hunt for a target that belongs to a route we haven't reached yet.
    if (pathname !== step.route) return;

    let raf = 0;
    let cancelled = false;
    const deadline = Date.now() + TARGET_TIMEOUT_MS;

    const measure = (el: Element) => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const attempt = () => {
      if (cancelled) return;
      const el = document.querySelector(step.target!);

      if (el) {
        // Scroll before measuring, so the card is positioned against where the
        // element ends up rather than where it started.
        //
        // `start` rather than `center` for tall targets (centring a page-length
        // section shows only its middle) and on short viewports — on a phone,
        // a centred target splits the remaining space into two gaps too small
        // for the card, and it ends up covering what it's describing.
        // Always `start`, never `center`: centring a target splits the leftover
        // space into two gaps, and on anything shorter than a desktop monitor
        // neither gap fits the card, so it ends up centred over the very thing
        // it is pointing at. Top-aligning keeps the whole lower half free.
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Two frames of settle time for the smooth scroll, then measure and
        // keep measuring until it stops moving.
        let lastTop: number | null = null;
        let stableFrames = 0;
        const track = () => {
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          if (lastTop !== null && Math.abs(r.top - lastTop) < 0.5) stableFrames += 1;
          else stableFrames = 0;
          lastTop = r.top;
          measure(el);
          if (stableFrames < 3 && Date.now() < deadline + 800) raf = requestAnimationFrame(track);
          else setSettled(true);
        };
        raf = requestAnimationFrame(track);
        return;
      }

      if (Date.now() > deadline) {
        // Never appeared — show the step as a centred card instead of stalling.
        setRect(null);
        setSettled(true);
        return;
      }
      raf = requestAnimationFrame(attempt);
    };

    attempt();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, step, pathname]);

  // Keep the spotlight glued to the target through scroll and resize.
  useEffect(() => {
    if (!active || !step?.target || !settled) return;
    const onMove = () => {
      const el = document.querySelector(step.target!);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  }, [active, step, settled]);

  // Keyboard: Escape exits, arrows step. Registered while the tour is open so
  // it can't interfere with the rest of the app.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); end(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, end, next, back]);

  // Move focus into the card when a step opens, so the tour is operable from
  // the keyboard and announced by a screen reader.
  useLayoutEffect(() => {
    if (active && settled) nextRef.current?.focus({ preventScroll: true });
  }, [active, settled, index]);

  if (!ready || !active || !step) return null;

  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const spot =
    rect && rect.width > 0 && rect.height > 0 ? spotlightRect(rect, vw, vh, cardH) : null;

  // Place the card clear of the spotlight, on whichever side has room for the
  // card's real height. If neither side does — a short viewport, a tall
  // spotlight — centre it and accept overlapping the dim area, which still
  // reads correctly because the card is opaque.
  const GAP = 12;
  const h = cardH || 300;
  let cardStyle: React.CSSProperties = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  if (spot) {
    const spotBottom = spot.top + spot.height;
    const roomBelow = vh - spotBottom - GAP;
    const roomAbove = spot.top - GAP;
    // Just needs to physically fit; the placement below already clamps into
    // the viewport, so demanding extra slack only forces the centred fallback.
    const fitsBelow = roomBelow >= h + 4;
    const fitsAbove = roomAbove >= h + 4;
    const prefersAbove = step.placement === "top";

    const placeAbove = prefersAbove ? fitsAbove : !fitsBelow && fitsAbove;
    const placeBelow = placeAbove ? false : fitsBelow;

    if (placeAbove) {
      cardStyle = { top: Math.max(12, spot.top - GAP - h), left: "50%", transform: "translateX(-50%)" };
    } else if (placeBelow) {
      cardStyle = { top: spotBottom + GAP, left: "50%", transform: "translateX(-50%)" };
    }
    // else: keep the centred default
  }

  const isLast = index === total - 1;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Dimmer. One transparent box over the target with an enormous spread
          shadow darkens everything except the target — cheaper and crisper than
          an SVG mask, and it stays a single compositor layer. */}
      {spot ? (
        <div
          aria-hidden
          className="absolute pointer-events-auto rounded-sm transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: "0 0 0 9999px color-mix(in oklab, var(--background) 82%, transparent)",
            outline: "1.5px solid var(--gold)",
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-auto"
          style={{ background: "color-mix(in oklab, var(--background) 82%, transparent)" }}
        />
      )}

      <div
        ref={cardRef}
        data-tour-card=""
        className="absolute w-[min(30rem,calc(100vw-2rem))] max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl p-5 sm:p-6 animate-in fade-in duration-200 motion-reduce:animate-none"
        style={cardStyle}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="eyebrow tabular-nums">
            Step {index + 1} / {total}
          </span>
          <button
            onClick={end}
            aria-label="Close the tour"
            className="inline-flex items-center justify-center h-8 w-8 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h2 id="tour-title" className="text-xl sm:text-2xl font-semibold leading-tight">
          {step.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2.5">{step.body}</p>

        {/* Progress dots double as direct navigation. */}
        <div className="flex items-center gap-1.5 mt-5" role="tablist" aria-label="Tour steps">
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Step ${i + 1}: ${s.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-gold" : "w-1.5 bg-border hover:bg-gold-soft"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-5 pt-4 divider">
          <button onClick={end} className="btn btn-ghost btn-sm -ml-3">
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button onClick={back} className="btn btn-secondary btn-sm">
                Back
              </button>
            )}
            <button
              ref={nextRef}
              onClick={next}
              className="btn btn-primary btn-sm"
            >
              {isLast ? "Done" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * First-visit nudge. A prompt rather than an auto-playing tour: hijacking a
 * first page load is how people learn to dismiss things without reading them.
 */
export function TourPrompt() {
  const { ready, seen, active, start, dismiss } = useTour();
  const [mounted, setMounted] = useState(false);

  // Let the page paint first — appearing mid-load reads as an ad.
  useEffect(() => {
    if (!ready || seen || active) return;
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, [ready, seen, active]);

  if (!ready || seen || active || !mounted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[22rem] z-[60] rounded-2xl border border-border bg-card shadow-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <div className="eyebrow mb-2">First time here?</div>
      <p className="text-sm text-foreground/80 leading-relaxed">
        There's a fair bit here — a vibe finder, occasion filtering, your own drawer, and a roster of
        independent Indian makers. Want the two-minute tour?
      </p>
      <div className="flex items-center gap-2 mt-4">
        <button onClick={() => start(0)} className="btn btn-primary btn-sm">
          Show me →
        </button>
        <button onClick={dismiss} className="btn btn-ghost btn-sm">

          No thanks
        </button>
      </div>
    </div>
  );
}

/** Header launcher, so the tour is reachable forever rather than once. */
export function TourButton({ className = "" }: { className?: string }) {
  const { start } = useTour();
  return (
    <button
      onClick={() => start(0)}
      aria-label="Take the guided tour"
      title="Take the guided tour"
      className={`inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition shrink-0 ${className}`}
    >
      <HelpCircle className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
