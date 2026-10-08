import streetwear from "@/assets/vibes/streetwear.jpg";
import minimal from "@/assets/vibes/minimal.jpg";
import oldMoney from "@/assets/vibes/old-money.jpg";
import smartCasual from "@/assets/vibes/smart-casual.jpg";
import formal from "@/assets/vibes/formal.jpg";
import luxury from "@/assets/vibes/luxury.jpg";
import edgy from "@/assets/vibes/edgy.jpg";
import casual from "@/assets/vibes/casual.jpg";
import monochrome from "@/assets/vibes/monochrome.jpg";
import sporty from "@/assets/vibes/sporty.jpg";
import rugged from "@/assets/vibes/rugged.jpg";
import vintage from "@/assets/vibes/vintage.jpg";
import techwear from "@/assets/vibes/techwear.jpg";
import grunge from "@/assets/vibes/grunge.jpg";
import preppy from "@/assets/vibes/preppy.jpg";
import y2k from "@/assets/vibes/y2k.jpg";
import goth from "@/assets/vibes/goth.jpg";
import businessCasual from "@/assets/vibes/business-casual.jpg";
import partywear from "@/assets/vibes/partywear.jpg";
import summerLinen from "@/assets/vibes/summer-linen.jpg";
import cleanFit from "@/assets/vibes/clean-fit.jpg";
import beachwear from "@/assets/vibes/beachwear.jpg";

export const VIBE_IMAGES: Record<string, string> = {
  Streetwear: streetwear,
  Minimal: minimal,
  "Old Money": oldMoney,
  "Smart Casual": smartCasual,
  Formal: formal,
  Luxury: luxury,
  Edgy: edgy,
  Casual: casual,
  Monochrome: monochrome,
  Sporty: sporty,
  Rugged: rugged,
  Vintage: vintage,
  Techwear: techwear,
  Grunge: grunge,
  Preppy: preppy,
  Y2K: y2k,
  Goth: goth,
  "Business Casual": businessCasual,
  Partywear: partywear,
  "Summer Linen": summerLinen,
  "Clean Fit": cleanFit,
  Beachwear: beachwear,
};

export const vibeImage = (name: string) => VIBE_IMAGES[name] ?? streetwear;
