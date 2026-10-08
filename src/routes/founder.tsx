import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import founderImg from "@/assets/f_img.jpeg";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "Behind The Vault — The Vault" },
      { name: "description", content: "Meet Akshin Chugh, the founder of The Vault — a Grade 11 student, national-level chess player, and builder who turned a love for men's accessories into an AI-powered style curator." },
      { property: "og:title", content: "Behind The Vault — The Vault" },
      { property: "og:description", content: "Meet Akshin Chugh, the founder of The Vault." },
    ],
  }),
  component: FounderPage,
});

function FounderPage() {
  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader />

      <article className="container-page pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-3">Behind The Vault</p>
          <h1 className="page-title mb-10 md:mb-12">Hi, I'm <span className="italic text-gold">Akshin Chugh.</span></h1>

          <figure className="mb-10 md:mb-14">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={founderImg}
                alt="Akshin Chugh, founder of The Vault"
                width={960}
                height={1280}
                loading="lazy"
                className="w-full h-auto max-h-[640px] object-cover object-top"
              />
            </div>
            <figcaption className="label mt-3">
              Akshin Chugh · Bengaluru
            </figcaption>
          </figure>

          <div className="space-y-6 text-foreground/85 leading-[1.8] text-lg">
            <p>I'm currently a Grade 11 student at NPS HSR, a national-level chess player, and someone who's always loved building things from scratch.</p>
            <p>I wrote my first lines of code when I was eight years old and built my first website a few years later. Ever since then, I've enjoyed taking ideas that exist only in my head and turning them into something people can actually use.</p>
            <p>Chess has been another huge part of my life. Years of competing taught me patience, discipline, and the importance of paying attention to the smallest details. I was fortunate enough to win the U-19 State Championship and represent Karnataka and Goa at the U-19 National Championship, where our team won silver. That mindset of constantly learning, improving, and solving problems has stayed with me far beyond the chessboard.</p>
            <p>Over the last few years, I also developed a real interest in men's fashion. What fascinated me most wasn't clothing—it was accessories. A watch, chain, ring, or bracelet can completely change the feel of an outfit, yet there wasn't a simple way to know what actually worked together.</p>
            <p>I found myself spending hours scrolling through Pinterest, Instagram, and fashion communities, trying to understand why certain combinations looked effortless while others didn't. I wanted a place that didn't just sell accessories, but actually helped people style them.</p>
            <p>That's how The Vault was born.</p>
            <p>The Vault is built around one simple idea: great style shouldn't require hours of research. Describe your vibe, and let AI curate accessories that fit your aesthetic and work together as a complete stack.</p>
            <p>Building The Vault has been an opportunity to combine my interests in design, artificial intelligence, and creating products that solve everyday problems. My goal isn't just to recommend accessories—it's to make personal style feel more approachable and enjoyable for everyone.</p>
            <p>This is only the beginning, and I'm excited to see where The Vault goes next.</p>

            <div className="divider pt-8 mt-10">
              <p className="text-foreground text-xl font-serif italic">— Akshin Chugh</p>
              <p className="label text-sm mt-1">Founder, The Vault</p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Link to="/" className="btn btn-primary">
                Try the Finder →
              </Link>
              <Link to="/about" className="btn btn-secondary">
                The Method
              </Link>
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
