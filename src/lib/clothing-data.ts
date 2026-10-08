// The clothing layer — key garments that build each vibe, each shoppable
// via retailer search deep-links (see shop-links.ts), with a reference photo
// hotlinked from Unsplash/Pexels (free-license stock, no key required).

export type ClothingItem = {
  item: string;
  query: string;
  image: string;
};

export const VIBE_CLOTHING: Record<string, ClothingItem[]> = {
  Streetwear: [
    { item: "Oversized graphic tee", query: "oversized graphic tshirt men streetwear", image: "https://images.unsplash.com/photo-1678872844677-d650b788709b?auto=format&fit=crop&w=800&q=80" },
    { item: "Cargo pants", query: "cargo pants men baggy", image: "https://images.unsplash.com/photo-1584302052177-2e90841dad6a?auto=format&fit=crop&w=800&q=80" },
    { item: "Zip-up hoodie", query: "oversized zip hoodie men", image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=800&q=80" },
    { item: "Chunky sneakers", query: "chunky sneakers men white", image: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=800&q=80" },
    { item: "Baseball cap", query: "baseball cap men streetwear", image: "https://images.unsplash.com/photo-1543365595-7c3ff8309695?auto=format&fit=crop&w=800&q=80" },
  ],
  Minimal: [
    { item: "Plain heavyweight tee", query: "plain heavyweight tshirt men neutral", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80" },
    { item: "Straight-fit trousers", query: "straight fit trousers men beige", image: "https://images.unsplash.com/photo-1601561446301-fecc99036f4b?auto=format&fit=crop&w=800&q=80" },
    { item: "Minimal white sneakers", query: "minimal white sneakers men", image: "https://images.unsplash.com/photo-1625860191460-10a66c7384fb?auto=format&fit=crop&w=800&q=80" },
    { item: "Unstructured overshirt", query: "overshirt men solid minimal", image: "https://images.unsplash.com/photo-1586689311267-e88bb0509995?auto=format&fit=crop&w=800&q=80" },
  ],
  "Old Money": [
    { item: "Linen shirt", query: "linen shirt men white full sleeve", image: "https://images.unsplash.com/photo-1713881587420-113c1c43e28a?auto=format&fit=crop&w=800&q=80" },
    { item: "Pleated trousers", query: "pleated trousers men cream", image: "https://images.unsplash.com/photo-1643622000342-65f9fdeb50d9?auto=format&fit=crop&w=800&q=80" },
    { item: "Suede loafers", query: "suede loafers men tan", image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?auto=format&fit=crop&w=800&q=80" },
    { item: "Knit polo", query: "knitted polo tshirt men", image: "https://images.unsplash.com/photo-1586363090844-099253d6a1cb?auto=format&fit=crop&w=800&q=80" },
    { item: "Cable-knit sweater", query: "cable knit sweater men", image: "https://images.unsplash.com/photo-1642886512785-b5fee9faad7f?auto=format&fit=crop&w=800&q=80" },
  ],
  "Smart Casual": [
    { item: "Pique polo", query: "polo tshirt men solid premium", image: "https://images.unsplash.com/photo-1625910513399-c9fcba54338c?auto=format&fit=crop&w=800&q=80" },
    { item: "Chino trousers", query: "chinos men slim fit", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80" },
    { item: "Clean leather sneakers", query: "leather sneakers men white minimal", image: "https://images.unsplash.com/photo-1718802312665-d8219d8c64ed?auto=format&fit=crop&w=800&q=80" },
    { item: "Blazer (unstructured)", query: "casual blazer men unstructured", image: "https://images.unsplash.com/photo-1630173250799-2813d34ed14b?auto=format&fit=crop&w=800&q=80" },
  ],
  Formal: [
    { item: "Slim-fit suit", query: "slim fit suit men 2 piece", image: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=800&q=80" },
    { item: "Dress shirt", query: "formal shirt men white cotton", image: "https://images.unsplash.com/photo-1603252109612-24fa03d145c8?auto=format&fit=crop&w=800&q=80" },
    { item: "Oxford shoes", query: "oxford formal shoes men black leather", image: "https://images.unsplash.com/photo-1552422554-0d5af0c79fc6?auto=format&fit=crop&w=800&q=80" },
    { item: "Silk tie", query: "silk tie men formal", image: "https://images.unsplash.com/photo-1779630389516-334d96704c83?auto=format&fit=crop&w=800&q=80" },
  ],
  Luxury: [
    { item: "Designer-cut shirt", query: "premium satin shirt men designer", image: "https://images.unsplash.com/photo-1746527972193-75501390df37?auto=format&fit=crop&w=800&q=80" },
    { item: "Tailored trousers", query: "tailored trousers men premium wool", image: "https://images.unsplash.com/photo-1540704751673-44f9dfd188c0?auto=format&fit=crop&w=800&q=80" },
    { item: "Leather loafers", query: "leather loafers men premium horsebit", image: "https://images.unsplash.com/photo-1616406432452-07bc5938759d?auto=format&fit=crop&w=800&q=80" },
    { item: "Overcoat", query: "wool overcoat men long premium", image: "https://images.unsplash.com/photo-1619603364937-8d7af41ef206?auto=format&fit=crop&w=800&q=80" },
  ],
  Edgy: [
    { item: "Black slim jeans", query: "black slim jeans men ripped", image: "https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Leather biker jacket", query: "leather biker jacket men black", image: "https://images.unsplash.com/photo-1571568727822-8db701e2179c?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Combat boots", query: "combat boots men black", image: "https://images.pexels.com/photos/3208298/pexels-photo-3208298.jpeg" },
    { item: "Black graphic tee", query: "black graphic tshirt men rock", image: "https://images.unsplash.com/photo-1565383690591-1ee1b6582cef?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
  ],
  Casual: [
    { item: "Crew-neck tee", query: "crew neck tshirt men cotton solid", image: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Blue jeans", query: "jeans men regular fit blue", image: "https://images.unsplash.com/photo-1570308345368-f21d4b0d81a9?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Everyday sneakers", query: "casual sneakers men everyday", image: "https://images.pexels.com/photos/5172731/pexels-photo-5172731.jpeg" },
    { item: "Light overshirt", query: "casual overshirt men cotton", image: "https://images.pexels.com/photos/9789623/pexels-photo-9789623.jpeg" },
  ],
  Monochrome: [
    { item: "Tonal tee", query: "plain tshirt men black white grey", image: "https://images.unsplash.com/photo-1567505710530-bb2381131f2b?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Matching-tone trousers", query: "relaxed trousers men grey monochrome", image: "https://images.unsplash.com/photo-1563450222950-e325d26f4c71?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Tonal sneakers", query: "all black sneakers men", image: "https://images.pexels.com/photos/15694157/pexels-photo-15694157.jpeg" },
    { item: "Same-family outer layer", query: "monochrome jacket men grey", image: "https://images.unsplash.com/photo-1522973000467-8af35c4f36b6?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
  ],
  Sporty: [
    { item: "Performance tee", query: "sports tshirt men dri fit", image: "https://images.pexels.com/photos/341003/pexels-photo-341003.jpeg" },
    { item: "Joggers", query: "joggers men slim training", image: "https://images.unsplash.com/photo-1635439714465-3ed3e6a122e3?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Running shoes", query: "running shoes men cushioned", image: "https://plus.unsplash.com/premium_photo-1672046218369-67e12ed1c364?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Track jacket", query: "track jacket men sports", image: "https://images.unsplash.com/photo-1519764622345-23439dd774f7?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
  ],
  Rugged: [
    { item: "Flannel shirt", query: "flannel check shirt men", image: "https://images.unsplash.com/photo-1629602445439-caeb8601f13e?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Selvedge / raw denim", query: "raw denim jeans men dark", image: "https://images.unsplash.com/photo-1550505363-0ccfd722d763?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Leather boots", query: "leather boots men brown rugged", image: "https://images.unsplash.com/photo-1532260040485-e692ef446b51?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Field jacket", query: "field jacket men olive", image: "https://images.unsplash.com/photo-1549399239-fb3c102d3d71?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
  ],
  Vintage: [
    { item: "Retro graphic tee", query: "retro graphic tshirt men vintage wash", image: "https://images.pexels.com/photos/1469058/pexels-photo-1469058.jpeg" },
    { item: "Straight-leg washed jeans", query: "straight fit washed jeans men vintage", image: "https://images.unsplash.com/photo-1613845229958-0f638e3e4084?fm=jpg&q=60&w=3000&auto=format&fit=crop" },
    { item: "Corduroy shirt", query: "corduroy shirt men", image: "https://images.pexels.com/photos/10188088/pexels-photo-10188088.jpeg" },
    { item: "Retro sneakers", query: "retro sneakers men suede", image: "https://images.pexels.com/photos/2882861/pexels-photo-2882861.jpeg" },
  ],
  Techwear: [
    { item: "Tactical cargo pants", query: "tactical cargo pants men black techwear", image: "https://images.pexels.com/photos/19392459/pexels-photo-19392459.jpeg" },
    { item: "Softshell jacket", query: "softshell jacket men black hooded", image: "https://images.unsplash.com/photo-1575507051740-fc540729829f" },
    { item: "Tech runner shoes", query: "techwear shoes men black", image: "https://images.unsplash.com/photo-1619203696083-02bd602de876" },
    { item: "Crossbody utility bag", query: "tactical crossbody bag men", image: "https://images.unsplash.com/photo-1569484221992-2a453658fff3" },
  ],
  Grunge: [
    { item: "Oversized flannel", query: "oversized flannel shirt men grunge", image: "https://images.unsplash.com/photo-1597557101685-c5ed17c41c94" },
    { item: "Ripped jeans", query: "ripped jeans men distressed", image: "https://images.pexels.com/photos/936059/pexels-photo-936059.jpeg" },
    { item: "Washed band tee", query: "band tshirt men washed oversized", image: "https://images.unsplash.com/photo-1566635414930-87d7560ec1b1" },
    { item: "Worn-in boots", query: "suede boots men distressed", image: "https://images.unsplash.com/photo-1608629601270-a0007becead3" },
  ],
  Preppy: [
    { item: "Cotton polo", query: "polo tshirt men striped preppy", image: "https://images.unsplash.com/photo-1566761284295-af58908238bb" },
    { item: "Chinos", query: "chinos men khaki slim", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942" },
    { item: "Penny loafers", query: "penny loafers men brown", image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47" },
    { item: "V-neck sweater", query: "v neck sweater men cotton", image: "https://images.unsplash.com/photo-1522318462851-4fbd0d239748" },
  ],
  Y2K: [
    { item: "Baggy jeans", query: "baggy jeans men y2k", image: "https://images.unsplash.com/photo-1767899390405-7bdbd9bf7340" },
    { item: "Graphic baby tee / mesh top", query: "y2k graphic tshirt men", image: "https://images.unsplash.com/photo-1635976906760-d7f5568a457e" },
    { item: "Puffer jacket", query: "puffer jacket men glossy", image: "https://images.pexels.com/photos/11047380/pexels-photo-11047380.jpeg" },
    { item: "Retro basketball sneakers", query: "retro basketball shoes men", image: "https://images.pexels.com/photos/31507731/pexels-photo-31507731.jpeg" },
  ],
  Goth: [
    { item: "All-black layered top", query: "black oversized tshirt men longline", image: "https://images.unsplash.com/photo-1570158268183-d296b2892211" },
    { item: "Black skinny/wide jeans", query: "black jeans men goth", image: "https://images.unsplash.com/photo-1519342546310-fbf5a166716b" },
    { item: "Platform boots", query: "black platform boots men", image: "https://images.unsplash.com/photo-1777400154125-b53a325057b9" },
    { item: "Long black coat", query: "long black coat men", image: "https://images.unsplash.com/photo-1530141828036-d9048b0c2f3b" },
  ],
  "Business Casual": [
    { item: "Oxford shirt", query: "oxford shirt men light blue", image: "https://images.unsplash.com/photo-1559638862-156d0b977e5e" },
    { item: "Dress trousers", query: "formal trousers men slim grey", image: "https://images.pexels.com/photos/35414994/pexels-photo-35414994.jpeg" },
    { item: "Derby shoes", query: "derby shoes men brown leather", image: "https://images.pexels.com/photos/2562992/pexels-photo-2562992.png" },
    { item: "Merino sweater", query: "merino wool sweater men", image: "https://images.unsplash.com/photo-1576110598658-096ae24cdb97" },
  ],
  Partywear: [
    { item: "Satin / printed shirt", query: "satin party shirt men printed", image: "https://images.unsplash.com/photo-1757802504647-afc994581932?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Black fitted trousers", query: "black slim trousers men party", image: "https://images.unsplash.com/photo-1617113930975-f9c7243ae527?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Chelsea boots", query: "chelsea boots men black suede", image: "https://images.unsplash.com/photo-1534233812932-59b8fa1b780c?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Statement jacket", query: "party blazer men statement", image: "https://images.unsplash.com/photo-1549998966-8e0e3e5e83ad?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
  ],
  "Summer Linen": [
    { item: "Linen shirt", query: "linen shirt men half sleeve beige", image: "https://images.unsplash.com/photo-1591357037205-166318b51afd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Linen trousers", query: "linen trousers men relaxed", image: "https://images.unsplash.com/photo-1623200693945-ec1e9991039a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Espadrilles / loafers", query: "espadrilles men summer", image: "https://images.unsplash.com/photo-1616406432452-07bc5938759d?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Straw / bucket hat", query: "straw hat men summer", image: "https://images.unsplash.com/photo-1680062335497-d45491e94132?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
  ],
  "Clean Fit": [
    { item: "Fitted plain tee", query: "fitted plain tshirt men premium cotton", image: "https://images.unsplash.com/photo-1619376269004-7e287504b323?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Tapered trousers", query: "tapered trousers men slim", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942" },
    { item: "Spotless white sneakers", query: "white leather sneakers men clean", image: "https://images.unsplash.com/photo-1585843736857-bd7438e55c67?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Structured overshirt", query: "structured overshirt men solid", image: "https://images.unsplash.com/photo-1601935033900-059813f9abfc" },
  ],
  Beachwear: [
    { item: "Open cuban-collar shirt", query: "cuban collar shirt men printed beach", image: "https://images.unsplash.com/photo-1739758614124-b7ece08794f0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Linen / cotton shorts", query: "linen shorts men beach", image: "https://images.unsplash.com/photo-1621496503717-095a410e1566?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Slides / sandals", query: "slides men premium", image: "https://images.unsplash.com/photo-1667314614949-e7e45c8074fd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
    { item: "Lightweight open shirt", query: "open beach shirt men lightweight", image: "https://images.unsplash.com/photo-1725328522134-e1011b97a918?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0" },
  ],
};

export const getVibeClothing = (vibe: string): ClothingItem[] =>
  VIBE_CLOTHING[vibe] ?? [];
