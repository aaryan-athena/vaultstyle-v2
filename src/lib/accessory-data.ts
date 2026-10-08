// The reference photo for every accessory in the Vault.
//
// This used to also carry a brand and model per piece ("Rolex", "Datejust 41")
// as an exemplar. Those were invented, unverifiable, and named exactly the
// global luxury labels the platform moved away from — so where to actually buy
// a piece now comes from maker-picks.ts, which names real Indian makers.
// Image paths are generated into src/assets/accessories/ as <slug>.jpg
//
// The six earring photos are licence-free stock, downloaded into assets so they
// build and cache like the rest of the set rather than hotlinking a third party:
//   stud    — pexels.com/photo/25403216      hoop   — pexels.com/photo/15799244
//   huggie  — pexels.com/photo/15799478      cross  — pexels.com/photo/8377137
//   drop    — unsplash.com/photos/1705326454933-9685fc6888e1
//   pearl   — unsplash.com/photos/1682822749969-61a63203c501

import cubanChain from "@/assets/accessories/cuban-chain.jpg";
import sportyWatch from "@/assets/accessories/sporty-watch.jpg";
import bracelet from "@/assets/accessories/bracelet.jpg";
import chunkyRing from "@/assets/accessories/chunky-ring.jpg";
import sleekWatch from "@/assets/accessories/sleek-watch.jpg";
import thinChain from "@/assets/accessories/thin-chain.jpg";
import minimalBracelet from "@/assets/accessories/minimal-bracelet.jpg";
import dressWatch from "@/assets/accessories/dress-watch.jpg";
import signetRing from "@/assets/accessories/signet-ring.jpg";
import thinBracelet from "@/assets/accessories/thin-bracelet.jpg";
import minimalWatch from "@/assets/accessories/minimal-watch.jpg";
import subtleRing from "@/assets/accessories/subtle-ring.jpg";
import leatherBracelet from "@/assets/accessories/leather-bracelet.jpg";
import cufflinks from "@/assets/accessories/cufflinks.jpg";
import elegantRing from "@/assets/accessories/elegant-ring.jpg";
import luxuryWatch from "@/assets/accessories/luxury-watch.jpg";
import statementRing from "@/assets/accessories/statement-ring.jpg";
import thickChain from "@/assets/accessories/thick-chain.jpg";
import layeredRing from "@/assets/accessories/layered-ring.jpg";
import blackBracelet from "@/assets/accessories/black-bracelet.jpg";
import simpleChain from "@/assets/accessories/simple-chain.jpg";
import casualWatch from "@/assets/accessories/casual-watch.jpg";
import cleanChain from "@/assets/accessories/clean-chain.jpg";
import minimalRing from "@/assets/accessories/minimal-ring.jpg";
import smartwatch from "@/assets/accessories/smartwatch.jpg";
import sportyBracelet from "@/assets/accessories/sporty-bracelet.jpg";
import fieldWatch from "@/assets/accessories/field-watch.jpg";
import texturedRing from "@/assets/accessories/textured-ring.jpg";
import retroWatch from "@/assets/accessories/retro-watch.jpg";
import classicRing from "@/assets/accessories/classic-ring.jpg";
import ropeChain from "@/assets/accessories/rope-chain.jpg";
import tacticalWatch from "@/assets/accessories/tactical-watch.jpg";
import matteChain from "@/assets/accessories/matte-chain.jpg";
import utilityRing from "@/assets/accessories/utility-ring.jpg";
import layeredChain from "@/assets/accessories/layered-chain.jpg";
import distressedBracelet from "@/assets/accessories/distressed-bracelet.jpg";
import flashyChain from "@/assets/accessories/flashy-chain.jpg";
import statementWatch from "@/assets/accessories/statement-watch.jpg";
import crossPendant from "@/assets/accessories/cross-pendant.jpg";
import darkRing from "@/assets/accessories/dark-ring.jpg";
import subtleBracelet from "@/assets/accessories/subtle-bracelet.jpg";
import cleanRing from "@/assets/accessories/clean-ring.jpg";
import boldWatch from "@/assets/accessories/bold-watch.jpg";
import elegantBracelet from "@/assets/accessories/elegant-bracelet.jpg";
import cleanBracelet from "@/assets/accessories/clean-bracelet.jpg";
import beadedBracelet from "@/assets/accessories/beaded-bracelet.jpg";
import shellNecklace from "@/assets/accessories/shell-necklace.jpg";
import casualRing from "@/assets/accessories/casual-ring.jpg";
import pearlNecklace from "@/assets/accessories/pearl-necklace.jpg";
import studEarring from "@/assets/accessories/stud-earring.jpg";
import hoopEarring from "@/assets/accessories/hoop-earring.jpg";
import huggieEarring from "@/assets/accessories/huggie-earring.jpg";
import dropEarring from "@/assets/accessories/drop-earring.jpg";
import crossEarring from "@/assets/accessories/cross-earring.jpg";
import pearlEarring from "@/assets/accessories/pearl-earring.jpg";

