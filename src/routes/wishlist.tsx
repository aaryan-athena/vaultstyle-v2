import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ProductPicker } from "@/components/ShopTheLook";
import { VIBES, colorToHex } from "@/lib/vault-data";
import { vibeImage } from "@/lib/vibe-images";
import { blendVibes, MAX_MIX, MIN_MIX } from "@/lib/vibe-mixer";
import { getAccessoryMeta } from "@/lib/accessory-data";
import { readWishlist, type WishlistReadResult } from "@/lib/api/wishlist.functions";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist Match — The Vault" },
      {
        name: "description",
        content:
          "Upload a screenshot of your Amazon or Flipkart wishlist and get accessories that actually sit with the clothes you already want.",
      },
      { property: "og:title", content: "Wishlist Match — The Vault" },
      {
        property: "og:description",
        content: "Your wishlist already knows your taste. Point it at accessories.",
      },
    ],
  }),
  component: WishlistPage,
});

/** Hard ceiling on the base64 payload, matching the server's own validator. */
const MAX_DATA_URL_CHARS = 6_000_000;

/**
 * Decode a file to something drawable, without assuming createImageBitmap.
 *
 * Safari only shipped createImageBitmap(Blob) recently and some in-app
 * browsers still lack it, so fall back to an <img> + object URL rather than
 * failing the whole feature on a missing API.
 */
async function decode(
  file: File,
): Promise<{ draw: CanvasImageSource; w: number; h: number; release: () => void }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { draw: bitmap, w: bitmap.width, h: bitmap.height, release: () => bitmap.close?.() };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That image couldn't be decoded."));
      el.src = url;
    });
    return {
      draw: img,
      w: img.naturalWidth,
      h: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/**
 * Shrink a screenshot before it goes anywhere.
 *
 * A phone screenshot is often 3–8MB, and base64 inflates it by a third on top.
 * Vision models don't need the pixels — they need the text legible — so 1400px
 * on the long edge at JPEG 0.82 keeps product names readable while landing the
 * payload comfortably inside the request limit.
 *
 * The result is deliberately NOT kept in React state: a multi-megabyte data
 * URL held in state and rendered as an <img src> puts megabytes of string into
 * the DOM and through every render, which is enough to make the main thread
 * misbehave on a mid-range phone. The preview uses a cheap object URL instead,
 * and the base64 lives only as long as the request that needs it.
 */
async function downscale(file: File, maxEdge = 1400, quality = 0.82): Promise<string> {
  const { draw, w: sw, h: sh, release } = await decode(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process that image in this browser.");
    ctx.drawImage(draw, 0, 0, w, h);

    let dataUrl = canvas.toDataURL("image/jpeg", quality);

    // A very tall screenshot can still exceed the cap at this edge length.
    // Step the quality down before giving up, so a long wishlist still works.
    for (let q = quality - 0.2; dataUrl.length > MAX_DATA_URL_CHARS && q >= 0.4; q -= 0.2) {
      dataUrl = canvas.toDataURL("image/jpeg", q);
    }
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      throw new Error("That screenshot is too large — try cropping it to just the list.");
    }
    return dataUrl;
  } finally {
    release();
  }
}

type State =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "done"; result: WishlistReadResult }
  | { status: "failed"; reason: string };

