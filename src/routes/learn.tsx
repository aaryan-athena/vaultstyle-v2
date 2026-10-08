import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { LESSONS, DEMO_PIECES } from "@/lib/learn-content";
import { checkLook, verdict, type Severity } from "@/lib/pairing-rules";
import { getTraits, FORMALITY_LABEL } from "@/lib/accessory-traits";
import { getAccessoryMeta } from "@/lib/accessory-data";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Accessories, Explained — The Vault" },
      {
        name: "description",
        content:
          "Men's accessorising from zero: why it matters, what to buy first, whether you can mix metals, and how much is too much. With a live checker for any combination.",
      },
      { property: "og:title", content: "Accessories, Explained — The Vault" },
      {
        property: "og:description",
        content: "The rules of men's accessorising, explained for someone starting from nothing.",
      },
    ],
  }),
  component: LearnPage,
});

const TONE_STYLES: Record<Severity | "clear", { border: string; text: string; label: string }> = {
  clash: { border: "border-red-500/50", text: "text-red-600 dark:text-red-400", label: "Clash" },
  caution: { border: "border-gold", text: "text-gold", label: "Caution" },
  note: { border: "border-border", text: "text-muted-foreground", label: "Note" },
  clear: {
    border: "border-emerald-500/50",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Works",
  },
};

function LearnPage() {
  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />

      <header className="container-page pt-14 md:pt-20 pb-10">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Start From Zero</p>
          <h1 className="page-title mb-5">
            Nobody teaches men
            <span className="italic text-gold"> how to wear jewellery.</span>
          </h1>
          <p className="lead max-w-2xl">
            So most men opt out, and the ones who don't learn by buying the wrong things for a few
            years. There are maybe six rules in total. They're below, each one stated so you can use
            it without this site — and a checker at the end that tells you when you've broken one,
            and why.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Lessons">
            {LESSONS.map((l, i) => (
              <a key={l.id} href={`#${l.id}`} className="chip">
                <span className="tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.rule.split(".")[0].slice(0, 28)}
                {l.rule.split(".")[0].length > 28 ? "…" : ""}
              </a>
            ))}
            <a href="#checker" className="chip chip-active">
              Try the checker ↓
            </a>
          </nav>
        </div>
      </header>

      {/* Lessons */}
      <section className="container-page pb-16 md:pb-24">
        <div className="max-w-3xl space-y-6">
          {LESSONS.map((l, i) => (
            <article key={l.id} id={l.id} className="surface scroll-mt-24 p-6 md:p-10">
              <span className="tag tag-gold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">{l.question}</h2>

              <p className="text-lg md:text-xl font-display font-medium leading-snug border-l-2 border-gold pl-4 my-6">
                {l.rule}
              </p>

              <div className="space-y-4 max-w-[65ch]">
                {l.body.map((p, k) => (
                  <p key={k} className="text-muted-foreground leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {l.example && (
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-500/8 p-4 md:p-5">
                    <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                      Works
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{l.example.right}</p>
                  </div>
                  <div className="rounded-xl bg-red-500/8 p-4 md:p-5">
                    <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1.5">
                      Doesn't
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{l.example.wrong}</p>
                  </div>
                </div>
              )}

              {l.next && l.next.to !== "/learn" && (
                <div className="mt-8 pt-5 divider">
                  <Link to={l.next.to} className="link text-sm">
                    {l.next.label} →
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <Checker />

      <SiteFooter />
    </main>
  );
}

/**
 * The demo the PRD asks for: not a video, but the rules running live.
 *
 * It calls the same checkLook() the rest of the app uses, so what it teaches is
 * exactly what the app enforces. Breaking a rule on purpose is the fastest way
 * to learn it, so the piece set is chosen to make clashes easy to trigger.
 */
function Checker() {
  const [picked, setPicked] = useState<string[]>(["Dress Watch", "Cuban Chain"]);

  const conflicts = useMemo(() => checkLook(picked), [picked]);
  const outcome = useMemo(() => verdict(conflicts), [conflicts]);
  const tone = TONE_STYLES[outcome.tone];

  const toggle = (piece: string) =>
    setPicked((p) => (p.includes(piece) ? p.filter((x) => x !== piece) : [...p, piece]));

  return (
    <section id="checker" className="scroll-mt-24 border-t border-border bg-muted/40 section">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">The Demo</p>
          <h2 className="section-title mb-4">
            Build a bad combination
            <span className="italic text-gold"> on purpose.</span>
          </h2>
          <p className="lead max-w-2xl">
            Pick pieces as if you were getting dressed. Every rule above is running underneath this —
            when something's wrong, it says what and why, in a form you can carry to a shop.
          </p>
        </div>

        {/* Piece picker */}
        <div className="mt-10 grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-3">
          {DEMO_PIECES.map((piece) => {
            const on = picked.includes(piece);
            const traits = getTraits(piece);
            const meta = getAccessoryMeta(piece);
            return (
              <button
                key={piece}
                onClick={() => toggle(piece)}
                aria-pressed={on}
                className={`text-left rounded-2xl border p-2 transition flex items-center gap-3 ${
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground/30"
                }`}
              >
                {meta?.image && (
                  <img
                    src={meta.image}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="h-14 w-14 rounded-xl object-cover shrink-0"
                  />
                )}
                <span className="min-w-0 pr-2">
                  <span className="block text-sm font-medium leading-tight">{piece}</span>
                  {traits && (
                    <span
                      className={`block text-xs mt-0.5 ${on ? "text-background/70" : "text-muted-foreground"}`}
                    >
                      {traits.metal !== "None" ? `${traits.metal} · ` : ""}
                      {FORMALITY_LABEL[traits.formality]}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-w-3xl">
          {/* Verdict */}
          <div className={`surface mt-8 border-l-4 ${tone.border} p-5 md:p-6`}>
            <div className={`text-sm font-semibold ${tone.text} mb-1.5`}>{tone.label}</div>
            <p className="text-foreground/90 leading-relaxed">
              {picked.length === 0 ? "Pick a piece or two to see the rules fire." : outcome.line}
            </p>
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <ul className="mt-4 space-y-4">
              {conflicts.map((c, i) => {
                const s = TONE_STYLES[c.severity];
                return (
                  <li key={i} className="surface p-5 md:p-6">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold leading-tight">{c.title}</h3>
                      <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">{c.why}</p>
                    <div className="surface-muted p-4 mt-4">
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        <span className="tag tag-gold mr-2">Fix</span>
                        {c.fix}
                      </p>
                    </div>
                    {c.pieces.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {c.pieces.map((p) => (
                          <span key={p} className="tag">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-12 pt-8 divider flex flex-wrap gap-3">
          <Link to="/start" className="btn btn-primary">
            Now get a real brief →
          </Link>
          <Link to="/makers" className="btn btn-secondary">
            Who makes this stuff
          </Link>
          <Link to="/accessories" className="btn btn-secondary">
            Every piece, defined
          </Link>
        </div>
      </div>
    </section>
  );
}
