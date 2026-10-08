import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ProductPicker } from "@/components/ShopTheLook";
import {
  CURATED_EDITS,
  OPEN_COLLAB_SLOTS,
  curatorById,
  editPieces,
  type CuratedEdit,
} from "@/lib/creator-data";
import { getAccessoryMeta } from "@/lib/accessory-data";

export const Route = createFileRoute("/curated")({
  head: () => ({
    meta: [
      { title: "Curated Edits — The Vault" },
      {
        name: "description",
        content:
          "Small sets of accessories chosen together and explained — the first three pieces, wedding season, all black. Each one points at independent Indian makers.",
      },
      { property: "og:title", content: "Curated Edits — The Vault" },
      { property: "og:description", content: "Accessory sets chosen together, and why." },
    ],
  }),
  component: CuratedPage,
});

function CuratedPage() {
  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />

      <header className="container-page pt-14 md:pt-20 pb-10">
        <h1 className="page-title mb-5">
          Sets chosen together,
          <span className="italic text-gold"> not filtered by category.</span>
        </h1>
        <p className="lead max-w-2xl">
          A catalog can tell you what a signet ring is. It can't tell you that this signet, that
          watch and no chain is a complete answer for a wedding you're attending, not hosting.
          These are those answers — four pieces or fewer, with the reasoning attached.
        </p>
      </header>

      <section data-tour="curated-edits" className="container-page pb-16 space-y-6">
        {CURATED_EDITS.map((edit) => (
          <EditCard key={edit.id} edit={edit} />
        ))}
      </section>

      {/* The collab programme — stated as an open invitation rather than faked */}
      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="section-title mb-4">
            Two of these slots are open.
          </h2>
          <p className="lead max-w-2xl mb-8">
            The edits above are ours. The more interesting ones won't be — they'll come from people
            who dress better than we do and from the makers themselves. Every collaborator keeps
            their byline, links out to their own channel, and any paid or gifted arrangement is
            labelled on the edit itself.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {OPEN_COLLAB_SLOTS.map((slot) => (
              <article
                key={slot.id}
                className="rounded-2xl border border-dashed border-border p-5 md:p-6 flex flex-col"
              >
                <span className="tag w-fit mb-3">
                  Open slot
                </span>
                <h3 className="font-display text-xl font-semibold leading-tight">{slot.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3 flex-1">
                  {slot.pitch}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/founder" className="btn btn-primary">
              Who's behind this →
            </Link>
            <Link to="/makers" className="btn btn-secondary">
              The maker roster
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function EditCard({ edit }: { edit: CuratedEdit }) {
  const curator = curatorById(edit.curatorId);
  const pieces = editPieces(edit);

  return (
    <article id={edit.id} className="scroll-mt-24 surface p-5 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="min-w-0">
          <h2 className="font-display text-2xl md:text-3xl font-semibold leading-tight">{edit.title}</h2>
          {curator && (
            <div className="text-sm font-medium text-gold mt-2">
              {curator.kind === "house" ? (
                <>{curator.name} · {curator.role}</>
              ) : (
                <>
                  Curated by{" "}
                  <a
                    href={curator.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline underline-offset-4"
                  >
                    @{curator.handle}
                  </a>
                </>
              )}
            </div>
          )}
        </div>
        {edit.budget && (
          <span className="tag tabular-nums shrink-0">{edit.budget}</span>
        )}
      </div>

      {curator?.kind === "creator" && (
        <p className="tag mb-4">
          {curator.disclosure}
        </p>
      )}

      <p className="text-muted-foreground leading-relaxed max-w-2xl">{edit.blurb}</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {pieces.map((p) => {
          const meta = getAccessoryMeta(p);
          return (
            <div key={p} className="flex flex-col">
              {meta?.image && (
                <img
                  src={meta.image}
                  alt={p}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-xl bg-muted"
                />
              )}
              {/* Name and where to buy. The formality label and the full
                  definition under every thumbnail turned a four-piece set into
                  a wall of text; the styling note below already explains the
                  set, which is the thing this page is for. */}
              <div className="pt-2.5 flex-1 flex flex-col">
                <div className="font-display text-base font-semibold leading-snug">{p}</div>
                <ProductPicker accessory={p} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 surface-muted p-4 md:p-5 max-w-2xl">
        <div className="eyebrow mb-1.5">How to wear it</div>
        <p className="text-sm text-foreground/90 leading-relaxed">{edit.stylingNote}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {edit.vibes.map((v) => (
          <Link
            key={v}
            to="/vibes"
            hash={`vibe-${v.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="tag transition hover:bg-gold/12 hover:text-gold"
          >
            {v}
          </Link>
        ))}
      </div>
    </article>
  );
}