function WishlistPage() {
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Object URL for the thumbnail. Kept in a ref-plus-state pair so it can be
  // revoked deterministically: leaking these pins the whole image in memory.
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const setPreviewUrl = (url: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreview(url);
  };

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setState({
        status: "failed",
        reason: "That's not an image — a PNG or JPEG screenshot works.",
      });
      return;
    }

    setState({ status: "reading" });
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // `image` stays a local: it is multiple megabytes of base64 and must not
      // enter React state or the DOM.
      const image = await downscale(file);
      const res = await readWishlist({ data: { image } });
      setState(
        res.ok ? { status: "done", result: res.result } : { status: "failed", reason: res.reason },
      );
    } catch (err) {
      setState({
        status: "failed",
        reason:
          err instanceof Error && err.message
            ? err.message
            : "Couldn't read that image — try a different screenshot.",
      });
    }
  };

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />

      <section className="container-page pt-14 md:pt-20 pb-16">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Wishlist Match</p>
          <h1 className="page-title mb-5">
            Your wishlist already
            <span className="italic text-muted-foreground"> knows your taste.</span>
          </h1>
          <p className="lead max-w-2xl">
            Screenshot a shopping list of clothes you like and drop it here. We read the product
            names, work out how you actually dress, and answer with{" "}
            <strong className="font-semibold text-foreground">accessories</strong> that sit with
            those clothes — homegrown Indian makers first, with luxury and marketplace options
            alongside.
          </p>
        </div>

        <div className="mt-10 max-w-3xl">
          {/* Being specific about the input is the difference between this
            working first try and reading as broken. */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="surface p-5">
              <span className="tag tag-gold mb-3">Works</span>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                <li>· A wishlist, cart or order history — Amazon, Flipkart, Myntra, any store</li>
                <li>· Clothing and footwear, where the product names are readable</li>
                <li>· A screenshot straight off your phone</li>
              </ul>
            </div>
            <div className="surface p-5">
              <span className="tag mb-3">Won't work</span>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                <li>· Photos of clothes with no text to read</li>
                <li>· A zoomed-out page where the titles are illegible</li>
                <li>
                  · A list of jewellery — this reads clothes and suggests accessories, not the
                  reverse
                </li>
              </ul>
            </div>
          </div>

          {/* Upload */}
          <div
            data-tour="wishlist-upload"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`mt-6 rounded-2xl border-2 border-dashed px-6 py-12 md:py-14 text-center transition ${
              dragging ? "border-gold bg-gold/5" : "border-border bg-card"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <p
              className={`text-base font-medium text-foreground ${state.status === "reading" ? "animate-pulse" : ""}`}
            >
              {state.status === "reading" ? "Reading your wishlist…" : "Drop a screenshot here"}
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={state.status === "reading"}
              className="btn btn-primary mt-5"
            >
              {state.status === "reading" ? "Working…" : "Choose a screenshot"}
            </button>
            <p className="label mt-6 leading-relaxed max-w-md mx-auto">
              The image is read once and never stored — not on our servers, not in your browser.
              It's resized on your device before it's sent.
            </p>
          </div>

          {state.status === "failed" && (
            <div className="surface mt-6 border-destructive/30 p-5">
              <p className="text-sm font-medium text-foreground">{state.reason}</p>
              <p className="text-sm text-muted-foreground mt-2">
                A screenshot where the product names are legible works best. Or{" "}
                <Link to="/start" className="link">
                  answer four questions instead
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {state.status === "done" && <WishlistResult result={state.result} preview={preview} />}

      <SiteFooter />
    </main>
  );
}

function WishlistResult({
  result,
  preview,
}: {
  result: WishlistReadResult;
  preview: string | null;
}) {
  // Accessories come from the matched vibes through the normal engine — the
  // model never picks pieces, so nothing here can be a hallucinated product.
  const edit = useMemo(() => {
    const names = result.matchedVibes.slice(0, MAX_MIX);
    if (names.length >= MIN_MIX) {
      const blended = blendVibes(names);
      if (blended) {
        return {
          title: blended.vibe,
          palette: blended.colors,
          hero: blended.mostValuable,
          rest: [...blended.recommended, ...blended.addOns],
        };
      }
    }
    const v = VIBES.find((x) => x.vibe === names[0]);
    return v
      ? {
          title: v.vibe,
          palette: v.colors,
          hero: v.mostValuable,
          rest: [...v.recommended, ...v.addOns],
        }
      : null;
  }, [result.matchedVibes]);

  return (
    <section className="divider">
      <div className="container-page section">
        <p className="eyebrow mb-5">What we read</p>

        <div className="surface p-5 md:p-6 grid md:grid-cols-[200px_1fr] gap-6 md:gap-8 items-start">
          {preview && (
            <img
              src={preview}
              alt="The wishlist screenshot you uploaded"
              className="w-full max-w-[220px] md:max-w-none rounded-xl ring-1 ring-border"
            />
          )}
          <div className="min-w-0">
            {result.items.length > 0 && (
              <>
                <div className="label mb-2">In your wishlist</div>
                <ul className="flex flex-wrap gap-1.5 mb-5">
                  {result.items.map((item) => (
                    <li key={item} className="tag text-foreground/85">
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.styleSignals.length > 0 && (
              <>
                <div className="label mb-2">Reads as</div>
                <ul className="flex flex-wrap gap-1.5 mb-5">
                  {result.styleSignals.map((s) => (
                    <li key={s} className="tag tag-gold">
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="text-foreground/90 leading-relaxed max-w-2xl">{result.note}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {result.matchedVibes.map((v) => (
                <Link
                  key={v}
                  to="/vibes"
                  hash={`vibe-${v.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="chip"
                >
                  {v} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {edit && (
          <div className="mt-16">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="eyebrow mb-3">Accessories that fit</p>
                <h2 className="section-title">{edit.title}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {edit.palette.map((c) => (
                  <span key={c} className="tag gap-1.5 pl-1.5 capitalize">
                    <span
                      className="swatch h-3.5 w-3.5"
                      style={{ backgroundColor: colorToHex(c) }}
                    />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start">
              <img
                src={vibeImage(result.matchedVibes[0])}
                alt={`${edit.title} accessories`}
                width={768}
                height={768}
                loading="lazy"
                className="w-full aspect-square object-cover rounded-2xl"
              />
              <div className="space-y-8 min-w-0">
                <PieceRow label="Start here" pieces={edit.hero} accent />
                <PieceRow label="Then layer" pieces={edit.rest.slice(0, 6)} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 divider pt-8 flex flex-wrap gap-3">
          <Link to="/start" className="btn btn-primary">
            Answer four questions →
          </Link>
          <Link to="/makers" className="btn btn-secondary">
            Meet the makers
          </Link>
        </div>
      </div>
    </section>
  );
}

function PieceRow({
  label,
  pieces,
  accent = false,
}: {
  label: string;
  pieces: string[];
  accent?: boolean;
}) {
  if (pieces.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {label}
        {accent && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pieces.map((p) => {
          const meta = getAccessoryMeta(p);
          return (
            <div
              key={p}
              className={`surface p-3 flex flex-col ${accent ? "border-gold-soft" : ""}`}
            >
              {meta?.image && (
                <img
                  src={meta.image}
                  alt={p}
                  width={300}
                  height={240}
                  loading="lazy"
                  className="w-full aspect-[5/4] object-cover rounded-xl mb-3"
                />
              )}
              <div className="font-display text-sm sm:text-base font-semibold leading-snug">
                {p}
              </div>
              <ProductPicker accessory={p} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
