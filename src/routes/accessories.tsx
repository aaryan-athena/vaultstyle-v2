import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ACCESSORY_DEFINITIONS, getVibesForAccessory, vibeSlug } from "@/lib/vault-data";
import { ACCESSORY_META } from "@/lib/accessory-data";
import { ProductPicker, MakerLine } from "@/components/ShopTheLook";
import { OwnToggle } from "@/components/Drawer";
import { CATEGORIES, categorize, type Cat } from "@/lib/accessory-category";


export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Accessory Glossary — The Vault" },
      { name: "description", content: "Every accessory in the Vault defined — Cuban chains, signet rings, dress watches, earrings, cufflinks and more, with what each piece actually does for a fit." },
      { property: "og:title", content: "Accessory Glossary — The Vault" },
      { property: "og:description", content: "Every chain, ring, watch, earring and bracelet defined." },
    ],
  }),
  component: AccessoriesPage,
});

function AccessoriesPage() {
  const [filter, setFilter] = useState<Cat>("All");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const all = Object.entries(ACCESSORY_DEFINITIONS).map(([name, def]) => ({
      name,
      def,
      cat: categorize(name),
      vibes: getVibesForAccessory(name),
    }));
    return all
      .filter((i) => (filter === "All" ? true : i.cat === filter))
      .filter((i) =>
        !q.trim()
          ? true
          : (i.name + " " + i.def).toLowerCase().includes(q.toLowerCase().trim())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filter, q]);

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />
      <header className="container-page pt-14 md:pt-20 pb-10">
        <p className="eyebrow mb-3">The Index</p>
        <h1 className="page-title mb-4">Accessory <span className="italic text-gold">Glossary.</span></h1>
        <p className="lead max-w-2xl">
          Every piece in the Vault, defined. What it is, what it does for a fit, and which vibes it shows up in —
          chains, rings, watches, bracelets and earrings. Tap{" "}
          <span className="font-medium text-gold">“I own this”</span> on anything you already have and{" "}
          <Link to="/drawer" className="link">
            your drawer
          </Link>{" "}
          will tell you what to buy next.
        </p>

        <div className="mt-8 space-y-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pieces…"
            className="input max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`chip ${filter === c ? "chip-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <p className="label mt-4">
          {items.length} {items.length === 1 ? "piece" : "pieces"}
          {filter !== "All" && ` in ${filter}`}
        </p>
      </header>

      <section className="container-page pb-16 md:pb-24">
        <div data-tour="accessory-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((i) => {
            const meta = ACCESSORY_META[i.name];
            return (
              <article key={i.name} className="surface surface-hover overflow-hidden flex flex-col">
                {meta?.image && (
                  <div className="p-3 pb-0">
                    <div className="aspect-square bg-muted overflow-hidden rounded-xl">
                      <img
                        src={meta.image}
                        alt={i.name}
                        width={1024}
                        height={1024}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-1 gap-3">
                    <h2 className="font-display text-xl font-semibold leading-tight">{i.name}</h2>
                    <span className="tag tag-gold shrink-0">{i.cat}</span>
                  </div>
                  <p className="mb-3">
                    <MakerLine accessory={i.name} />
                  </p>
                  <p className="text-sm text-foreground/75 leading-relaxed">{i.def}</p>
                  {i.vibes.length > 0 && (
                    <div className="divider mt-4 pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {i.vibes.map((vibe) => (
                          <Link
                            key={vibe}
                            to="/vibes"
                            hash={`vibe-${vibeSlug(vibe)}`}
                            className="tag transition hover:bg-gold/12 hover:text-gold"
                          >
                            {vibe}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-auto pt-4 space-y-2">
                    <OwnToggle accessory={i.name} />
                    <ProductPicker accessory={i.name} />
                  </div>
                </div>
              </article>
            );
          })}
          {items.length === 0 && (
            <p className="surface-muted px-5 py-6 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              No pieces match — try clearing the filter.
            </p>
          )}
        </div>

      </section>
      <SiteFooter />
    </main>
  );
}
