import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { TourButton } from "./Tour";
import { useDrawer } from "@/lib/drawer";

type NavLink = { to: string; label: string; exact?: boolean };

/**
 * The full map, used by the mobile drawer and the footer.
 *
 * Ordered as a newcomer would need it: the two ways in (Start Here, Learn)
 * before the browsing surfaces, since the platform's problem is people who
 * don't yet know they want jewellery.
 */
const NAV_LINKS: NavLink[] = [
  { to: "/", label: "Finder", exact: true },
  { to: "/start", label: "Start Here" },
  { to: "/learn", label: "Learn" },
  { to: "/wishlist", label: "Wishlist Match" },
  { to: "/makers", label: "Makers" },
  { to: "/curated", label: "Edits" },
  { to: "/vibes", label: "Vibes" },
  { to: "/accessories", label: "Accessories" },
  { to: "/drawer", label: "My Drawer" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "The Method" },
  { to: "/founder", label: "Founder" },
];

/**
 * Desktop bar. Thirteen links don't fit on one row at any sane font size, so
 * this is the subset; everything else stays one tap away in the mobile menu
 * and in the footer.
 */
const PRIMARY_NAV: NavLink[] = NAV_LINKS.filter((l) =>
  ["/start", "/learn", "/wishlist", "/makers", "/vibes", "/drawer"].includes(l.to),
);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count, ready } = useDrawer();
  // Only render the badge once storage has been read, so the server markup and
  // the first client paint match.
  const badge = ready && count > 0 ? count : null;

  // The wordmark already links home, but it doesn't read as a control. On any
  // page other than the finder, give people an explicit way back.
  const onHome = useLocation({ select: (l) => l.pathname === "/" });

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 md:px-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden lg:flex min-w-0 items-center gap-1 text-sm font-medium">
          {PRIMARY_NAV.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={l.exact ? { exact: true } : undefined}
              activeProps={{ className: "!text-foreground bg-muted" }}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-muted-foreground hover:text-foreground transition whitespace-nowrap"
            >
              {l.label}
              {l.to === "/drawer" && badge !== null && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-white dark:text-background">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 shrink-0">
          {!onHome && (
            <Link
              to="/"
              aria-label="Back to the finder"
              title="Back to the finder"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition shrink-0"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          <TourButton />
          <ThemeToggle />
          <Link to="/vibes" className="btn btn-primary btn-sm ml-2 hidden sm:inline-flex lg:hidden">
            Browse
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="ml-1 inline-flex lg:hidden items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition shrink-0"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background px-3 sm:px-4 py-3 grid grid-cols-1 min-[420px]:grid-cols-2 gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={l.exact ? { exact: true } : undefined}
              activeProps={{ className: "!text-foreground bg-muted" }}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              {l.label}
              {l.to === "/drawer" && badge !== null && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-white dark:text-background">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Wordmark() {
  return (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
        <span className="h-2.5 w-2.5 rounded-full bg-gold" />
      </span>
      <span className="font-display text-[17px] font-bold tracking-tight">The Vault</span>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-8 py-14 grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Wordmark />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            A vibe-first accessory guide for men. Every chain, ring, watch, earring and bracelet
            mapped to the fit it belongs in — led by independent Indian makers, with luxury and
            marketplace options alongside.
          </p>
        </div>
        <FooterCol title="Start" links={[
          { to: "/start", label: "Four Questions" },
          { to: "/learn", label: "Accessories, Explained" },
          { to: "/wishlist", label: "Wishlist Match" },
          { to: "/", label: "Vibe Finder" },
        ]} />
        <FooterCol title="Browse" links={[
          { to: "/makers", label: "The Makers" },
          { to: "/curated", label: "Curated Edits" },
          { to: "/vibes", label: "All Vibes" },
          { to: "/accessories", label: "Accessory Index" },
          { to: "/drawer", label: "My Drawer" },
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© The Vault · Vol. 01</span>
          <span>22 vibes · accessories that finish the fit</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