export type AccessoryMeta = {
  image: string;
};

export const ACCESSORY_META: Record<string, AccessoryMeta> = {
  "Cuban Chain": { image: cubanChain },
  "Sporty Watch": { image: sportyWatch },
  "Bracelet": { image: bracelet },
  "Chunky Ring": { image: chunkyRing },
  "Sleek Watch": { image: sleekWatch },
  "Thin Chain": { image: thinChain },
  "Minimal Bracelet": { image: minimalBracelet },
  "Dress Watch": { image: dressWatch },
  "Signet Ring": { image: signetRing },
  "Thin Bracelet": { image: thinBracelet },
  "Minimal Watch": { image: minimalWatch },
  "Subtle Ring": { image: subtleRing },
  "Leather Bracelet": { image: leatherBracelet },
  "Cufflinks": { image: cufflinks },
  "Elegant Ring": { image: elegantRing },
  "Luxury Watch": { image: luxuryWatch },
  "Statement Ring": { image: statementRing },
  "Thick Chain": { image: thickChain },
  "Layered Ring": { image: layeredRing },
  "Black Bracelet": { image: blackBracelet },
  "Simple Chain": { image: simpleChain },
  "Casual Watch": { image: casualWatch },
  "Clean Chain": { image: cleanChain },
  "Minimal Ring": { image: minimalRing },
  "Smartwatch": { image: smartwatch },
  "Sporty Bracelet": { image: sportyBracelet },
  "Field Watch": { image: fieldWatch },
  "Textured Ring": { image: texturedRing },
  "Retro Watch": { image: retroWatch },
  "Classic Ring": { image: classicRing },
  "Rope Chain": { image: ropeChain },
  "Tactical Watch": { image: tacticalWatch },
  "Matte Chain": { image: matteChain },
  "Utility Ring": { image: utilityRing },
  "Layered Chain": { image: layeredChain },
  "Distressed Bracelet": { image: distressedBracelet },
  "Flashy Chain": { image: flashyChain },
  "Statement Watch": { image: statementWatch },
  "Cross Pendant": { image: crossPendant },
  "Dark Ring": { image: darkRing },
  "Subtle Bracelet": { image: subtleBracelet },
  "Clean Ring": { image: cleanRing },
  "Bold Watch": { image: boldWatch },
  "Elegant Bracelet": { image: elegantBracelet },
  "Clean Bracelet": { image: cleanBracelet },
  "Beaded Bracelet": { image: beadedBracelet },
  "Shell Necklace": { image: shellNecklace },
  "Casual Ring": { image: casualRing },
  "Pearl Necklace": { image: pearlNecklace },
  "Stud Earring": { image: studEarring },
  "Hoop Earring": { image: hoopEarring },
  "Huggie Earring": { image: huggieEarring },
  "Drop Earring": { image: dropEarring },
  "Cross Earring": { image: crossEarring },
  "Pearl Earring": { image: pearlEarring },
};

export const getAccessoryMeta = (name: string): AccessoryMeta | undefined => {
  if (ACCESSORY_META[name]) return ACCESSORY_META[name];
  // fallback fuzzy: last-word match
  const last = name.toLowerCase().split(" ").pop();
  const key = Object.keys(ACCESSORY_META).find(
    (k) => k.toLowerCase().split(" ").pop() === last,
  );
  return key ? ACCESSORY_META[key] : undefined;
};
