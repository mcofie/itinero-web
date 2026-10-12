# Flat object cover prompts

Copy-paste prompts for generating the [flat object covers](./flat-object-covers.md) in ChatGPT. Each prompt stands on its own and includes the full style brief.

## How to generate

1. Open a new ChatGPT chat. For the first cover, attach the reference shelf photo and add: "Match the painting style of these book covers, but leave out all text."
2. Paste one country's prompt. Generate one cover per message, all in the same chat, so the style stays consistent.
3. If a result includes any text, say "Same image, remove all text." If the subject sits too high, say "Same image, move the subject lower and leave the top 30% empty."
4. Download each approved image and save it under the file name shown, in `public/images/landing/covers/new/`.
5. When a batch is in, ask Claude Code to convert the images to `.webp`, update the colours in `src/lib/travel-covers.ts`, add the new destinations and rebuild the thumbnails and optimized landing images.

Start with a batch of six, for example Portugal, Japan, United Kingdom, Morocco, Kenya and Sweden, and check them side by side before doing the rest.

[France](#france) · [Spain](#spain) · [United States](#usa) · [Türkiye](#turkey) · [Italy](#italy) · [Mexico](#mexico) · [United Kingdom](#uk) · [Germany](#germany) · [Japan](#japan) · [China](#china) · [Greece](#greece) · [Thailand](#thailand) · [Austria](#austria) · [United Arab Emirates](#uae) · [Saudi Arabia](#saudi-arabia) · [Portugal](#portugal) · [Malaysia](#malaysia) · [Netherlands](#netherlands) · [India](#india) · [Canada](#canada) · [Poland](#poland) · [Denmark](#denmark) · [Vietnam](#vietnam) · [Morocco](#morocco) · [Croatia](#croatia) · [South Korea](#south-korea) · [Russia](#russia) · [Egypt](#egypt) · [Czechia](#czechia) · [Indonesia](#indonesia) · [Ghana](#ghana) · [South Africa](#south-africa) · [Kenya](#kenya) · [Nigeria](#nigeria) · [Tanzania](#tanzania) · [Switzerland](#switzerland) · [Australia](#australia) · [Brazil](#brazil) · [Ireland](#ireland) · [Norway](#norway) · [Singapore](#singapore) · [Philippines](#philippines) · [Cambodia](#cambodia) · [New Zealand](#new-zealand) · [Argentina](#argentina) · [Chile](#chile) · [Peru](#peru) · [Colombia](#colombia) · [Rwanda](#rwanda) · [Senegal](#senegal) · [Côte d’Ivoire](#cote-divoire) · [Togo](#togo) · [Benin](#benin) · [Uganda](#uganda) · [Namibia](#namibia) · [Mauritius](#mauritius) · [Tunisia](#tunisia) · [Sweden](#sweden) · [Finland](#finland) · [Iceland](#iceland) · [Belgium](#belgium) · [Hungary](#hungary) · [Jordan](#jordan) · [Qatar](#qatar) · [Sri Lanka](#sri-lanka) · [Nepal](#nepal) · [Taiwan](#taiwan) · [Costa Rica](#costa-rica) · [Dominican Republic](#dominican-republic) · [Ecuador](#ecuador) · [Armenia](#armenia) · [Kazakhstan](#kazakhstan) · [Belarus](#belarus) · [Maldives](#maldives) · [Cuba](#cuba) · [Jamaica](#jamaica) · [Bahamas](#bahamas) · [Guatemala](#guatemala) · [Bolivia](#bolivia) · [Uruguay](#uruguay) · [Panama](#panama) · [Ethiopia](#ethiopia) · [Madagascar](#madagascar) · [Botswana](#botswana) · [Zimbabwe](#zimbabwe) · [Seychelles](#seychelles) · [Cameroon](#cameroon) · [Cape Verde](#cape-verde) · [Malta](#malta) · [Cyprus](#cyprus) · [Slovenia](#slovenia) · [Montenegro](#montenegro) · [Romania](#romania) · [Estonia](#estonia) · [Georgia](#georgia) · [Albania](#albania) · [Laos](#laos) · [Mongolia](#mongolia) · [Uzbekistan](#uzbekistan) · [Bhutan](#bhutan) · [Oman](#oman) · [Lebanon](#lebanon) · [Fiji](#fiji) · [Pakistan](#pakistan)

## Prompts

### france

France · save as `france.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid cornflower blue colour (#8FB3E8) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Eiffel Tower at full height, elegant wrought-iron lattice in warm bronze-brown with fine ironwork detail.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### spain

Spain · save as `spain.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid saffron yellow colour (#F2C84B) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a fully opened Spanish flamenco hand fan with red fabric, a lace edge, a cream floral pattern and dark lacquered wooden ribs.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### usa

United States · save as `usa.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid dusty pink colour (#E9A9A6) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Statue of Liberty's head with its spiked crown and her raised arm holding the torch with a golden flame, in verdigris-green copper.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### turkey

Türkiye · save as `turkey.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm cream colour (#F5EBD3) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a tulip-shaped clear Turkish tea glass of deep ruby-red tea on a small red-and-gold saucer, with a sugar cube and a slim teaspoon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### italy

Italy · save as `italy.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid mustard yellow colour (#E8B020) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: three whole lemons and two cut lemon halves showing juicy segments, on a short branch with glossy dark green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mexico

Mexico · save as `mexico.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid hot pink colour (#E85A9A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a prickly-pear (nopal) cactus with flat paddle segments, magenta and yellow blossoms and ripe red fruits.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uk

United Kingdom · save as `uk.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid soft sky blue colour (#A9C8E8) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a classic red cast-iron London K6 telephone kiosk at a slight three-quarter angle, with a domed crown roof, many small window panes and glossy pillar-box-red paint; the header panels are plain with no words.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### germany

Germany · save as `germany.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sage green colour (#8DAA7A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a large golden-brown soft Bavarian pretzel with a glossy crust, a thick plump belly and coarse white salt crystals.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### japan

Japan · save as `japan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep indigo colour (#2E4A8C) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: two ornamental koi fish swimming in a graceful curving circle, seen from above, one white with vivid orange-red patches (kohaku) and one gold-orange, with flowing translucent fins and finely painted scales.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### china

China · save as `china.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid jade green colour (#5FA88A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a round red silk Chinese lantern with gold caps at the top and bottom and a long red silk tassel hanging below.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### greece

Greece · save as `greece.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid Aegean blue colour (#2E6FB5) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an ancient Greek amphora in terracotta-orange clay with black-figure painting: a meander (Greek key) band and simple classical figures.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### thailand

Thailand · save as `thailand.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid soft pink colour (#F4B6C8) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: mango sticky rice on a white ceramic plate lined with banana leaf: sliced ripe golden mango, a mound of white sticky rice drizzled with coconut cream, and a pink-and-white frangipani flower.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### austria

Austria · save as `austria.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid powder blue colour (#9DCDEA) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a slice of Sachertorte with a glossy dark chocolate glaze and a thin apricot jam layer, on a small white plate with a dollop of whipped cream.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uae

United Arab Emirates · save as `uae.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm sand colour (#E8C27A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional Arabic brass dallah coffee pot with a long crescent-shaped spout, a tall pointed lid and engraved details, with two small handleless cups.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### saudi-arabia

Saudi Arabia · save as `saudi-arabia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid saffron colour (#E7A63A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a shallow engraved brass bowl heaped with glossy Medjool dates, deep amber and brown with wrinkled skins.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### portugal

Portugal · save as `portugal.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid azulejo blue colour (#3E6DB5) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: three Portuguese pastéis de nata custard tarts on a small white-and-blue azulejo-patterned saucer, with flaky golden layered pastry, blistered caramelised dark-brown spots on the custard and a light dusting of cinnamon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### malaysia

Malaysia · save as `malaysia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep emerald colour (#1E6B47) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a large red hibiscus flower (bunga raya) with five ruffled petals, a long yellow-tipped stamen and two green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### netherlands

Netherlands · save as `netherlands.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid Dutch orange colour (#F08A2E) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a loose bunch of tulips in red, pink, yellow and white with long green stems and leaves, tied with a twine bow.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### india

India · save as `india.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid saffron orange colour (#F2994A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Taj Mahal seen from the front, white marble with its central onion dome, four minarets and arched entrance, softly shaded in warm ivory.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### canada

Canada · save as `canada.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid brick red colour (#C8443A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a bull moose standing in three-quarter view with large palmate antlers and a dark brown coat.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### poland

Poland · save as `poland.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid pale aqua colour (#A9D6DA) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: golden pan-fried pierogi dumplings with crimped edges, topped with caramelised onion and a sprig of dill, on a white plate with a blue folk-floral rim.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### denmark

Denmark · save as `denmark.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid butter yellow colour (#F6E39A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Little Mermaid statue of Copenhagen: a slender mermaid seated on a granite boulder, in green-bronze patina.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### vietnam

Vietnam · save as `vietnam.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep red colour (#B8231F) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Vietnamese conical palm-leaf hat (nón lá) shown at an angle, with woven straw texture, fine radial ribs and a red silk chin ribbon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### morocco

Morocco · save as `morocco.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm Moroccan orange colour (#E8682A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a hand-painted Moroccan ceramic tagine with a tall conical lid and a small knob, decorated in cobalt blue, turquoise and cream geometric zellige-style patterns with a glossy glaze.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### croatia

Croatia · save as `croatia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid Adriatic turquoise colour (#3BB8C6) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Dalmatian dog sitting upright, white coat with crisp black spots, alert ears and a friendly face.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### south-korea

South Korea · save as `south-korea.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid soft mint colour (#BFE3CF) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: bibimbap in a black stone bowl: rice topped with neatly arranged spinach, carrot, bean sprouts, mushrooms and beef, a sunny-side-up egg in the centre and a dab of red gochujang.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### russia

Russia · save as `russia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sky blue colour (#7DB6DC) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional matryoshka nesting doll, glossy red with a yellow headscarf, a painted rosy face and floral apron, with one smaller doll beside it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### egypt

Egypt · save as `egypt.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep green colour (#2F7A4F) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a black Egyptian Bastet cat sitting tall in profile, with a gold earring and a turquoise beaded collar, in front of a large golden full moon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### czechia

Czechia · save as `czechia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid salmon colour (#F79A73) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Prague astronomical clock: a round gold-and-blue astronomical dial with a zodiac ring and ornate gilded hands, in a carved stone Gothic frame.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### indonesia

Indonesia · save as `indonesia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid soft peach colour (#F8A970) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Komodo dragon walking in three-quarter view, with textured grey-olive scaly skin, powerful claws and a forked tongue.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ghana

Ghana · save as `ghana.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm red-orange colour (#D9532F) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a neatly folded stack of handwoven Ghanaian kente cloth with bold strip-woven geometric patterns in gold, green, red and black.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### south-africa

South Africa · save as `south-africa.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid teal green colour (#3FA98A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a king protea flower in full bloom with pink pointed bracts around a pale silvery centre, with leathery green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### kenya

Kenya · save as `kenya.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid savanna mustard colour (#F3AC30) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an African elephant walking in three-quarter view, with large fanned ears, long ivory tusks and wrinkled grey skin rendered in warm and cool greys, calm and majestic.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### nigeria

Nigeria · save as `nigeria.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep green colour (#1F6B43) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Yoruba dùndún talking drum: an hourglass-shaped carved wooden drum laced with leather tension cords, with a curved drumstick.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### tanzania

Tanzania · save as `tanzania.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid dusty rose colour (#E07A74) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a plains zebra standing in three-quarter view, with bold black-and-white stripes and an upright mane.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### switzerland

Switzerland · save as `switzerland.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid pine green colour (#15473B) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a large brass Swiss cowbell hanging from a wide embroidered leather strap decorated with edelweiss and alpine flowers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### australia

Australia · save as `australia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid coral colour (#F86761) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a red kangaroo standing upright on its hind legs in profile, with a joey peeking out of its pouch.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### brazil

Brazil · save as `brazil.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid bright orange colour (#FC7612) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a toco toucan perched on a short branch, with a black body, white throat and a huge glossy orange beak with a black tip.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ireland

Ireland · save as `ireland.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid emerald green colour (#2F6B3F) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional Celtic harp in carved polished wood with Celtic knotwork on the pillar and fine strings.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### norway

Norway · save as `norway.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep navy colour (#143351) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Viking longship in side view with a carved dragon-head prow, a row of round painted shields and a red-and-white striped square sail.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### singapore

Singapore · save as `singapore.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm red colour (#E95245) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Merlion statue: a white lion-headed fish with a scaled body curling up, spouting a stream of water from its mouth.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### philippines

Philippines · save as `philippines.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid tropical teal colour (#10A6AD) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Filipino jeepney in three-quarter view, with chrome bodywork, colourful painted stripes, horse ornaments on the bonnet and decorative lights; no lettering or signs.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cambodia

Cambodia · save as `cambodia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid marigold colour (#F8AC24) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the five lotus-bud towers of Angkor Wat in warm sandstone, seen from the front, with fine carved detail.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### new-zealand

New Zealand · save as `new-zealand.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep teal colour (#065655) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a kiwi bird in profile, with a round brown shaggy-feathered body and a long slender beak.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### argentina

Argentina · save as `argentina.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid lavender colour (#B48AD0) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional mate gourd wrapped in tooled leather with a silver rim, filled with green yerba mate, with a silver bombilla straw.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### chile

Chile · save as `chile.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm orange colour (#F6783D) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Rapa Nui moai head from Easter Island, carved volcanic stone in warm grey-brown, with a long nose and a heavy brow.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### peru

Peru · save as `peru.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid terracotta colour (#C2412A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a llama standing in three-quarter view, with fluffy cream wool, bright woven pompom tassels in its ears and a colourful woven Andean blanket on its back.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### colombia

Colombia · save as `colombia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid bright turquoise colour (#18B4C3) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a white ceramic cup of black coffee on a saucer beside a sprig of ripe red coffee cherries with glossy green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### rwanda

Rwanda · save as `rwanda.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid leaf green colour (#7DB55E) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a silverback mountain gorilla sitting calmly, with thick black fur, a silver back and a thoughtful face.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### senegal

Senegal · save as `senegal.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid coral colour (#F87372) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a baobab tree with a massive swollen trunk and short twisted branches carrying sparse green leaves.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cote-divoire

Côte d’Ivoire · save as `cote-divoire.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid caramel colour (#E5A653) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a ripe yellow-orange cocoa pod split open to show white pulp-covered cocoa beans, beside one whole pod and a few dried brown beans.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### togo

Togo · save as `togo.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sunflower yellow colour (#F4C430) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Tamberma (Takienta) fortified mud tower-house of Koutammakou, with round earthen towers and conical thatched roofs.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### benin

Benin · save as `benin.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid lagoon teal colour (#2FA7A3) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Ganvié stilt house of wood and thatch on tall poles, with a narrow wooden pirogue canoe moored beside it and only a small ripple of water beneath.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uganda

Uganda · save as `uganda.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid lime green colour (#8CC152) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a grey crowned crane standing in profile, with a slate-grey body, white wing panels, a red throat wattle and a spiky golden crown of feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### namibia

Namibia · save as `namibia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid dune orange colour (#EE8540) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a gemsbok (oryx) standing in profile, with long straight rapier horns and bold black-and-white face markings on a sandy grey coat.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mauritius

Mauritius · save as `mauritius.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid lagoon aqua colour (#3EC1C9) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a dodo standing in three-quarter view, with a plump grey-blue body, a large hooked yellow-green beak, small wings and a tuft of curly tail feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### tunisia

Tunisia · save as `tunisia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm sand colour (#EBD9B4) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an arched Sidi Bou Said wooden door painted bright blue, decorated with black metal studs in ornamental patterns, set in a small whitewashed wall section.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### sweden

Sweden · save as `sweden.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid clear sky blue colour (#4F9FD6) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional carved wooden Dalecarlian (Dala) horse in three-quarter side view, glossy red with white, green, yellow and blue kurbits folk decoration and a painted saddle and bridle.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### finland

Finland · save as `finland.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid ice blue colour (#9CCBE3) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a reindeer standing in three-quarter view, with branching velvety antlers and a thick cream-and-brown winter coat.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### iceland

Iceland · save as `iceland.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid glacier blue colour (#7FB7D9) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an Atlantic puffin standing in three-quarter view, with black-and-white plumage, bright orange feet and a colourful striped orange beak.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### belgium

Belgium · save as `belgium.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid raspberry colour (#E0607E) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Brussels waffle with deep square pockets, dusted with icing sugar and topped with fresh strawberries and whipped cream, on a small white plate.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### hungary

Hungary · save as `hungary.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid butter yellow colour (#F5DB7A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a hanging string of dried red paprika peppers tied with twine, glossy deep red with curling stems.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### jordan

Jordan · save as `jordan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid dusty rose colour (#E8908A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: Al-Khazneh (the Treasury) of Petra: the rose-pink sandstone facade with columns, a pediment and a central round tholos, shown as a single isolated facade.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### qatar

Qatar · save as `qatar.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep maroon colour (#8A1538) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a falcon perched on a thick leather falconry glove, wearing an embroidered leather hood, with tan-and-cream speckled feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### sri-lanka

Sri Lanka · save as `sri-lanka.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid turmeric colour (#E9A12B) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an Asian elephant in three-quarter view wearing a richly embroidered red-and-gold Kandy Esala Perahera festival cloak.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### nepal

Nepal · save as `nepal.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid Himalayan blue colour (#3F6FB5) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the Boudhanath stupa: a white dome topped by a gilded square tower painted with the Buddha's eyes and a golden spire, with strings of plain coloured prayer flags (no writing) radiating from the top.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### taiwan

Taiwan · save as `taiwan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid coral colour (#F07C6E) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a tall clear cup of brown-sugar bubble milk tea with dark tapioca pearls at the bottom, caramel streaks inside the cup and a wide straw; no logo.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### costa-rica

Costa Rica · save as `costa-rica.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid jungle green colour (#2E9E6B) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a red-eyed tree frog clinging to a green leaf, with a bright green body, blue-and-yellow striped flanks, orange feet and vivid red eyes.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### dominican-republic

Dominican Republic · save as `dominican-republic.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid Caribbean aqua colour (#3FB6C8) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Dominican Limé faceless ceramic doll in a long flowing pastel dress and a wide-brimmed hat, holding a basket of flowers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ecuador

Ecuador · save as `ecuador.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sunflower yellow colour (#F2B632) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Galápagos giant tortoise walking in three-quarter view, with a large domed dark shell and a wrinkled grey neck.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### armenia

Armenia · save as `armenia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid soft pink colour (#F2B5C9) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: three ripe pomegranates on a pale ceramic plate, one broken open to show glossy ruby seeds.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### kazakhstan

Kazakhstan · save as `kazakhstan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm orange colour (#E8653A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Kazakh yurt with a cream felt cover, ornamental decorative bands and a carved wooden door.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### belarus

Belarus · save as `belarus.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid periwinkle colour (#9DB8E6) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a European bison (zubr) standing in three-quarter view, with a shaggy dark brown coat, massive shoulders and short curved horns.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### maldives

Maldives · save as `maldives.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid bright ocean blue colour (#5EB3EE) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: two spotted eagle rays gliding diagonally, with dark navy backs covered in white spots and long whip-like tails.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cuba

Cuba · save as `cuba.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid flamingo pink colour (#F28AA0) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a classic 1950s American convertible car in glossy turquoise with white-wall tyres and chrome trim, in three-quarter view; no number plate or lettering.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### jamaica

Jamaica · save as `jamaica.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sunshine yellow colour (#FFC93C) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Jamaican doctor bird (red-billed streamertail hummingbird) hovering, with iridescent emerald plumage, a black crest, a red bill and two very long black streamer tail feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bahamas

Bahamas · save as `bahamas.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid bright cyan colour (#4CC9F0) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a queen conch shell with a flared glossy pink inner lip and creamy spiralled spikes.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### guatemala

Guatemala · save as `guatemala.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid marigold colour (#F2B134) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a resplendent quetzal perched on a short branch, with iridescent emerald-green plumage, a crimson belly and very long trailing tail feathers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bolivia

Bolivia · save as `bolivia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid fuchsia colour (#D9418C) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Bolivian cholita's small dark brown felt bowler hat resting on a folded aguayo weaving with bold multicoloured stripes and geometric patterns.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uruguay

Uruguay · save as `uruguay.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sky blue colour (#6CB4EE) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a candombe tamboril drum: a tall barrel-shaped wooden drum with painted bands, a stretched hide head and a leather shoulder strap.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### panama

Panama · save as `panama.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid teal colour (#1E9E9A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Panamanian golden frog sitting on a mossy stone, with a bright golden-yellow body and a few black spots.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### ethiopia

Ethiopia · save as `ethiopia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid terracotta colour (#C8553D) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a black clay Ethiopian jebena coffee pot with a round belly, long neck and woven straw stopper, beside small handleless cups and a few roasted coffee beans.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### madagascar

Madagascar · save as `madagascar.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid lime green colour (#9BC53D) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a ring-tailed lemur sitting upright, with soft grey fur, a white face mask, amber eyes and a long black-and-white ringed tail curling upward.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### botswana

Botswana · save as `botswana.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid apricot colour (#F4A259) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a lilac-breasted roller perched on a short branch, with a lilac breast, turquoise and royal-blue wings and long tail streamers.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### zimbabwe

Zimbabwe · save as `zimbabwe.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid mustard colour (#E9B44C) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a carved Great Zimbabwe soapstone bird: a stylised eagle-like bird perched on top of a tall carved pillar, in polished grey-green stone.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### seychelles

Seychelles · save as `seychelles.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid coral pink colour (#F59B8A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a coco de mer double coconut, a large glossy dark-brown two-lobed nut, with a frond of green palm leaf behind it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cameroon

Cameroon · save as `cameroon.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sea green colour (#7EC8A4) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Bamileke beaded elephant mask with large round ears and a long hanging trunk panel, covered in colourful beadwork in blue, red, white and black.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cape-verde

Cape Verde · save as `cape-verde.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sunny yellow colour (#F6D365) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a small four-string Cape Verdean cavaquinho guitar in honey-coloured wood with a dark fretboard and a round sound hole.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### malta

Malta · save as `malta.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid warm limestone colour (#F2D59B) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Maltese luzzu fishing boat in side view, painted in bright yellow, blue, red and green, with the Eye of Osiris painted on the bow; no lettering.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### cyprus

Cyprus · save as `cyprus.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid olive green colour (#A3B15A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: slices of grilled halloumi cheese with golden char marks on a small blue ceramic plate, with fresh mint leaves and a lemon wedge.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### slovenia

Slovenia · save as `slovenia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid soft mint colour (#9ED8C8) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: the small island of Lake Bled with its church and tall white bell tower among green trees, isolated with only a narrow band of water around it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### montenegro

Montenegro · save as `montenegro.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid lilac colour (#C9A0DC) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: Sveti Stefan: a small fortified islet village of stone houses with terracotta roofs, joined to land by a narrow sandbar, isolated with only a little sea around it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### romania

Romania · save as `romania.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid plum colour (#7A4E9E) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: Bran Castle on its rocky outcrop: cream stone walls, red-tiled turrets and towers, shown as an isolated castle.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### estonia

Estonia · save as `estonia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid linen colour (#F5E6C8) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a loose bunch of bright blue cornflowers with slender grey-green stems, tied with a thin white ribbon.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### georgia

Georgia · save as `georgia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid deep wine red colour (#8E2C48) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an Adjarian khachapuri: a boat-shaped golden bread filled with melted cheese, with a raw egg yolk and a pat of butter in the centre, on a wooden board.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### albania

Albania · save as `albania.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid Albanian red colour (#D7263D) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional Albanian çifteli, a long-necked two-string lute carved in warm wood with a teardrop body and inlaid decoration.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### laos

Laos · save as `laos.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid terracotta coral colour (#E2725B) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Lao woven bamboo sticky-rice basket (tip khao) with a fitted lid and a carrying string, with a little white sticky rice beside it.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### mongolia

Mongolia · save as `mongolia.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid steppe blue colour (#4A90C2) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Mongolian morin khuur horse-head fiddle with a carved horse head at the top of the neck, a trapezoid wooden body and two strings, with its bow.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### uzbekistan

Uzbekistan · save as `uzbekistan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid saffron colour (#F4B942) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: an Uzbek ceramic teapot in the traditional blue-and-white cotton-boll (pakhta) pattern, beside a matching small handleless bowl.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### bhutan

Bhutan · save as `bhutan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sage green colour (#A7C4A0) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: Paro Taktsang (Tiger's Nest) monastery: white buildings with golden roofs clinging to a sheer grey cliff, shown as an isolated cliff fragment.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### oman

Oman · save as `oman.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid teal colour (#2A9D8F) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a traditional Omani clay frankincense burner (mabkhara), painted in red, white and gold, with pale resin pieces glowing and a thin curl of smoke.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### lebanon

Lebanon · save as `lebanon.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid wheat colour (#E9C46A) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Lebanese cedar tree with a broad trunk and wide, flat, layered tiers of deep green branches.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### fiji

Fiji · save as `fiji.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid sea green colour (#06A77D) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a carved wooden Fijian tanoa kava bowl on short legs, filled with milky kava, with a polished half-coconut-shell cup.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

### pakistan

Pakistan · save as `pakistan.png`

```text
Create a portrait 2:3 image (1024x1536): flat printed artwork for a travel photo album cover, filling the image edge to edge.

Background: one completely flat, solid emerald colour (#1B7F5C) filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.

Subject: a Pakistani decorated truck in three-quarter view, covered in vivid truck art with floral patterns, mirrors, chains and a carved wooden crown above the cab; no lettering.

Style: a single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail, like a premium illustrated cookbook or museum print. Not photographic, not 3D, not vector clipart, not cartoonish.

Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% of the height). It is large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title is added later. No cast shadow or ground; the subject floats cleanly on the colour.

Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```
