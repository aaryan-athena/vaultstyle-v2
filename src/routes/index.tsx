import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { VIBES, colorToHex, lookupAccessoryDefinition, vibeSlug, type VibeEntry } from "@/lib/vault-data";
import { vibeImage } from "@/lib/vibe-images";
import { getAccessoryMeta } from "@/lib/accessory-data";
import { ProductPicker, ClothingRail, MakerLine } from "@/components/ShopTheLook";
import { blendVibes, MAX_MIX, MIN_MIX } from "@/lib/vibe-mixer";
import { aiVibeSearch, type AiVibeSearchResponse } from "@/lib/api/groq-search.functions";
import { OCCASIONS, occasionAgainstDrawer } from "@/lib/occasions";
import { LookCheck, OwnToggle } from "@/components/Drawer";
import { useDrawer } from "@/lib/drawer";
import { ArrowRight, BookOpen, Compass, Heart, Layers, Search, Sparkles, Store, X } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Vault — Vibe to Accessory Recommender" },
      { name: "description", content: "Type your vibe — streetwear, old money, techwear — and get the accessories that finish the fit." },
      { property: "og:title", content: "The Vault — Vibe to Accessory Recommender" },
      { property: "og:description", content: "Type your vibe and get accessories that finish the fit." },
    ],
  }),
  component: Index,
});

function scoreVibe(entry: VibeEntry, q: string): number {
  if (!q) return 0;
  const needle = q.toLowerCase().trim();
  const words = needle.split(/\s+/).filter(Boolean);
  const v = entry.vibe.toLowerCase();
  if (v === needle) return 100;
  if (v.startsWith(needle)) return 85;
  if (v.includes(needle)) return 70;

  const outfitType = entry.outfitType.toLowerCase();
  const colors = entry.colors.join(" ").toLowerCase();
  const accessories = [...entry.mostValuable, ...entry.recommended, ...entry.addOns].join(" ").toLowerCase();
  const definition = entry.definition.toLowerCase();

  // Multi-word queries score across name, outfit type, colors, accessories and
  // definition — so "gold formal" or "black chain" surface relevant vibes
  // even when no single field matches the whole phrase.
  let score = 0;
  for (const w of words) {
    if (v.includes(w)) score += 40;
    if (outfitType.includes(w)) score += 20;
    if (colors.includes(w)) score += 18;
    if (accessories.includes(w)) score += 15;
    if (definition.includes(w)) score += 10;
  }
  return score;
}

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; response: AiVibeSearchResponse; forQuery: string };

const CURATED_VIBE_NAMES = ["Streetwear", "Old Money", "Techwear", "Luxury", "Minimal", "Y2K", "Vintage", "Sporty"];

const SECTION_NAV_ITEMS = [
  { id: "hero-top", label: "Search" },
  { id: "result", label: "Your Edit" },
  { id: "occasion", label: "Occasions" },
  { id: "mix", label: "Mix & Match" },
  { id: "browse", label: "Browse" },
  { id: "atelier", label: "Method" },
];

