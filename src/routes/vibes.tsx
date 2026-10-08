import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { VIBES, colorToHex, lookupAccessoryDefinition, vibeSlug } from "@/lib/vault-data";
import { vibeImage } from "@/lib/vibe-images";
import { ACCESSORY_META } from "@/lib/accessory-data";
import { ProductPicker, ClothingRail, MakerLine } from "@/components/ShopTheLook";


export const Route = createFileRoute("/vibes")({
  head: () => ({
    meta: [
      { title: "All Vibes — The Vault" },
      { name: "description", content: "All 22 menswear vibes defined — Streetwear, Old Money, Techwear, Y2K, Goth and more, each with the accessories that finish the fit." },
      { property: "og:title", content: "All Vibes — The Vault" },
      { property: "og:description", content: "22 menswear vibes, each defined with the accessories that finish the fit." },
    ],
  }),
  component: VibesPage,
});

function VibesPage() {
  const [filter, setFilter] = useState<"All" | "Casual" | "Formal">("All");
  const list = useMemo(() => (filter === "All" ? VIBES : VIBES.filter((v) => v.outfitType === filter)), [filter]);

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />
      <header className="container-page pt-14 md:pt-20 pb-10">
        <p className="eyebrow mb-3">The Library</p>
        <h1 className="page-title mb-4">All 22 Vibes, <span className="italic text-gold">defined.</span></h1>
        <p className="lead max-w-2xl">A full glossary of every aesthetic in the Vault — what each vibe means, the metals it lives in, and the accessory edit that locks it in.</p>

        <div className="flex flex-wrap gap-2 mt-8">
          {(["All", "Casual", "Formal"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip ${filter === f ? "chip-active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <section className="container-page pb-16 md:pb-24">
        <div className="space-y-6 md:space-y-8">
          {list.map((v) => (
            <article id={`vibe-${vibeSlug(v.vibe)}`} key={v.vibe} className="surface grid md:grid-cols-[320px_1fr] overflow-hidden scroll-mt-24">
              <div className="p-4 md:p-5 md:pr-0 md:sticky md:top-20 md:self-start">
                <div className="relative overflow-hidden rounded-xl">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={vibeImage(v.vibe)}
                      alt={`${v.vibe} accessories`}
                      width={768}
                      height={960}
                      loading="lazy"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">
                    <div className="text-xs font-medium text-white/80">{v.outfitType}</div>
                    <div className="font-display text-2xl font-semibold text-white">{v.vibe}</div>
                  </div>
                </div>
                <div className="hidden md:block pt-5 space-y-4">
                  <div>
                    <div className="label mb-2">Palette</div>
                    <div className="flex flex-wrap gap-2">
                      {v.colors.map((c) => (
                        <div key={c} className="tag gap-1.5">
                          <span className="swatch h-3 w-3" style={{ backgroundColor: colorToHex(c) }} />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="surface-muted p-4">
                    <div className="label mb-1">Hero piece</div>
                    <div className="font-display text-lg font-semibold leading-snug">{v.mostValuable[0]}</div>
                  </div>
                  <Link to="/" className="btn btn-secondary btn-sm w-full">
                    Try in finder →
                  </Link>
                </div>
              </div>
              <div className="p-5 md:p-8 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <span className="tag tag-gold mb-2">{v.outfitType}</span>
                    <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{v.vibe}</h2>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {v.colors.map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <span className="swatch h-5 w-5" style={{ backgroundColor: colorToHex(c) }} />
                        <span className="label">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-foreground/75 leading-relaxed max-w-3xl mb-6">{v.definition}</p>

                {/* Accessory gallery — every recommended piece pictured */}
                {(() => {
                  const seen = new Set<string>();
                  const pieces = [...v.mostValuable, ...v.recommended, ...v.addOns]
                    .map((label) => {
                      const { name } = lookupAccessoryDefinition(label);
                      const meta = ACCESSORY_META[name];
                      return { name, meta };
                    })
                    .filter((p) => {
                      if (!p.meta || seen.has(p.name)) return false;
                      seen.add(p.name);
                      return true;
                    });
                  if (pieces.length === 0) return null;
                  return (
                    <div className="mb-6">
                      <div className="eyebrow mb-3">The Edit</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {pieces.map((p) => (
                          <figure key={p.name} className="group">
                            <div className="aspect-square bg-muted overflow-hidden rounded-xl">
                              <img
                                src={p.meta!.image}
                                alt={p.name}
                                width={1024}
                                height={1024}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <figcaption className="pt-2.5">
                              <div className="text-sm font-medium leading-tight">{p.name}</div>
                              <div className="mt-1">
                                <MakerLine accessory={p.name} />
                              </div>
                              <ProductPicker accessory={p.name} />
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="surface-muted p-4">
                    <div className="label mb-1.5">Most valuable</div>
                    <div>{v.mostValuable.join(" · ")}</div>
                  </div>
                  <div className="surface-muted p-4">
                    <div className="label mb-1.5">Recommended</div>
                    <div>{v.recommended.join(" · ")}</div>
                  </div>
                  <div className="surface-muted p-4">
                    <div className="label mb-1.5">Add-ons</div>
                    <div>{v.addOns.join(" · ")}</div>
                  </div>
                </div>
                <div className="divider mt-6 pt-6">
                  <ClothingRail vibe={v.vibe} />
                </div>

                <div className="mt-6">
                  <Link to="/" className="link text-sm">
                    Open in finder →
                  </Link>
                </div>

              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
