import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ProductPicker } from "@/components/ShopTheLook";
import { colorToHex, lookupAccessoryDefinition } from "@/lib/vault-data";
import { getAccessoryMeta } from "@/lib/accessory-data";
import { FORMALITY_LABEL } from "@/lib/accessory-traits";
import { useDrawer } from "@/lib/drawer";
import { buildBrief, type IntakeBrief } from "@/lib/intake-brief";
import {
  LOOKING_CHOICES,
  OCCASION_CHOICES,
  OWNS_CHOICES,
  QUESTION_COUNT,
  WEAR_CHOICES,
  answeredCount,
  isComplete,
  useIntake,
  type Intake,
} from "@/lib/onboarding";
import { intakeNote, type IntakeNoteResult } from "@/lib/api/onboarding.functions";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Start Here — The Vault" },
      {
        name: "description",
        content:
          "Four questions — what you want, the occasion, how often you'd wear it, what you already own — and we'll name the one piece to buy first, from an independent Indian maker.",
      },
      { property: "og:title", content: "Start Here — The Vault" },
      { property: "og:description", content: "Four questions to your first piece." },
    ],
  }),
  component: StartPage,
});

type NoteState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: IntakeNoteResult }
  | { status: "failed"; reason: string };

function StartPage() {
  const { intake, ready, save, clear } = useIntake();
  const [draft, setDraft] = useState<Partial<Intake>>({});
  const [showResult, setShowResult] = useState(false);

  // A returning visitor sees their answer, not a blank form.
  useEffect(() => {
    if (ready && intake) {
      setDraft(intake);
      setShowResult(true);
    }
  }, [ready, intake]);

  const brief = useMemo(() => (isComplete(draft) ? buildBrief(draft) : null), [draft]);
  const answered = answeredCount(draft);

  const submit = () => {
    if (!isComplete(draft)) return;
    save(draft);
    setShowResult(true);
    requestAnimationFrame(() =>
      document.getElementById("brief")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const restart = () => {
    clear();
    setDraft({});
    setShowResult(false);
  };

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />

      <section className="container-page pt-14 md:pt-20 pb-16">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-4">Start Here</p>
          <h1 className="page-title mb-5">
            Four questions.
            <span className="italic text-muted-foreground"> One piece to buy first.</span>
          </h1>
          <p className="lead">
            Most accessory advice assumes you already know what you want. This doesn't. Answer these
            and we'll name the single piece worth buying, why it's right for the occasion, and which
            independent Indian maker to get it from.
          </p>

          {/* Progress */}
          <div className="mt-10">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="label">Progress</span>
              <span className="label tabular-nums">
                {answered} / {QUESTION_COUNT}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out"
                style={{ width: `${(answered / QUESTION_COUNT) * 100}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="mt-8 space-y-6">
            <Question
              n="01"
              label="What are you after?"
              help="If you don't know, say so — that's a real answer."
            >
              <ChoiceGrid
                choices={LOOKING_CHOICES}
                value={draft.looking}
                onPick={(looking) => setDraft((d) => ({ ...d, looking }))}
              />
            </Question>

            <Question
              n="02"
              label="What's the occasion?"
              help="Dress codes differ more than styles do."
            >
              <ChoiceGrid
                choices={OCCASION_CHOICES}
                value={draft.occasion}
                onPick={(occasion) => setDraft((d) => ({ ...d, occasion }))}
                compact
              />
            </Question>

            <Question n="03" label="How often would you wear it?">
              <ChoiceGrid
                choices={WEAR_CHOICES}
                value={draft.wear}
                onPick={(wear) => setDraft((d) => ({ ...d, wear }))}
              />
            </Question>

            <Question n="04" label="Do you already own pieces like this?">
              <ChoiceGrid
                choices={OWNS_CHOICES}
                value={draft.owns}
                onPick={(owns) => setDraft((d) => ({ ...d, owns }))}
              />
            </Question>
          </div>

          <div className="mt-10 divider pt-6 flex flex-wrap items-center gap-3">
            <button onClick={submit} disabled={!isComplete(draft)} className="btn btn-primary">
              {showResult ? "Update my brief →" : "Get my brief →"}
            </button>
            {ready && intake && (
              <button onClick={restart} className="btn btn-secondary">
                Start over
              </button>
            )}
            {!isComplete(draft) && (
              <span className="label ml-auto tabular-nums">{QUESTION_COUNT - answered} left</span>
            )}
          </div>
        </div>
      </section>

      {showResult && brief && <BriefResult brief={brief} intake={draft as Intake} />}

      <SiteFooter />
    </main>
  );
}

function Question({
  n,
  label,
  help,
  children,
}: {
  n: string;
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="surface p-5 md:p-6">
      <legend className="sr-only">{label}</legend>
      <div className="mb-5">
        <span className="tag tag-gold tabular-nums mb-3">{n}</span>
        <h2 className="section-title text-2xl md:text-3xl">{label}</h2>
        {help && <p className="text-sm text-muted-foreground mt-2">{help}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function ChoiceGrid<T extends string>({
  choices,
  value,
  onPick,
  compact = false,
}: {
  choices: { value: T; label: string; hint?: string }[];
  value: T | undefined;
  onPick: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {choices.map((c) => {
        const on = value === c.value;
        return (
          <button
            key={c.value}
            onClick={() => onPick(c.value)}
            aria-pressed={on}
            className={`surface surface-hover relative text-left px-4 ${compact ? "py-3.5" : "py-4"} ${
              on ? "border-foreground ring-1 ring-foreground" : ""
            }`}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="block text-sm font-medium text-foreground">{c.label}</span>
              <span
                aria-hidden
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                  on ? "border-foreground bg-foreground" : "border-border"
                }`}
              >
                {on && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
              </span>
            </span>
            {c.hint && !compact && (
              <span className="block text-xs text-muted-foreground mt-1 leading-snug">
                {c.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function BriefResult({ brief, intake }: { brief: IntakeBrief; intake: Intake }) {
  const { isOwned, toggle, ready: drawerReady } = useDrawer();
  const [note, setNote] = useState<NoteState>({ status: "idle" });

  // Ask for the covering note once per brief. The brief itself is already on
  // screen, so this is additive — a failure degrades to no paragraph, not to
  // no answer.
  const key = `${intake.looking}|${intake.occasion}|${intake.wear}|${intake.owns}`;
  useEffect(() => {
    if (!brief.lead) return;
    let cancelled = false;
    setNote({ status: "loading" });

    intakeNote({
      data: {
        occasion: brief.occasion.label,
        constraint: brief.constraint,
        lead: brief.lead.piece,
        leadWhy: brief.lead.why,
        alternates: brief.alternates.map((a) => a.piece),
        palette: brief.palette,
        ruledOut: brief.ruledOut.map((r) => r.piece),
      },
    })
      .then((res) => {
        if (cancelled) return;
        setNote(
          res.ok
            ? { status: "done", result: res.result }
            : { status: "failed", reason: res.reason },
        );
      })
      .catch(() => {
        if (cancelled) return;
        setNote({ status: "failed", reason: "The AI service is temporarily unavailable." });
      });

    return () => {
      cancelled = true;
    };
  }, [key, brief]);

  return (
    <section id="brief" className="scroll-mt-24 divider">
      <div className="container-page section">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Your brief</p>

          {note.status === "done" ? (
            <h2 className="section-title mb-4">{note.result.headline}</h2>
          ) : (
            <h2 className="section-title mb-4">{brief.occasion.label}</h2>
          )}

          <p className="lead">{brief.constraint}</p>

          {note.status === "loading" && (
            <p className="mt-4 text-sm text-muted-foreground animate-pulse">Writing your note…</p>
          )}
          {note.status === "done" && (
            <div className="mt-6 space-y-4">
              <p className="text-foreground/90 leading-relaxed">{note.result.note}</p>
              <div className="surface-muted p-4 text-sm text-muted-foreground leading-relaxed">
                <span className="block text-sm font-medium text-foreground mb-1">Watch out</span>
                {note.result.watchOut}
              </div>
            </div>
          )}
          {note.status === "failed" && (
            <p className="mt-4 text-sm text-muted-foreground">
              {note.reason} The picks below don't depend on it — they come from the occasion's dress
              code, not the model.
            </p>
          )}

          {/* Palette */}
          {brief.palette.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {brief.palette.map((c) => (
                <span key={c} className="tag gap-1.5 pl-1.5 capitalize">
                  <span className="swatch h-3.5 w-3.5" style={{ backgroundColor: colorToHex(c) }} />
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lead piece */}
        {brief.lead && (
          <article className="surface mt-10 p-5 md:p-8">
            <div className="grid md:grid-cols-[240px_1fr] gap-6 md:gap-8 items-start">
              {getAccessoryMeta(brief.lead.piece)?.image && (
                <img
                  src={getAccessoryMeta(brief.lead.piece)!.image}
                  alt={brief.lead.piece}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-xl"
                />
              )}
              <div className="min-w-0">
                <p className="eyebrow mb-3">Buy this first</p>
                <h3 className="text-2xl md:text-3xl font-semibold">{brief.lead.piece}</h3>
                {brief.lead.formality && (
                  <span className="tag mt-3">{FORMALITY_LABEL[brief.lead.formality]}</span>
                )}
                <p className="text-sm font-medium text-gold mt-4">{brief.lead.why}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  {lookupAccessoryDefinition(brief.lead.piece).definition}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <ProductPicker accessory={brief.lead.piece} defaultOpen />
                </div>
                {drawerReady && (
                  <button
                    onClick={() => toggle(brief.lead!.piece)}
                    className={`btn btn-sm mt-5 ${isOwned(brief.lead.piece) ? "btn-primary" : "btn-secondary"}`}
                  >
                    {isOwned(brief.lead.piece) ? "✓ In my drawer" : "I already own this"}
                  </button>
                )}
              </div>
            </div>
          </article>
        )}

        {/* Alternates */}
        {brief.alternates.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl md:text-2xl font-semibold mb-5">Also right for this</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brief.alternates.map((a) => (
                <div key={a.piece} className="surface p-5 flex flex-col">
                  <h4 className="text-lg font-semibold">{a.piece}</h4>
                  {a.formality && (
                    <span className="label mt-1">{FORMALITY_LABEL[a.formality]}</span>
                  )}
                  <p className="text-sm text-muted-foreground leading-snug mt-3 flex-1">{a.why}</p>
                  <ProductPicker accessory={a.piece} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ruled out — teaching the rule matters more than the pick */}
        {brief.ruledOut.length > 0 && (
          <div className="surface-muted mt-12 p-5 md:p-6">
            <h3 className="text-base font-semibold mb-3">Left out on purpose</h3>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {brief.ruledOut.map((r) => (
                <li key={r.piece} className="text-sm">
                  <span className="font-medium text-foreground">{r.piece}</span>
                  <span className="text-muted-foreground"> — {r.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/wishlist" className="btn btn-primary">
            Match my wishlist →
          </Link>
          <Link to="/makers" className="btn btn-secondary">
            Meet the makers
          </Link>
          <Link to="/learn" className="btn btn-secondary">
            Learn the rules
          </Link>
        </div>
      </div>
    </section>
  );
}
