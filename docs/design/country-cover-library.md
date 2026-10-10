# Country cover library

## Selection

30 country destinations guided by the 2024 arrivals ranking in UN Tourism's November 2025 World Tourism Barometer (Statistical Annex A-7, PDF page 15): [source](https://cms.czechtourism.cz/cms/getmedia/9db51d67-8a8f-4731-86b9-16b079568886/2025-world-tourism-barometer-and-statistical-annex-november-2025.pdf). Hong Kong and Macao are separately listed destinations in the source and are omitted from this country-only set; Czechia and Indonesia extend the selection to 30 countries. The source ranking is provisional and includes destinations with missing current-year data, so this is a design library of popular destinations, not a definitive live top-30 ranking.

## Rendering and selection

- Original 1024 × 1536 PNG artwork, created with the built-in image generation tool using the existing Italy, Tokyo and Rome covers as style references.
- Italy and Vietnam reuse their original approved-direction artwork. City variants remain on disk but are not part of the country pool.
- The country registry is `src/lib/travel-covers.ts`.
- Each new server page request samples six distinct countries without replacement. The server sends that exact set to the client, so hydration never reshuffles the page or swaps in a second set of images.
- The hero uses the first three selected covers, and the horizontal/vertical gallery uses all six. FAQ interactions, scrolling and viewport resizing retain the selection.
- Only the selected artwork is rendered; the entire library is not downloaded on each visit.
- Browser back/forward navigation can restore its previous page state. A reload requests a fresh sample, which may legitimately include some countries from the previous sample.

## Assets

