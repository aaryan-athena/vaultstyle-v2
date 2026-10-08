import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Method — The Vault" },
      { name: "description", content: "How the Vault maps menswear vibes to accessories. Hero piece first, layer second, metals that match the fit." },
      { property: "og:title", content: "The Method — The Vault" },
      { property: "og:description", content: "How the Vault maps menswear vibes to accessories." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />
      <article className="container-page pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
        <p className="eyebrow mb-3">The Method</p>
        <h1 className="page-title mb-8">Accessories aren't decoration. <span className="italic text-gold">They finish the fit.</span></h1>
        <p className="lead text-lg md:text-xl leading-[1.75] mb-12 md:mb-16">
          Most guys overthink the outfit and underthink the jewellery. The Vault flips that. You tell us the vibe — Old Money, Techwear, Streetwear, Goth — and we hand you a small, deliberate edit of pieces that actually belong on it.
        </p>

        <div className="space-y-12">
          {[
            {
              n: "01",
              t: "Vibe-mapped, not generic",
              d: "Every recommendation is tied to a defined vibe. No 'minimal silver chain goes with everything' nonsense — we tell you which 4–6 vibes it actually elevates, and which ones it kills.",
            },
            {
              n: "02",
              t: "Hero, then layer",
              d: "We name the most valuable piece first — the one that does 70% of the styling work. Then the recommended edit. Then the add-ons. Build, don't pile.",
            },
            {
              n: "03",
              t: "Metals that match the fit",
              d: "Each vibe has a colour palette so the metals don't fight your clothes. Old Money is warm gold. Techwear is gunmetal. Y2K is chrome. Get this right and the whole outfit clicks.",
            },
            {
              n: "04",
              t: "Plain-English definitions",
              d: "We define every vibe and every piece, so you're never guessing. A Cuban chain isn't a 'fancy necklace' — it's a thick interlocking metal chain with a specific energy. Knowing that helps you buy better.",
            },
          ].map((b) => (
            <div key={b.n} className="grid grid-cols-[auto_1fr] gap-5 md:gap-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-sm font-semibold text-gold tabular-nums">{b.n}</div>
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">{b.t}</h2>
                <p className="text-foreground/75 leading-[1.8]">{b.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="divider mt-16 md:mt-20 pt-10 md:pt-12 flex flex-wrap gap-3">
          <Link to="/" className="btn btn-primary">
            Try the Finder →
          </Link>
          <Link to="/vibes" className="btn btn-secondary">
            Browse all vibes
          </Link>
          <Link to="/accessories" className="btn btn-secondary">
            Accessory glossary
          </Link>
        </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
