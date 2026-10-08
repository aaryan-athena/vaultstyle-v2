import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { VIBES, colorToHex } from "@/lib/vault-data";
import { vibeImage } from "@/lib/vibe-images";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook — The Vault" },
      { name: "description", content: "A visual atlas of men's accessory vibes — 22 editorial flat lays, every chain, ring, watch and bracelet in its natural fit." },
      { property: "og:title", content: "Lookbook — The Vault" },
      { property: "og:description", content: "22 editorial flat lays, every vibe shot in its natural fit." },
    ],
  }),
  component: LookbookPage,
});

function LookbookPage() {
  const [filter, setFilter] = useState<"All" | "Casual" | "Formal">("All");
  const list = filter === "All" ? VIBES : VIBES.filter((v) => v.outfitType === filter);

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />
      <header className="container-page pt-14 md:pt-20 pb-10">
        <p className="eyebrow mb-3">Vol. 01 · The Lookbook</p>
        <h1 className="page-title max-w-4xl">
          Every vibe,
          <span className="italic text-gold"> shot in its natural fit.</span>
        </h1>
        <p className="lead mt-5 max-w-2xl">
          Twenty-two editorial flat lays. Each one is a study — the metals, the textures, the surfaces — of a single vibe living the way it should.
        </p>

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {list.map((v, i) => (
            <Link
              key={v.vibe}
              to="/vibes"
              className={`group relative block overflow-hidden rounded-2xl bg-muted transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)] ${
                i % 7 === 0 ? "sm:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <div className={`relative overflow-hidden ${i % 7 === 0 ? "aspect-square lg:aspect-auto lg:h-full" : "aspect-[4/5]"}`}>
                <img
                  src={vibeImage(v.vibe)}
                  alt={`${v.vibe} flat lay`}
                  width={768}
                  height={768}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-1.5">
                  {v.colors.map((c) => (
                    <span key={c} className="swatch h-3 w-3 ring-white/70" style={{ backgroundColor: colorToHex(c) }} />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs font-medium text-white/75 mb-1.5">Plate · {String(i + 1).padStart(2, "0")} · {v.outfitType}</div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold leading-tight text-white">{v.vibe}</h3>
                  <p className="text-xs text-white/75 mt-2 line-clamp-2 max-w-sm">{v.mostValuable.join(" · ")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
