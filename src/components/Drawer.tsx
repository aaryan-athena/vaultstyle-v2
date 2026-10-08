import { Link } from "@tanstack/react-router";
import { useDrawer } from "@/lib/drawer";
import { checkLook, verdict, type Conflict, type Severity } from "@/lib/pairing-rules";
import { getTraits } from "@/lib/accessory-traits";

/**
 * Own-it toggle. Renders nothing until the drawer has loaded from storage, so
 * the server and first client paint agree (see lib/drawer.ts).
 */
export function OwnToggle({ accessory, size = "sm" }: { accessory: string; size?: "sm" | "xs" }) {
  const { isOwned, toggle, ready } = useDrawer();
  const owned = isOwned(accessory);

  const sizeCls =
    size === "xs"
      ? "inline-flex items-center justify-center h-7 px-3 rounded-full border text-xs font-medium whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed"
      : "btn btn-secondary btn-sm";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle(accessory);
      }}
      disabled={!ready}
      aria-pressed={owned}
      className={`${sizeCls} ${
        owned
          ? "!border-transparent !bg-gold/12 !text-gold"
          : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {owned ? "✓ In drawer" : "+ I own this"}
    </button>
  );
}

const SEVERITY_STYLE: Record<Severity, { bar: string; label: string; text: string; tag: string }> = {
  clash: { bar: "bg-destructive", label: "Clash", text: "text-destructive", tag: "bg-destructive/10 text-destructive" },
  caution: { bar: "bg-gold", label: "Caution", text: "text-gold", tag: "bg-gold/12 text-gold" },
  note: { bar: "bg-muted-foreground", label: "Note", text: "text-muted-foreground", tag: "bg-muted text-muted-foreground" },
};

/** The teaching surface: what's wrong, the rule behind it, and the fix. */
export function ConflictList({
  conflicts,
  showClear = true,
}: {
  conflicts: Conflict[];
  showClear?: boolean;
}) {
  const v = verdict(conflicts);

  if (conflicts.length === 0) {
    if (!showClear) return null;
    return (
      <div className="surface flex gap-3 p-4 md:p-5">
        <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gold">Clear</div>
          <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{v.line}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((c, i) => {
        const s = SEVERITY_STYLE[c.severity];
        return (
          <div key={`${c.title}-${i}`} className="surface flex gap-4 overflow-hidden">
            <span aria-hidden className={`w-1 shrink-0 ${s.bar}`} />
            <div className="py-4 pr-5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`tag ${s.tag}`}>{s.label}</span>
                <h4 className="text-base md:text-lg leading-tight">{c.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{c.why}</p>
              <p className="text-sm text-foreground leading-relaxed mt-2">
                <span className="font-semibold text-gold mr-1.5">Fix</span>
                {c.fix}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Runs the pairing rules over a set of pieces and renders the result. Used on
 * the blended-vibe edit so the mixer starts giving feedback instead of just
 * listing pieces.
 */
export function LookCheck({
  pieces,
  heading = "Does this combination work?",
}: {
  pieces: string[];
  heading?: string;
}) {
  // Only pieces we have traits for can be judged; saying nothing is better than
  // pretending an unknown piece passed.
  const known = pieces.filter((p) => getTraits(p));
  if (known.length < 2) return null;

  const conflicts = checkLook(known);

  return (
    <div>
      <div className="eyebrow mb-4">{heading}</div>
      <ConflictList conflicts={conflicts} />
    </div>
  );
}

/** Empty-drawer prompt, shown wherever a feature needs owned pieces to work. */
export function DrawerEmptyState({ context }: { context: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        {context} Tap <span className="font-medium text-gold">“I own this”</span> on any piece in the glossary and
        it lands here.
      </p>
      <Link
        to="/accessories"
        className="btn btn-primary btn-sm mt-5"
      >
        Open the glossary →
      </Link>
    </div>
  );
}