function SectionNav() {
  const [active, setActive] = useState(SECTION_NAV_ITEMS[0].id);

  useEffect(() => {
    const targets = SECTION_NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3"
    >
      {SECTION_NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="group flex items-center gap-3"
            aria-current={isActive ? "true" : undefined}
          >
            {/* Labels stay hidden until hover or active, so the rail is a quiet
                row of ticks rather than a second menu competing with the page. */}
            <span
              className={`text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}
            >
              {item.label}
            </span>
            <span
              className={`h-1.5 rounded-full shrink-0 transition-all ${
                isActive ? "w-6 bg-foreground" : "w-3 bg-foreground/20 group-hover:bg-foreground/50"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}

function Index() {
  const [query, setQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string>("Luxury");
  const [filter, setFilter] = useState<"All" | "Casual" | "Formal">("All");
  const [aiState, setAiState] = useState<AiState>({ status: "idle" });

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return VIBES.map((v) => ({ v, s: scoreVibe(v, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12);
  }, [query]);

  const askAi = async () => {
    const q = query.trim();
    if (q.length < 2 || aiState.status === "loading") return;
    setAiState({ status: "loading" });
    try {
      const response = await aiVibeSearch({ data: { query: q } });
      setAiState({ status: "done", response, forQuery: q });
    } catch {
      setAiState({
        status: "done",
        response: { ok: false, reason: "AI search is temporarily unavailable — try again shortly." },
        forQuery: q,
      });
    }
  };

  const selected = useMemo(
    () => VIBES.find((v) => v.vibe === selectedVibe) ?? VIBES[0],
    [selectedVibe]
  );

  const [showAllVibes, setShowAllVibes] = useState(false);
  const remainingVibes = useMemo(
    () => VIBES.filter((v) => !CURATED_VIBE_NAMES.includes(v.vibe)),
    []
  );

  const browse = useMemo(
    () => (filter === "All" ? VIBES : VIBES.filter((v) => v.outfitType === filter)),
    [filter]
  );

  const [occasionSlug, setOccasionSlug] = useState<string>(OCCASIONS[0].slug);
  const { owned, count: drawerCount, ready: drawerReady } = useDrawer();
  const occasion = useMemo(
    () => OCCASIONS.find((o) => o.slug === occasionSlug) ?? OCCASIONS[0],
    [occasionSlug],
  );
  const occasionEdit = useMemo(() => occasionAgainstDrawer(occasion, owned), [occasion, owned]);

  const [mixVibes, setMixVibes] = useState<string[]>([]);
  const blended = useMemo(() => blendVibes(mixVibes), [mixVibes]);
  const toggleMix = (name: string) => {
    setMixVibes((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_MIX) return prev;
      return [...prev, name];
    });
  };

  const pickVibe = (name: string) => {
    setSelectedVibe(name);
    document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />
      <SectionNav />

      {/* Hero — typographic, on a soft gradient wash rather than a photo */}
      <section id="hero-top" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%), radial-gradient(40% 40% at 85% 30%, color-mix(in oklab, var(--gold-soft) 35%, transparent), transparent 70%)",
          }}
        />
        <div className="relative container-page pt-16 pb-20 sm:pt-24 sm:pb-24 md:pt-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* The badge above this listed the categories the headline already
                implies. Two labels, one job — so it stays a plain status pill. */}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              22 vibes · independent Indian makers
            </span>
            <h1 className="mt-6 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground">
              Men's accessories,
              <span className="italic text-gold"> matched to your vibe.</span>
            </h1>
            <p className="lead mt-6 max-w-xl mx-auto">
              Tell us the energy — we hand you the pieces that finish the fit, from independent Indian makers.
            </p>

            {/* Search */}
            <div data-tour="search" className="mt-10 max-w-2xl mx-auto space-y-3 text-left">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  askAi();
                }}
                className="relative"
              >
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (aiState.status === "done") setAiState({ status: "idle" });
                  }}
                  placeholder="Try 'streetwear', or describe a whole look…"
                  className="w-full min-w-0 h-14 sm:h-16 rounded-full border border-border bg-card pl-13 pr-[7.5rem] sm:pr-36 text-[15px] sm:text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] focus:border-gold focus:ring-4 focus:ring-gold/15"
                  aria-label="Search your vibe"
                />
                <button
                  type="submit"
                  disabled={query.trim().length < 2 || aiState.status === "loading"}
                  className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 h-10 sm:h-12 px-4 sm:px-5"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {aiState.status === "loading" ? "Thinking…" : "Ask AI"}
                </button>
              </form>
              {matches.length > 0 && (
                <div className="surface overflow-hidden max-h-[420px] overflow-y-auto shadow-xl divide-y divide-border">
                  {matches.map(({ v }) => (
                    <button
                      key={v.vibe}
                      onClick={() => {
                        setSelectedVibe(v.vibe);
                        setQuery("");
                        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="w-full text-left px-5 py-3.5 hover:bg-muted flex items-center gap-4 group transition"
                    >
                      <img src={vibeImage(v.vibe)} alt="" width={48} height={48} loading="lazy" className="h-11 w-11 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-semibold">{v.vibe}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{v.definition}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
              {query && matches.length === 0 && aiState.status === "idle" && (
                <p className="text-sm text-muted-foreground px-2">
                  No vibe matches — try one of the chips below, or hit "Ask AI" above to describe the whole look.
                </p>
              )}

              {aiState.status === "loading" && (
                <p className="text-sm text-muted-foreground px-2 animate-pulse">Asking AI for your vibe…</p>
              )}

              {aiState.status === "done" && aiState.forQuery === query.trim() && (
                <div className="surface shadow-xl p-5 sm:p-6 space-y-4">
                  {aiState.response.ok ? (
                    <>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="eyebrow mb-1.5">
                            AI match · {aiState.response.result.confidence} confidence
                          </div>
                          <div className="font-display text-xl font-semibold">{aiState.response.result.customVibeName}</div>
                        </div>
                        <button
                          onClick={() => setAiState({ status: "idle" })}
                          className="btn btn-ghost btn-sm"
                        >
                          Dismiss ✕
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{aiState.response.result.styleNote}</p>
                      {aiState.response.result.suggestedColors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {aiState.response.result.suggestedColors.map((c) => (
                            <span key={c} className="tag gap-1.5">
                              <span className="swatch h-3 w-3" style={{ backgroundColor: colorToHex(c) }} />
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {aiState.response.result.matchedVibes.map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              setSelectedVibe(name);
                              setAiState({ status: "idle" });
                              setQuery("");
                              document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            {name} →
                          </button>
                        ))}
                        {aiState.response.result.matchedVibes.length >= MIN_MIX && (
                          <button
                            onClick={() => {
                              if (aiState.status === "done" && aiState.response.ok) {
                                setMixVibes(aiState.response.result.matchedVibes.slice(0, MAX_MIX));
                              }
                              setAiState({ status: "idle" });
                              setQuery("");
                              document.getElementById("mix")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Blend these →
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{aiState.response.reason}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 pt-3">
                {CURATED_VIBE_NAMES.map((vibeName) => {
                  const v = VIBES.find((x) => x.vibe === vibeName);
                  if (!v) return null;
                  return (
                    <button
                      key={v.vibe}
                      onClick={() => pickVibe(v.vibe)}
                      className={`chip ${selectedVibe === v.vibe ? "chip-active" : ""}`}
                    >
                      {v.vibe}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowAllVibes((s) => !s)}
                  className={`chip border-dashed ${showAllVibes ? "text-foreground border-foreground/40" : "text-muted-foreground"}`}
                >
                  {showAllVibes ? "Less −" : `More +${remainingVibes.length}`}
                </button>
              </div>

              {showAllVibes && (
                <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  {remainingVibes.map((v) => (
                    <button
                      key={v.vibe}
                      onClick={() => pickVibe(v.vibe)}
                      className={`chip ${selectedVibe === v.vibe ? "chip-active" : ""}`}
                    >
                      {v.vibe}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/*
            Three doors, because the search box above only works for people who
            already know what a vibe is. Someone who has never worn jewellery
            needs the questionnaire or the guide, not a text field.
          */}
          <div data-tour="doors" className="mt-14 grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { to: "/start", title: "Never worn any?", body: "Start here — four quick questions.", icon: Compass, primary: true },
              { to: "/learn", title: "Learn the rules", body: "Accessories, explained simply.", icon: BookOpen },
              { to: "/wishlist", title: "Match my wishlist", body: "See what fits what you want.", icon: Heart },
            ].map(({ to, title, body, icon: Icon, primary }) => (
              <Link
                key={to}
                to={to}
                className={`group surface surface-hover flex items-center gap-4 p-4 text-left ${primary ? "ring-1 ring-gold/40" : ""}`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${primary ? "bg-gold/12 text-gold" : "bg-muted text-foreground"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold">{title}</span>
                  <span className="block text-sm text-muted-foreground">{body}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/vibes" className="link text-sm">
              Open the full vibe library →
            </Link>
          </div>
        </div>
      </section>

      {/* Result */}
      <section id="result" className="section border-t border-border bg-card/50">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <div>
              <div className="eyebrow mb-3">Your edit</div>
              <h2 className="section-title md:text-5xl">
                <span className="italic">{selected.vibe}</span>
                <span className="text-muted-foreground font-medium"> — {selected.outfitType.toLowerCase()}</span>
              </h2>
              <p className="lead mt-4 max-w-2xl">{selected.definition}</p>
            </div>
            {/* Swatches only — the color name is still reachable via the
                title tooltip on hover. */}
            <div className="flex items-center gap-2">
              {selected.colors.map((c) => (
                <span
                  key={c}
                  title={c}
                  className="swatch h-7 w-7"
                  style={{ backgroundColor: colorToHex(c) }}
                />
              ))}
            </div>
          </div>

          <div key={selected.vibe} className="grid xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.65fr)] gap-5 mb-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Just the image. The brief, palette and outfit type are already
                stated in the heading above. */}
            <div className="overflow-hidden rounded-2xl xl:sticky xl:top-24">
              <img
                src={vibeImage(selected.vibe)}
                alt={`${selected.vibe} accessories`}
                width={768}
                height={768}
                loading="lazy"
                className="w-full aspect-[4/3] xl:aspect-[4/5] object-cover"
              />
            </div>
            <article className="grid md:grid-cols-3 gap-4 items-stretch">
              {(() => {
                const seen = new Set<string>();
                const dedupe = (items: string[]) =>
                  items.filter((p) => {
                    const key = lookupAccessoryDefinition(p).name.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
                const mv = dedupe(selected.mostValuable);
                const rec = dedupe(selected.recommended);
                const add = dedupe(selected.addOns);
                return (
                  <>
                    <Block label="Most valuable" items={mv} accent />
                    <Block label="Recommended" items={rec} />
                    <Block label="Add-ons" items={add} />
                  </>
                );
              })()}
            </article>
          </div>

          {/* Clothing layer — the garments that build this vibe */}
          <div className="surface p-5 md:p-6">
            <ClothingRail vibe={selected.vibe} heading={`Complete the ${selected.vibe} fit`} />
          </div>
        </div>
      </section>

      {/* Occasions — the same drawer, judged against a real dress code */}
      <section id="occasion" className="section border-t border-border">
        <div className="container-page">
          <div className="eyebrow mb-3">Occasions</div>
          <h2 className="section-title">
            Where are you <span className="italic text-gold">going?</span>
          </h2>
          <p className="lead mt-3 max-w-xl mb-8">
            The same catalog, filtered to what the occasion actually allows.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {OCCASIONS.map((o) => (
              <button
                key={o.slug}
                onClick={() => setOccasionSlug(o.slug)}
                className={`chip ${o.slug === occasionSlug ? "chip-active" : ""}`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="surface p-6 md:p-8 space-y-8">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold">{occasion.label}</h3>
              <p className="text-foreground/80 leading-relaxed max-w-3xl mt-3">{occasion.blurb}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5">
                <span className="text-sm text-muted-foreground">
                  Drawn from{" "}
                  {occasionEdit.sourceVibes.map((v, idx) => (
                    <span key={v}>
                      {idx > 0 && " × "}
                      <Link
                        to="/vibes"
                        hash={`vibe-${vibeSlug(v)}`}
                        className="link"
                      >
                        {v}
                      </Link>
                    </span>
                  ))}
                </span>
                {occasionEdit.palette.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    {occasionEdit.palette.map((c) => (
                      <span
                        key={c}
                        title={c}
                        className="swatch h-5 w-5"
                        style={{ backgroundColor: colorToHex(c) }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>

            {/* What to wear */}
            <div className="divider pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold">Right for this</span>
                <span className="tag tag-gold">{occasionEdit.pieces.length} pieces</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {occasionEdit.pieces.map((p) => {
                  const meta = getAccessoryMeta(p);
                  const have = drawerReady && owned.has(p);
                  return (
                    <div
                      key={p}
                      className={`rounded-xl p-3 flex items-center gap-3 transition ${have ? "bg-gold/10 ring-1 ring-gold/30" : "bg-muted/60"}`}
                    >
                      {meta?.image && (
                        <img
                          src={meta.image}
                          alt={p}
                          width={80}
                          height={80}
                          loading="lazy"
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium leading-tight">{p}</div>
                        {have ? (
                          <div className="text-xs font-medium text-gold mt-1.5">
                            ✓ In your drawer
                          </div>
                        ) : (
                          <div className="mt-2">
                            <OwnToggle accessory={p} size="xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ruled out — the teaching half */}
            {occasionEdit.excluded.length > 0 && (
              <div className="divider pt-6">
                <div className="text-sm font-semibold mb-3">
                  Leave at home
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                  {occasionEdit.excluded.map((x) => (
                    <li key={x.piece} className="text-sm text-muted-foreground flex gap-2">
                      <X className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                      <span>
                        <span className="text-foreground/80 font-medium">{x.piece}</span> — {x.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Against the drawer */}
            {drawerReady && drawerCount > 0 && (
              <div className="divider pt-6 space-y-6">
                <div>
                  <div className="text-sm font-semibold mb-2">
                    From your drawer
                  </div>
                  {occasionEdit.haveIt.length > 0 ? (
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      You already own {occasionEdit.haveIt.length} of these:{" "}
                      <span className="text-foreground font-medium">{occasionEdit.haveIt.join(" · ")}</span>.
                      {occasionEdit.needIt.length > 0 && (
                        <>
                          {" "}
                          Closest gap:{" "}
                          <Link to="/drawer" className="link">
                            {occasionEdit.needIt[0]}
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nothing in your drawer fits this occasion yet —{" "}
                      <Link to="/drawer" className="link">
                        see what to buy first
                      </Link>
                      .
                    </p>
                  )}
                </div>
                {occasionEdit.haveIt.length >= 2 && (
                  <LookCheck
                    pieces={occasionEdit.haveIt}
                    heading="Wearing your own pieces together — any problems?"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mix & Match — build a custom vibe from 2–3 existing ones */}
      <section id="mix" className="section border-t border-border bg-card/50">
        <div className="container-page">
          <div className="eyebrow mb-3">Blend</div>
          <h2 className="section-title">
            Mix <span className="italic text-gold">&</span> Match
          </h2>
          <p className="lead mt-3 max-w-xl mb-8">
            Pick {MIN_MIX}–{MAX_MIX} vibes and we'll blend them into one edit.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {VIBES.map((v) => {
              const isOn = mixVibes.includes(v.vibe);
              const disabled = !isOn && mixVibes.length >= MAX_MIX;
              return (
                <button
                  key={v.vibe}
                  onClick={() => toggleMix(v.vibe)}
                  disabled={disabled}
                  className={`chip ${isOn ? "chip-active" : ""}`}
                >
                  {v.vibe}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mb-10">
            <span className="tag">
              {mixVibes.length}/{MAX_MIX} selected
            </span>
            {mixVibes.length > 0 && (
              <button
                onClick={() => setMixVibes([])}
                className="text-sm font-medium text-gold hover:underline underline-offset-4"
              >
                Clear
              </button>
            )}
          </div>

          {!blended && (
            <p className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border px-5 py-10 text-center">
              Pick at least {MIN_MIX} vibes above to see your blend.
            </p>
          )}

          {blended && (
            <div className="surface p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blended.sourceVibes.map((n) => (
                      <span key={n} className="tag tag-gold">
                        {n}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold">{blended.vibe}</h3>
                  <div className="label mt-1.5">{blended.outfitLabel}</div>
                  <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">{blended.definition}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {blended.colors.map((c) => (
                    <span
                      key={c}
                      title={c}
                      className="swatch h-7 w-7"
                      style={{ backgroundColor: colorToHex(c) }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 items-stretch">
                <Block label="Most valuable" items={blended.mostValuable} accent />
                <Block label="Recommended" items={blended.recommended} />
                <Block label="Add-ons" items={blended.addOns} />
              </div>

              {/* Blending two aesthetics is exactly where metals and weights start
                  to fight, so the check belongs here rather than as an afterthought. */}
              <div className="divider pt-6">
                <LookCheck
                  pieces={blended.mostValuable.map((p) => lookupAccessoryDefinition(p).name)}
                  heading="Wearing these heroes together"
                />
              </div>

              <div className="divider pt-6">
                <ClothingRail vibe={blended.vibe} heading="Complete the blended fit" items={blended.clothing} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Browse */}
      <section id="browse" className="section border-t border-border">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="eyebrow mb-3">Library</div>
              <h2 className="section-title">All 22 vibes</h2>
            </div>
            <div className="inline-flex rounded-full bg-muted p-1">
              {(["All", "Casual", "Formal"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {browse.map((v) => {
              const active = v.vibe === selected.vibe;
              return (
                <button
                  key={v.vibe}
                  onClick={() => pickVibe(v.vibe)}
                  className={`text-left group overflow-hidden rounded-2xl bg-card border transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)] ${
                    active ? "border-foreground ring-1 ring-foreground" : "border-border"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={vibeImage(v.vibe)}
                      alt={`${v.vibe} accessories`}
                      width={768}
                      height={768}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex -space-x-1 rounded-full bg-card/90 p-1 shadow-sm">
                      {v.colors.map((c) => (
                        <span key={c} className="swatch h-3.5 w-3.5 ring-2 ring-card" style={{ backgroundColor: colorToHex(c) }} />
                      ))}
                    </div>
                  </div>
                  {/* A browse tile is a choice, not a spec sheet — the hero
                      piece alone is enough to pick with. */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-display text-lg font-semibold leading-tight">{v.vibe}</div>
                      <span className="tag shrink-0">{v.outfitType}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
                      {v.mostValuable.join(" · ")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Method */}
      <section id="atelier" className="section border-t border-border bg-card/50">
        <div className="container-page">
          <div className="eyebrow mb-3">The method</div>
          <h2 className="section-title max-w-xl">
            Accessories that <span className="italic text-gold">finish</span> the fit.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { t: "Vibe-mapped", d: "Every piece mapped to a vibe. No guessing what goes with what.", icon: Compass },
              { t: "Hero, then layer", d: "The hero piece first, then what agrees with it. Build, don't pile.", icon: Layers },
              { t: "Homegrown first", d: "Small Indian makers lead. Luxury and marketplace sit underneath.", icon: Store },
            ].map((b) => (
              <div key={b.t} className="surface p-6 space-y-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/12 text-gold">
                  <b.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h4 className="text-lg font-semibold">{b.t}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/makers" className="btn btn-primary">
              Meet the makers →
            </Link>
            <Link to="/curated" className="btn btn-secondary">
              Curated edits
            </Link>
            <Link to="/accessories" className="btn btn-secondary">
              Accessory glossary
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/**
 * A tier of the edit.
 *
 * Each item is image, name, maker, buy — and nothing else. The definitions
 * still exist, on the glossary page where looking them up is the point.
 */
function Block({ label, items, accent = false }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div className={`h-full rounded-2xl border bg-card p-4 ${accent ? "border-gold/50 ring-1 ring-gold/20" : "border-border"}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm font-semibold ${accent ? "text-gold" : "text-foreground"}`}>{label}</span>
        <span className="tag">{items.length}</span>
      </div>
      <ul className="space-y-5">
        {items.map((p, i) => {
          const { name } = lookupAccessoryDefinition(p);
          const meta = getAccessoryMeta(name);
          return (
            <li key={i} className="space-y-2.5">
              {meta && (
                <img
                  src={meta.image}
                  alt={name}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="w-full aspect-[5/4] rounded-xl object-cover"
                />
              )}
              <div>
                <div className="font-medium leading-snug">{name}</div>
                <div className="mt-1 break-words">
                  <MakerLine accessory={name} />
                </div>
                <ProductPicker accessory={name} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
