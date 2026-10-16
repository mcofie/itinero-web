# Flat object cover prompts

Copy-paste prompts for generating the transparent subjects used by the [flat object covers](./flat-object-covers.md). The compositor adds each cover's solid background and places the art safely below its title.

## How to generate

1. Open a new image-generation chat. For the first subject, attach an approved cover as a style reference and request the same painted style with actual transparency and no lettering.
2. Paste one country's prompt per message so the style stays consistent. Generate a complete object with transparent margin on every side.
3. If any part is cut off, ask for the full object within the canvas. If the background is opaque, ask for actual transparent alpha.
4. Download each approved image under the file name shown into one local cutout directory.
5. Run `node scripts/archive-flat-cover-cutouts.mjs <cutout-directory>`, then `node scripts/compose-flat-cover-art.mjs assets/album-cover-cutouts`.
6. Run `node scripts/render-flat-cover-contact-sheet.mjs`, review the 4:5 print sheet, then run `npm run optimize:album-thumbs` and `npm run optimize:landing`.

Start with a batch of six, for example Portugal, Japan, United Kingdom, Morocco, Kenya and Sweden, and check them side by side before doing the rest.

[France](#france) · [Spain](#spain) · [United States](#usa) · [Türkiye](#turkey) · [Italy](#italy) · [Mexico](#mexico) · [United Kingdom](#uk) · [Germany](#germany) · [Japan](#japan) · [China](#china) · [Greece](#greece) · [Thailand](#thailand) · [Austria](#austria) · [United Arab Emirates](#uae) · [Saudi Arabia](#saudi-arabia) · [Portugal](#portugal) · [Malaysia](#malaysia) · [Netherlands](#netherlands) · [India](#india) · [Canada](#canada) · [Poland](#poland) · [Denmark](#denmark) · [Vietnam](#vietnam) · [Morocco](#morocco) · [Croatia](#croatia) · [South Korea](#south-korea) · [Russia](#russia) · [Egypt](#egypt) · [Czechia](#czechia) · [Indonesia](#indonesia) · [Ghana](#ghana) · [South Africa](#south-africa) · [Kenya](#kenya) · [Nigeria](#nigeria) · [Tanzania](#tanzania) · [Switzerland](#switzerland) · [Australia](#australia) · [Brazil](#brazil) · [Ireland](#ireland) · [Norway](#norway) · [Singapore](#singapore) · [Philippines](#philippines) · [Cambodia](#cambodia) · [New Zealand](#new-zealand) · [Argentina](#argentina) · [Chile](#chile) · [Peru](#peru) · [Colombia](#colombia) · [Rwanda](#rwanda) · [Senegal](#senegal) · [Côte d’Ivoire](#cote-divoire) · [Togo](#togo) · [Benin](#benin) · [Uganda](#uganda) · [Namibia](#namibia) · [Mauritius](#mauritius) · [Tunisia](#tunisia) · [Sweden](#sweden) · [Finland](#finland) · [Iceland](#iceland) · [Belgium](#belgium) · [Hungary](#hungary) · [Jordan](#jordan) · [Qatar](#qatar) · [Sri Lanka](#sri-lanka) · [Nepal](#nepal) · [Taiwan](#taiwan) · [Costa Rica](#costa-rica) · [Dominican Republic](#dominican-republic) · [Ecuador](#ecuador) · [Armenia](#armenia) · [Kazakhstan](#kazakhstan) · [Belarus](#belarus) · [Maldives](#maldives) · [Cuba](#cuba) · [Jamaica](#jamaica) · [Bahamas](#bahamas) · [Guatemala](#guatemala) · [Bolivia](#bolivia) · [Uruguay](#uruguay) · [Panama](#panama) · [Ethiopia](#ethiopia) · [Madagascar](#madagascar) · [Botswana](#botswana) · [Zimbabwe](#zimbabwe) · [Seychelles](#seychelles) · [Cameroon](#cameroon) · [Cape Verde](#cape-verde) · [Malta](#malta) · [Cyprus](#cyprus) · [Slovenia](#slovenia) · [Montenegro](#montenegro) · [Romania](#romania) · [Estonia](#estonia) · [Georgia](#georgia) · [Albania](#albania) · [Laos](#laos) · [Mongolia](#mongolia) · [Uzbekistan](#uzbekistan) · [Bhutan](#bhutan) · [Oman](#oman) · [Lebanon](#lebanon) · [Fiji](#fiji) · [Pakistan](#pakistan)
 · [Bulgaria](#bulgaria) · [Ukraine](#ukraine) · [Serbia](#serbia) · [Slovakia](#slovakia) · [Lithuania](#lithuania) · [Latvia](#latvia) · [Luxembourg](#luxembourg) · [Bosnia and Herzegovina](#bosnia-and-herzegovina) · [North Macedonia](#north-macedonia) · [Azerbaijan](#azerbaijan) · [Kyrgyzstan](#kyrgyzstan) · [Bangladesh](#bangladesh) · [Myanmar](#myanmar) · [Brunei](#brunei) · [Paraguay](#paraguay) · [Venezuela](#venezuela) · [Zambia](#zambia) · [Mozambique](#mozambique) · [Papua New Guinea](#papua-new-guinea) · [Vanuatu](#vanuatu)
 · [Algeria](#algeria) · [Angola](#angola) · [The Gambia](#gambia) · [Malawi](#malawi) · [Gabon](#gabon) · [Andorra](#andorra) · [Monaco](#monaco) · [San Marino](#san-marino) · [Liechtenstein](#liechtenstein) · [Moldova](#moldova) · [Tajikistan](#tajikistan) · [Iran](#iran) · [Timor-Leste](#timor-leste) · [Palestine](#palestine) · [Belize](#belize) · [Nicaragua](#nicaragua) · [Barbados](#barbados) · [Trinidad and Tobago](#trinidad-and-tobago) · [Samoa](#samoa) · [Palau](#palau)

## Prompts

### france

France · save as `france.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Eiffel Tower at full height, elegant wrought-iron lattice in warm bronze-brown with fine ironwork detail.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### spain

Spain · save as `spain.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a fully opened Spanish flamenco hand fan with red fabric, a lace edge, a cream floral pattern and dark lacquered wooden ribs.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### usa

United States · save as `usa.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Statue of Liberty's head with its spiked crown and her raised arm holding the torch with a golden flame, in verdigris-green copper.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### turkey

Türkiye · save as `turkey.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a tulip-shaped clear Turkish tea glass of deep ruby-red tea on a small red-and-gold saucer, with a sugar cube and a slim teaspoon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### italy

Italy · save as `italy.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: three whole lemons and two cut lemon halves showing juicy segments, on a short branch with glossy dark green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mexico

Mexico · save as `mexico.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a prickly-pear (nopal) cactus with flat paddle segments, magenta and yellow blossoms and ripe red fruits.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uk

United Kingdom · save as `uk.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a classic red cast-iron London K6 telephone kiosk at a slight three-quarter angle, with a domed crown roof, many small window panes and glossy pillar-box-red paint; the header panels are plain with no words.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### germany

Germany · save as `germany.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a large golden-brown soft Bavarian pretzel with a glossy crust, a thick plump belly and coarse white salt crystals.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### japan

Japan · save as `japan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: two ornamental koi fish swimming in a graceful curving circle, seen from above, one white with vivid orange-red patches (kohaku) and one gold-orange, with flowing translucent fins and finely painted scales.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### china

China · save as `china.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a round red silk Chinese lantern with gold caps at the top and bottom and a long red silk tassel hanging below.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### greece

Greece · save as `greece.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an ancient Greek amphora in terracotta-orange clay with black-figure painting: a meander (Greek key) band and simple classical figures.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### thailand

Thailand · save as `thailand.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: mango sticky rice on a white ceramic plate lined with banana leaf: sliced ripe golden mango, a mound of white sticky rice drizzled with coconut cream, and a pink-and-white frangipani flower.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### austria

Austria · save as `austria.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a slice of Sachertorte with a glossy dark chocolate glaze and a thin apricot jam layer, on a small white plate with a dollop of whipped cream.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uae

United Arab Emirates · save as `uae.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Arabic brass dallah coffee pot with a long crescent-shaped spout, a tall pointed lid and engraved details, with two small handleless cups.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### saudi-arabia

Saudi Arabia · save as `saudi-arabia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a shallow engraved brass bowl heaped with glossy Medjool dates, deep amber and brown with wrinkled skins.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### portugal

Portugal · save as `portugal.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: three Portuguese pastéis de nata custard tarts on a small white-and-blue azulejo-patterned saucer, with flaky golden layered pastry, blistered caramelised dark-brown spots on the custard and a light dusting of cinnamon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### malaysia

Malaysia · save as `malaysia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a large red hibiscus flower (bunga raya) with five ruffled petals, a long yellow-tipped stamen and two green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### netherlands

Netherlands · save as `netherlands.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a loose bunch of tulips in red, pink, yellow and white with long green stems and leaves, tied with a twine bow.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### india

India · save as `india.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Taj Mahal seen from the front, white marble with its central onion dome, four minarets and arched entrance, softly shaded in warm ivory.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### canada

Canada · save as `canada.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a bull moose standing in three-quarter view with large palmate antlers and a dark brown coat.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### poland

Poland · save as `poland.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: golden pan-fried pierogi dumplings with crimped edges, topped with caramelised onion and a sprig of dill, on a white plate with a blue folk-floral rim.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### denmark

Denmark · save as `denmark.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Little Mermaid statue of Copenhagen: a slender mermaid seated on a granite boulder, in green-bronze patina.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### vietnam

Vietnam · save as `vietnam.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Vietnamese conical palm-leaf hat (nón lá) shown at an angle, with woven straw texture, fine radial ribs and a red silk chin ribbon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### morocco

Morocco · save as `morocco.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a hand-painted Moroccan ceramic tagine with a tall conical lid and a small knob, decorated in cobalt blue, turquoise and cream geometric zellige-style patterns with a glossy glaze.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### croatia

Croatia · save as `croatia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Dalmatian dog sitting upright, white coat with crisp black spots, alert ears and a friendly face.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### south-korea

South Korea · save as `south-korea.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: bibimbap in a black stone bowl: rice topped with neatly arranged spinach, carrot, bean sprouts, mushrooms and beef, a sunny-side-up egg in the centre and a dab of red gochujang.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### russia

Russia · save as `russia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional matryoshka nesting doll, glossy red with a yellow headscarf, a painted rosy face and floral apron, with one smaller doll beside it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### egypt

Egypt · save as `egypt.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a black Egyptian Bastet cat sitting tall in profile, with a gold earring and a turquoise beaded collar, in front of a large golden full moon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### czechia

Czechia · save as `czechia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Prague astronomical clock: a round gold-and-blue astronomical dial with a zodiac ring and ornate gilded hands, in a carved stone Gothic frame.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### indonesia

Indonesia · save as `indonesia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Komodo dragon walking in three-quarter view, with textured grey-olive scaly skin, powerful claws and a forked tongue.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ghana

Ghana · save as `ghana.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a neatly folded stack of handwoven Ghanaian kente cloth with bold strip-woven geometric patterns in gold, green, red and black.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### south-africa

South Africa · save as `south-africa.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a king protea flower in full bloom with pink pointed bracts around a pale silvery centre, with leathery green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### kenya

Kenya · save as `kenya.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an African elephant walking in three-quarter view, with large fanned ears, long ivory tusks and wrinkled grey skin rendered in warm and cool greys, calm and majestic.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### nigeria

Nigeria · save as `nigeria.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Yoruba dùndún talking drum: an hourglass-shaped carved wooden drum laced with leather tension cords, with a curved drumstick.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### tanzania

Tanzania · save as `tanzania.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a plains zebra standing in three-quarter view, with bold black-and-white stripes and an upright mane.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### switzerland

Switzerland · save as `switzerland.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a large brass Swiss cowbell hanging from a wide embroidered leather strap decorated with edelweiss and alpine flowers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### australia

Australia · save as `australia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a red kangaroo standing upright on its hind legs in profile, with a joey peeking out of its pouch.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### brazil

Brazil · save as `brazil.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a toco toucan perched on a short branch, with a black body, white throat and a huge glossy orange beak with a black tip.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ireland

Ireland · save as `ireland.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Celtic harp in carved polished wood with Celtic knotwork on the pillar and fine strings.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### norway

Norway · save as `norway.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Viking longship in side view with a carved dragon-head prow, a row of round painted shields and a red-and-white striped square sail.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### singapore

Singapore · save as `singapore.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Merlion statue: a white lion-headed fish with a scaled body curling up, spouting a stream of water from its mouth.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### philippines

Philippines · save as `philippines.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Filipino jeepney in three-quarter view, with chrome bodywork, colourful painted stripes, horse ornaments on the bonnet and decorative lights; no lettering or signs.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cambodia

Cambodia · save as `cambodia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the five lotus-bud towers of Angkor Wat in warm sandstone, seen from the front, with fine carved detail.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### new-zealand

New Zealand · save as `new-zealand.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a kiwi bird in profile, with a round brown shaggy-feathered body and a long slender beak.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### argentina

Argentina · save as `argentina.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional mate gourd wrapped in tooled leather with a silver rim, filled with green yerba mate, with a silver bombilla straw.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### chile

Chile · save as `chile.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Rapa Nui moai head from Easter Island, carved volcanic stone in warm grey-brown, with a long nose and a heavy brow.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### peru

Peru · save as `peru.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a llama standing in three-quarter view, with fluffy cream wool, bright woven pompom tassels in its ears and a colourful woven Andean blanket on its back.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### colombia

Colombia · save as `colombia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a white ceramic cup of black coffee on a saucer beside a sprig of ripe red coffee cherries with glossy green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### rwanda

Rwanda · save as `rwanda.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a silverback mountain gorilla sitting calmly, with thick black fur, a silver back and a thoughtful face.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### senegal

Senegal · save as `senegal.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a baobab tree with a massive swollen trunk and short twisted branches carrying sparse green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cote-divoire

Côte d’Ivoire · save as `cote-divoire.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a ripe yellow-orange cocoa pod split open to show white pulp-covered cocoa beans, beside one whole pod and a few dried brown beans.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### togo

Togo · save as `togo.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Tamberma (Takienta) fortified mud tower-house of Koutammakou, with round earthen towers and conical thatched roofs.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### benin

Benin · save as `benin.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Ganvié stilt house of wood and thatch on tall poles, with a narrow wooden pirogue canoe moored beside it and only a small ripple of water beneath.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uganda

Uganda · save as `uganda.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a grey crowned crane standing in profile, with a slate-grey body, white wing panels, a red throat wattle and a spiky golden crown of feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### namibia

Namibia · save as `namibia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a gemsbok (oryx) standing in profile, with long straight rapier horns and bold black-and-white face markings on a sandy grey coat.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mauritius

Mauritius · save as `mauritius.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a dodo standing in three-quarter view, with a plump grey-blue body, a large hooked yellow-green beak, small wings and a tuft of curly tail feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### tunisia

Tunisia · save as `tunisia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an arched Sidi Bou Said wooden door painted bright blue, decorated with black metal studs in ornamental patterns, set in a small whitewashed wall section.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### sweden

Sweden · save as `sweden.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional carved wooden Dalecarlian (Dala) horse in three-quarter side view, glossy red with white, green, yellow and blue kurbits folk decoration and a painted saddle and bridle.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### finland

Finland · save as `finland.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a reindeer standing in three-quarter view, with branching velvety antlers and a thick cream-and-brown winter coat.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### iceland

Iceland · save as `iceland.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an Atlantic puffin standing in three-quarter view, with black-and-white plumage, bright orange feet and a colourful striped orange beak.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### belgium

Belgium · save as `belgium.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Brussels waffle with deep square pockets, dusted with icing sugar and topped with fresh strawberries and whipped cream, on a small white plate.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### hungary

Hungary · save as `hungary.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a hanging string of dried red paprika peppers tied with twine, glossy deep red with curling stems.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### jordan

Jordan · save as `jordan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: Al-Khazneh (the Treasury) of Petra: the rose-pink sandstone facade with columns, a pediment and a central round tholos, shown as a single isolated facade.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### qatar

Qatar · save as `qatar.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a falcon perched on a thick leather falconry glove, wearing an embroidered leather hood, with tan-and-cream speckled feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### sri-lanka

Sri Lanka · save as `sri-lanka.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an Asian elephant in three-quarter view wearing a richly embroidered red-and-gold Kandy Esala Perahera festival cloak.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### nepal

Nepal · save as `nepal.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the Boudhanath stupa: a white dome topped by a gilded square tower painted with the Buddha's eyes and a golden spire, with strings of plain coloured prayer flags (no writing) radiating from the top.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### taiwan

Taiwan · save as `taiwan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a tall clear cup of brown-sugar bubble milk tea with dark tapioca pearls at the bottom, caramel streaks inside the cup and a wide straw; no logo.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### costa-rica

Costa Rica · save as `costa-rica.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a red-eyed tree frog clinging to a green leaf, with a bright green body, blue-and-yellow striped flanks, orange feet and vivid red eyes.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### dominican-republic

Dominican Republic · save as `dominican-republic.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Dominican Limé faceless ceramic doll in a long flowing pastel dress and a wide-brimmed hat, holding a basket of flowers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ecuador

Ecuador · save as `ecuador.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Galápagos giant tortoise walking in three-quarter view, with a large domed dark shell and a wrinkled grey neck.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### armenia

Armenia · save as `armenia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: three ripe pomegranates on a pale ceramic plate, one broken open to show glossy ruby seeds.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### kazakhstan

Kazakhstan · save as `kazakhstan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Kazakh yurt with a cream felt cover, ornamental decorative bands and a carved wooden door.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### belarus

Belarus · save as `belarus.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a European bison (zubr) standing in three-quarter view, with a shaggy dark brown coat, massive shoulders and short curved horns.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### maldives

Maldives · save as `maldives.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: two spotted eagle rays gliding diagonally, with dark navy backs covered in white spots and long whip-like tails.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cuba

Cuba · save as `cuba.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a classic 1950s American convertible car in glossy turquoise with white-wall tyres and chrome trim, in three-quarter view; no number plate or lettering.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### jamaica

Jamaica · save as `jamaica.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Jamaican doctor bird (red-billed streamertail hummingbird) hovering, with iridescent emerald plumage, a black crest, a red bill and two very long black streamer tail feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bahamas

Bahamas · save as `bahamas.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a queen conch shell with a flared glossy pink inner lip and creamy spiralled spikes.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### guatemala

Guatemala · save as `guatemala.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a resplendent quetzal perched on a short branch, with iridescent emerald-green plumage, a crimson belly and very long trailing tail feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bolivia

Bolivia · save as `bolivia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Bolivian cholita's small dark brown felt bowler hat resting on a folded aguayo weaving with bold multicoloured stripes and geometric patterns.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uruguay

Uruguay · save as `uruguay.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a candombe tamboril drum: a tall barrel-shaped wooden drum with painted bands, a stretched hide head and a leather shoulder strap.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### panama

Panama · save as `panama.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Panamanian golden frog sitting on a mossy stone, with a bright golden-yellow body and a few black spots.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ethiopia

Ethiopia · save as `ethiopia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a black clay Ethiopian jebena coffee pot with a round belly, long neck and woven straw stopper, beside small handleless cups and a few roasted coffee beans.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### madagascar

Madagascar · save as `madagascar.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a ring-tailed lemur sitting upright, with soft grey fur, a white face mask, amber eyes and a long black-and-white ringed tail curling upward.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### botswana

Botswana · save as `botswana.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a lilac-breasted roller perched on a short branch, with a lilac breast, turquoise and royal-blue wings and long tail streamers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### zimbabwe

Zimbabwe · save as `zimbabwe.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a carved Great Zimbabwe soapstone bird: a stylised eagle-like bird perched on top of a tall carved pillar, in polished grey-green stone.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### seychelles

Seychelles · save as `seychelles.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a coco de mer double coconut, a large glossy dark-brown two-lobed nut, with a frond of green palm leaf behind it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cameroon

Cameroon · save as `cameroon.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Bamileke beaded elephant mask with large round ears and a long hanging trunk panel, covered in colourful beadwork in blue, red, white and black.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cape-verde

Cape Verde · save as `cape-verde.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a small four-string Cape Verdean cavaquinho guitar in honey-coloured wood with a dark fretboard and a round sound hole.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### malta

Malta · save as `malta.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Maltese luzzu fishing boat in side view, painted in bright yellow, blue, red and green, with the Eye of Osiris painted on the bow; no lettering.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cyprus

Cyprus · save as `cyprus.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: slices of grilled halloumi cheese with golden char marks on a small blue ceramic plate, with fresh mint leaves and a lemon wedge.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### slovenia

Slovenia · save as `slovenia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the small island of Lake Bled with its church and tall white bell tower among green trees, isolated with only a narrow band of water around it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### montenegro

Montenegro · save as `montenegro.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: Sveti Stefan: a small fortified islet village of stone houses with terracotta roofs, joined to land by a narrow sandbar, isolated with only a little sea around it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### romania

Romania · save as `romania.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: Bran Castle on its rocky outcrop: cream stone walls, red-tiled turrets and towers, shown as an isolated castle.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### estonia

Estonia · save as `estonia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a loose bunch of bright blue cornflowers with slender grey-green stems, tied with a thin white ribbon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### georgia

Georgia · save as `georgia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an Adjarian khachapuri: a boat-shaped golden bread filled with melted cheese, with a raw egg yolk and a pat of butter in the centre, on a wooden board.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### albania

Albania · save as `albania.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Albanian çifteli, a long-necked two-string lute carved in warm wood with a teardrop body and inlaid decoration.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### laos

Laos · save as `laos.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Lao woven bamboo sticky-rice basket (tip khao) with a fitted lid and a carrying string, with a little white sticky rice beside it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mongolia

Mongolia · save as `mongolia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Mongolian morin khuur horse-head fiddle with a carved horse head at the top of the neck, a trapezoid wooden body and two strings, with its bow.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uzbekistan

Uzbekistan · save as `uzbekistan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an Uzbek ceramic teapot in the traditional blue-and-white cotton-boll (pakhta) pattern, beside a matching small handleless bowl.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bhutan

Bhutan · save as `bhutan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: Paro Taktsang (Tiger's Nest) monastery: white buildings with golden roofs clinging to a sheer grey cliff, shown as an isolated cliff fragment.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### oman

Oman · save as `oman.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Omani clay frankincense burner (mabkhara), painted in red, white and gold, with pale resin pieces glowing and a thin curl of smoke.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### lebanon

Lebanon · save as `lebanon.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Lebanese cedar tree with a broad trunk and wide, flat, layered tiers of deep green branches.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### fiji

Fiji · save as `fiji.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a carved wooden Fijian tanoa kava bowl on short legs, filled with milky kava, with a polished half-coconut-shell cup.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### pakistan

Pakistan · save as `pakistan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Pakistani decorated truck in three-quarter view, covered in vivid truck art with floral patterns, mirrors, chains and a carved wooden crown above the cab; no lettering.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bulgaria

Bulgaria · save as `bulgaria.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: three richly pink Bulgarian Damask roses with green leaves and one small amber glass vial of rose oil. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ukraine

Ukraine · save as `ukraine.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: three Ukrainian pysanky Easter eggs with distinct traditional geometric wax-resist patterns in deep red, black, cream and warm gold. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### serbia

Serbia · save as `serbia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a pair of traditional Serbian opanak handmade leather shoes with curled pointed toes and intricately woven leather uppers. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### slovakia

Slovakia · save as `slovakia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a Tatra chamois standing alert with curved dark horns and natural brown fur. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### lithuania

Lithuania · save as `lithuania.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: one large oval Baltic amber pendant in a simple bronze bezel, two matching amber earrings and four polished amber stones arranged as one broad compact group, all in translucent warm honey tones. There is no cord or chain. Show every part of the objects with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### latvia

Latvia · save as `latvia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a pair of hand-knitted Latvian wool mittens with deep red, cream and charcoal geometric folk patterns. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### luxembourg

Luxembourg · save as `luxembourg.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the complete stone towers and slate roofs of Vianden Castle as an isolated architectural miniature. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bosnia-and-herzegovina

Bosnia and Herzegovina · save as `bosnia-and-herzegovina.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the elegant single stone arch of Stari Most bridge in Mostar, with its complete span and end towers. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### north-macedonia

North Macedonia · save as `north-macedonia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the small Church of St John at Kaneo in Ohrid with warm stone walls and red tiled roofs. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### azerbaijan

Azerbaijan · save as `azerbaijan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a pear-shaped Azerbaijani armudu glass of ruby tea on an ornate saucer with sugar cubes and a tiny dish of cherry jam. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### kyrgyzstan

Kyrgyzstan · save as `kyrgyzstan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Kyrgyz three-string wooden komuz leaning beside a folded red-and-cream shyrdak felt textile. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bangladesh

Bangladesh · save as `bangladesh.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete brightly decorated Dhaka cycle rickshaw with painted floral panels and tassels, without a rider. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### myanmar

Myanmar · save as `myanmar.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a single golden Bagan temple pagoda with a pointed gilded spire and warm aged-brick base. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### brunei

Brunei · save as `brunei.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the complete white stone Sultan Omar Ali Saifuddien Mosque with golden dome and elegant minarets. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### paraguay

Paraguay · save as `paraguay.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: one circular handmade Paraguayan ñandutí needle-lace textile in coral, gold, teal and cream threads. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### venezuela

Venezuela · save as `venezuela.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional compact four-string Venezuelan cuatro guitar made from warm reddish-brown polished wood, placed diagonally from lower left to upper right so it fills the cover generously. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### zambia

Zambia · save as `zambia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: an African fish eagle perched on a short branch, with a white head, chest and tail, dark brown wings and a yellow beak. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mozambique

Mozambique · save as `mozambique.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Mozambican dhow sailing boat with a graceful cream lateen sail and carved wooden hull. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### papua-new-guinea

Papua New Guinea · save as `papua-new-guinea.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a bird of paradise perched on a short branch with flowing golden-orange plumes, emerald throat and dark body. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### vanuatu

Vanuatu · save as `vanuatu.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: three traditional Vanuatu carved wooden tamtam slit drums in a close, gently staggered group, each with a different expressive carved face and complete from top to base. Show every part of the objects with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```
### algeria

Algeria · save as `algeria.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete fennec fox seated upright with oversized ears, delicate sandy fur and a softly curling tail. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### angola

Angola · save as `angola.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete giant sable antelope standing in three-quarter view, dark chestnut coat, white facial markings and long crescent horns. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### gambia

The Gambia · save as `gambia.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete Gambian kora harp shown at a gentle diagonal, with a round calabash resonator, leather covering, tall wooden neck and fine strings. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### malawi

Malawi · save as `malawi.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: two complete Lake Malawi cichlid fish in a close swimming pair, one turquoise blue and one golden yellow, with natural fins and fine scale detail. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### gabon

Gabon · save as `gabon.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete mandrill seated in three-quarter view with a colourful blue-and-red face, tawny mane and dark olive fur. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### andorra

Andorra · save as `andorra.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the complete Romanesque stone church of Sant Joan de Caselles in Andorra, with its rectangular bell tower, warm beige stone and small pitched roof, as an isolated architectural miniature. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### monaco

Monaco · save as `monaco.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete vintage red open-wheel Monaco Grand Prix racing car in a three-quarter view, all four tyres visible, with no branding or number. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### san-marino

San Marino · save as `san-marino.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the complete Guaita fortress tower of San Marino in pale grey stone with crenellations and a small rocky base, isolated as an architectural miniature. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### liechtenstein

Liechtenstein · save as `liechtenstein.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the complete Vaduz Castle in Liechtenstein, its warm pale stone tower and red roofs on a compact rocky base, isolated as an architectural miniature. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### moldova

Moldova · save as `moldova.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a rustic Moldovan terracotta wine jug with a curved handle beside a small bunch of purple grapes and two vine leaves, all parts complete. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### tajikistan

Tajikistan · save as `tajikistan.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a traditional Tajik chakan embroidered round cap shown at an angle, with vivid red, green, yellow and blue floral embroidery on dark fabric. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### iran

Iran · save as `iran.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete Persian blue-and-white glazed ceramic bowl in three-quarter view, showing fine floral arabesque motifs and a gently scalloped rim. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### timor-leste

Timor-Leste · save as `timor-leste.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a folded traditional Timorese tais handwoven textile, with rich red, black, cream and golden geometric bands and visible woven threads, draped in a compact complete shape. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### palestine

Palestine · save as `palestine.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a folded Palestinian tatreez embroidered textile panel with intricate red cross-stitch geometric floral motifs on natural ivory linen, displayed as a complete compact fabric object. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### belize

Belize · save as `belize.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete small ancient Maya jade mosaic mask in varied green stone tesserae with a calm human face and finely carved details. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### nicaragua

Nicaragua · save as `nicaragua.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: the complete conical Momotombo volcano of Nicaragua as a standalone painted landscape miniature, warm volcanic slopes with sparse green vegetation and a tiny plume, no horizon. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### barbados

Barbados · save as `barbados.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: two complete Barbadian flying fish crossing in a dynamic close pair, silver-blue bodies and wide winglike pectoral fins, no water or splashes. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### trinidad-and-tobago

Trinidad and Tobago · save as `trinidad-and-tobago.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete Trinidadian steelpan drum in three-quarter view, shiny silver concave playing surface on a short stand with two soft-tipped mallets resting diagonally across it. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### samoa

Samoa · save as `samoa.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a complete traditional Samoan open-sided fale house with a broad rounded thatched roof on wooden posts, woven mats and a compact base, isolated as an architectural miniature. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### palau

Palau · save as `palau.png`

```text
Create a portrait 2:3 image (1024x1536): an isolated painted subject for a travel photo album cover, on actual transparent alpha.

Background: actual transparent alpha. No color, gradient, texture, scenery, floor, horizon, shadow or glow. The final solid cover color is added separately by the composer.

Subject: a close pair of complete golden jellyfish from Palau's Jellyfish Lake, with translucent amber bells and delicate flowing tentacles, no water. Show every part of the object with a complete silhouette.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: centre the complete subject on the canvas, large and confident, with generous transparent margin on every side. No part may touch the image edge. The album composer positions it in the title-safe area.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```