| Country | File | Illustration |
| --- | --- | --- |
| France | `public/images/landing/covers/france.png` | Midnight French blue background, warm ivory title and golden year. Large elegant Eiffel Tower in warm gold and cream, graceful precise ironwork and confident silhouette, no surrounding city. |
| Spain | `public/images/landing/covers/spain.png` | Warm vermilion background, butter-yellow title and ivory year. Large open Spanish folding fan with scalloped cream and golden paper, terracotta ribs and a restrained red floral motif. |
| United States | `public/images/landing/covers/usa.png` | Dusty rose-pink background, deep forest green title and cream year. Large verdigris green Statue of Liberty bust with raised torch and crown, flat sculptural turquoise and deep-teal shapes. |
| Türkiye | `public/images/landing/covers/turkey.png` | Warm ivory background, deep burgundy title and taupe year. A Turkish tulip-shaped clear glass of ruby tea with a dark spoon on an ivory saucer; match the Istanbul cover in the established collection. |
| Italy | `public/images/landing/covers/italy.png` | Existing lemon artwork. |
| Mexico | `public/images/landing/covers/mexico.png` | Marigold orange background, dark green title and ivory year. A large curved brilliant red chili pepper with an elegant green stem, expressive organic silhouette and flat vermilion highlight shapes. |
| United Kingdom | `public/images/landing/covers/uk.png` | Midnight navy background, warm ivory title and coral year. A large beautiful Big Ben Elizabeth Tower, ochre sandstone and warm gold clock faces, precise flat dark blue shadow details. Title UNITED KINGDOM is a single condensed line. |
| Germany | `public/images/landing/covers/germany.png` | Pale sage green background, dark evergreen title and cream year. A large golden soft pretzel with interlaced arms, deep caramel inner edges and a few ivory salt crystals; bold organic food illustration. |
| Japan | `public/images/landing/covers/japan.png` | Warm ivory background, sage green title and red year. A large vermilion Japanese torii gate with curved dark green roof, cream architectural details, flat perspective; match the Tokyo cover in the established collection. |
| China | `public/images/landing/covers/china.png` | Deep lacquer red background, golden butter-yellow title and ivory year. A large ornate red-and-gold Chinese lantern with an elegant golden tassel, confident flat red panels and gold ribs; no letters on lantern. |
| Greece | `public/images/landing/covers/greece.png` | Rich Aegean blue background, ivory title and pale lemon year. An iconic whitewashed Greek island chapel with rounded blue dome, small bell arch and warm cream shadows, a tiny olive branch at its base. |
| Thailand | `public/images/landing/covers/thailand.png` | Soft hibiscus pink background, burgundy title and warm ivory year. One large sliced dragon fruit, white flesh with tiny dark seeds and brilliant magenta skin with green curling tips, sophisticated botanical cut-paper shapes. |
| Austria | `public/images/landing/covers/austria.png` | Pale icy blue background, dark pine green title and warm ivory year. Large alpine edelweiss flower, elegant ivory star-shaped petals and golden center, with two rich green leaves. Precise organic botanical illustration. |
| United Arab Emirates | `public/images/landing/covers/uae.png` | Warm desert sand background, dark marine-blue title and ivory year. Large graceful Burj Al Arab sail-shaped building with blue glass and cream structural frame, small flat turquoise sea at its base. |
| Saudi Arabia | `public/images/landing/covers/saudi-arabia.png` | Warm golden sand background, deep date-palm green title and ivory year. Large elegant Arabian brass dallah coffee pot, long curved spout, tall finial, ornate handle, golden ochre body with restrained cream highlights and deep amber shadows. Single-line condensed heading. |
| Portugal | `public/images/landing/covers/portugal.png` | Warm cream background, cobalt blue title and terracotta year. A striking Portuguese decorative rooster with bright red comb, cobalt and red body, cream botanical cut-paper motifs, elegantly graphic traditional ceramic-inspired shape. |
| Malaysia | `public/images/landing/covers/malaysia.png` | Deep emerald background, pale butter-yellow title and coral year. Large red hibiscus bloom with five organic layered scarlet petals and a slender yellow-tipped stamen, two rich green leaves. |
| Netherlands | `public/images/landing/covers/netherlands.png` | Deep forest green background, butter-yellow title and year. Large elegant bouquet of four tulips in pink, golden yellow, orange and ivory, long green leaves and graceful stems, match Amsterdam in existing collection. Condense long heading into one line. |
| India | `public/images/landing/covers/india.png` | Saffron orange background, deep magenta title and ivory year. Large elegant warm-ivory Taj Mahal with its central onion dome and four minarets, flat rose and gold shadow details, a tiny teal reflection below. |
| Canada | `public/images/landing/covers/canada.png` | Warm pale cream background, vermilion title and burgundy year. A large organically shaped red maple leaf on a slender stem, flat crimson and coral segmented surfaces, beautifully crisp pointed edges. |
| Poland | `public/images/landing/covers/poland.png` | Pale duck-egg blue background, deep cherry-red title and cream year. A large colourful Polish folk paper-cut flower arrangement, symmetrical red and orange blossoms, dark green leaves and a central stylized white flower. Sophisticated restrained folk art. |
| Denmark | `public/images/landing/covers/denmark.png` | Pale butter-yellow background, navy title and red year. Three charming tall Copenhagen Nyhavn gabled waterfront houses in scarlet, ochre and blue, precise cream windows and a small deep-blue water reflection, one compact architectural illustration. |
| Vietnam | `public/images/landing/covers/vietnam.png` | Existing conical hat artwork. |
| Morocco | `public/images/landing/covers/morocco.png` | Warm terracotta orange background, deep cobalt title and ivory year. A large graceful Moroccan brass lantern with cobalt glass panels, arched openings, fine geometric perforations rendered clearly in flat shapes, no writing. |
| Croatia | `public/images/landing/covers/croatia.png` | Clear Adriatic turquoise background, deep red title and cream year. Compact beautiful Dubrovnik stone walls and a terracotta roofed watchtower, warm ivory stonework and dark blue shadow details, a small flat sea shape below. |
| South Korea | `public/images/landing/covers/south-korea.png` | Warm ivory background, dark navy title and coral year. An elegant folded Korean hand fan with indigo outer rim and painted pale-pink plum blossoms on a graceful dark branch, soft cream pleats, flat refined forms. Heading on one condensed line. |
| Russia | `public/images/landing/covers/russia.png` | Muted sky-blue background, deep brick red title and ivory year. A large cluster of beautiful Saint Basil's Cathedral onion domes, golden ochre, coral, mint and emerald geometric patterns, warm cream architectural base; unified simplified travel poster illustration. |
| Egypt | `public/images/landing/covers/egypt.png` | Pale sand-yellow background, deep burgundy title and terracotta year. Three large iconic pyramids with warm golden sun disk, crisp triangular silhouettes in golden ochre and burnt sienna, small quiet sand dune at base, no full landscape. |
| Czechia | `public/images/landing/covers/czechia.png` | Dusty peach background, dark ink-blue title and ivory year. A large richly illustrated Prague astronomical clock face in deep teal, gold and cream with a small ornate warm sandstone surround, refined flat architectural details. |
| Indonesia | `public/images/landing/covers/indonesia.png` | Warm peach background, forest-green title and ivory year. A large elegant Balinese split gate with two symmetrical terracotta stone towers, intricate but clear flat stepped silhouettes and tiny dark-green palm fronds at base. |

## Shared generation brief

Each new asset uses the same oversized condensed country title, right-aligned 2025, large flat travel illustration, restrained palette and 2:3 portrait format. Full per-country prompts are recorded in [country-cover-generation-prompts.md](./country-cover-generation-prompts.md).
