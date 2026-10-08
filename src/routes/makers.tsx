import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { MAKERS, PRICE_BAND_LABEL, type PriceBand } from "@/lib/makers-data";
import { makerUrl, makerLinkIsSearch } from "@/lib/shop-links";
import { CATEGORIES, type Cat } from "@/lib/accessory-category";

export const Route = createFileRoute("/makers")({
  head: () => ({
    meta: [
      { title: "The Makers — The Vault" },
      {
        name: "description",
        content:
          "The independent Indian jewellery labels behind the Vault — who they are, where they work, and what they make. Small studios, named ahead of the luxury houses.",
      },
      { property: "og:title", content: "The Makers — The Vault" },
      {
        property: "og:description",
        content: "Independent Indian jewellery labels — who they are and what they make.",
      },
    ],
  }),
  component: MakersPage,
});

const BANDS: (PriceBand | "All")[] = ["All", "accessible", "mid", "premium"];

function MakersPage() {
  const [cat, setCat] = useState<Cat>("All");
  const [band, setBand] = useState<PriceBand | "All">("All");

  const list = useMemo(
    () =>
      MAKERS.filter((m) => (cat === "All" ? true : m.makes.includes(cat as Exclude<Cat, "All">)))
        .filter((m) => (band === "All" ? true : m.priceBand === band))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [cat, band],
  );

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />

      <header className="container-page pt-14 md:pt-20 pb-10">
        <h1 className="page-title mb-5 max-w-4xl">
          {MAKERS.length} homegrown labels,
          <span className="italic text-gold"> named before anyone else.</span>
        </h1>
        <p className="lead max-w-2xl">
          Studios in Jaipur, Mumbai and Bengaluru that can't outspend a marketplace for your
          attention — so they lead every recommendation here. Prices are bands; the live number is
          on the maker's own site.
        </p>
      </header>

      <section className="container-page pb-16 md:pb-24">
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-1 w-16 shrink-0">Makes</span>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`chip ${cat === c ? "chip-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-1 w-16 shrink-0">Budget</span>
            {BANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`chip ${band === b ? "chip-active" : ""}`}
              >
                {b === "All" ? "All" : PRICE_BAND_LABEL[b]}
              </button>
            ))}
          </div>
        </div>

        {/* Roster */}
        <div data-tour="makers-roster" className="mt-10 grid gap-5 md:grid-cols-2">
          {list.map((m) => (
            <article
              key={m.id}
              id={`maker-${m.id}`}
              className="surface surface-hover scroll-mt-28 p-5 md:p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-semibold leading-tight">{m.name}</h2>
                  <p className="label mt-1.5">
                    {[m.city, m.founder].filter(Boolean).join(" · ") || "Independent label"}
                  </p>
                </div>
                <span className="tag tag-gold tabular-nums shrink-0">
                  {PRICE_BAND_LABEL[m.priceBand]}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{m.blurb}</p>

              {/* Categories and vibes, unlabelled. Two "Makes" / "Sits in"
                  headings above two rows of chips said less than the chips do. */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {m.makes.map((c) => (
                  <span key={c} className="tag text-foreground/80">
                    {c}
                  </span>
                ))}
                {m.vibes.map((v) => (
                  <Link
                    key={v}
                    to="/vibes"
                    hash={`vibe-${v.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="tag border border-border bg-transparent hover:border-gold hover:text-gold transition"
                  >
                    {v}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-5">
                <div className="divider pt-4">
                  <a
                    href={makerUrl(m)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    {makerLinkIsSearch(m) ? "Their store ↗" : "Their site ↗"}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {list.length === 0 && (
          <p className="surface-muted mt-10 text-sm text-muted-foreground px-5 py-8 text-center">
            No maker on the roster matches that combination yet. Clear a filter — or if you know a
            label that belongs here, that's exactly how this list grows.
          </p>
        )}

        <div className="mt-14 pt-8 divider flex flex-wrap gap-3">
          <Link to="/" className="btn btn-primary">
            Find your vibe →
          </Link>
          <Link to="/learn" className="btn btn-secondary">
            Start from zero
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
