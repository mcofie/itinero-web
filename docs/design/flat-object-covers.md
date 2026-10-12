# Flat object covers

New direction for the country cover library, replacing the scenic poster artwork described in [country-cover-library.md](./country-cover-library.md).

Each cover is one solid, saturated background colour with a single painted object associated with the country: a food, animal, craft, vehicle or building. The look is soft gouache/watercolour realism, as on the Armenia (pomegranates), Kazakhstan (yurt), Egypt (Bastet cat and moon), Maldives (manta rays) and Thailand (mango sticky rice) reference books.

The artwork has no lettering. The app renders the country name and year in the customer's chosen typeface and colour, so the top 30% stays plain background. After a cover is approved, update its `color` in `src/lib/travel-covers.ts` to the new background.

## Shared prompt

Every prompt in [flat-object-cover-prompts.md](./flat-object-cover-prompts.md) is this template with `{object}` and `{background}` filled in from the table.

```text
Portrait 2:3, 1024x1536, flat printed travel photo album cover artwork, edge to edge.
Background: one completely flat, solid {background} colour filling the whole image. No gradient, texture, scenery, floor, horizon or vignette.
Subject: {object}. A single hand-painted illustration in soft gouache and watercolour realism, with gentle tonal shading, crisp clean edges, rich natural colour and fine authentic detail. The style is like a premium illustrated cookbook or museum print. It is not photographic, not 3D, not vector clipart and not cartoonish.
Composition: the subject is centred horizontally and sits in the lower 65% of the image (roughly 35% to 92% height), large and confident, about 70% of the image width. The top 30% must be plain background with nothing in it, because a title will be added later. There is no cast shadow or ground; the object floats cleanly on the colour.
Do not include any text, letters, numbers, logos, flags, watermarks, borders, frames, book mockups, spines or perspective distortion.
```

## Library

| # | Country | Main object | Alternate | Background | Title |
|---|---|---|---|---|---|
| 1 | France | Eiffel Tower | Butter croissant | Cornflower `#8FB3E8` | Navy |
| 2 | Spain | Open red flamenco fan | Paella pan | Saffron `#F2C84B` | Deep red |
| 3 | United States | Statue of Liberty torch and crown | Golden Gate tower | Dusty pink `#E9A9A6` | Forest green |
| 4 | Türkiye | Tulip glass of tea on a saucer | Cappadocia hot-air balloon | Cream `#F5EBD3` | Burgundy |
| 5 | Italy | Sliced lemons with leaves | Vespa scooter | Mustard `#E8B020` | Butter |
| 6 | Mexico | Prickly-pear cactus in bloom | Sugar skull | Hot pink `#E85A9A` | Marigold |
| 7 | United Kingdom | Red telephone box | Royal Guard bearskin hat | Sky blue `#A9C8E8` | Red |
| 8 | Germany | Pretzel | Cuckoo clock | Sage `#8DAA7A` | Cream |
| 9 | Japan | Pair of koi fish | Torii gate | Indigo `#2E4A8C` | Coral |
| 10 | China | Red paper lantern | Giant panda | Jade `#5FA88A` | Red |
| 11 | Greece | Black-figure amphora | Blue-domed chapel | Aegean blue `#2E6FB5` | White |
| 12 | Thailand | Mango sticky rice with a frangipani flower | Tuk-tuk | Pink `#F4B6C8` | Raspberry |
| 13 | Austria | Slice of Sachertorte | Lipizzaner horse | Powder blue `#9DCDEA` | Chocolate |
| 14 | UAE | Brass dallah (coffee pot) | Falcon | Sand `#E8C27A` | Deep teal |
| 15 | Saudi Arabia | Bowl of Medjool dates | Arabian horse | Saffron `#E7A63A` | Brown |
| 16 | Portugal | Pastéis de nata | Barcelos rooster | Azulejo blue `#3E6DB5` | Cream |
| 17 | Malaysia | Red hibiscus flower | Rhinoceros hornbill | Emerald `#1E6B47` | Pink |
| 18 | Netherlands | Bunch of tulips | Windmill | Orange `#F08A2E` | Deep green |
| 19 | India | Taj Mahal | Brass chai set | Saffron `#F2994A` | Magenta |
| 20 | Canada | Moose | Jar of maple syrup | Brick red `#C8443A` | Cream |
| 21 | Poland | Plate of pierogi | Wawel dragon | Pale aqua `#A9D6DA` | Red |
| 22 | Denmark | Little Mermaid statue | Viking helmet | Butter `#F6E39A` | Navy |
| 23 | Vietnam | Conical hat (nón lá) | Phin coffee filter | Red `#B8231F` | Pink |
| 24 | Morocco | Painted tagine pot | Babouche slippers | Orange `#E8682A` | Cream |
| 25 | Croatia | Dalmatian dog | Dubrovnik tower | Turquoise `#3BB8C6` | Navy |
| 26 | South Korea | Bibimbap in a stone bowl | Pagoda roof | Mint `#BFE3CF` | Red |
| 27 | Russia | Matryoshka doll | St Basil's domes | Sky blue `#7DB6DC` | Red |
| 28 | Egypt | Bastet cat in front of a moon | Pyramid | Green `#2F7A4F` | Cream |
| 29 | Czechia | Prague astronomical clock | Glass of pilsner | Salmon `#F79A73` | Navy |
| 30 | Indonesia | Komodo dragon | Balinese offering basket | Peach `#F8A970` | Deep green |
| 31 | Ghana | Folded kente cloth | Talking drum | Red-orange `#D9532F` | Gold |
| 32 | South Africa | King protea flower | African penguin | Teal `#3FA98A` | Cream |
| 33 | Kenya | Elephant | Maasai beaded collar | Mustard `#F3AC30` | Brown |
| 34 | Nigeria | Talking drum (dùndún) | Jollof rice with plantain | Green `#1F6B43` | Cream |
| 35 | Tanzania | Zebra | Kilimanjaro | Dusty rose `#E07A74` | Cream |
| 36 | Switzerland | Cowbell on a flowered strap | Matterhorn | Pine `#15473B` | Red |
| 37 | Australia | Kangaroo | Koala | Coral `#F86761` | Cream |
| 38 | Brazil | Toucan | Christ the Redeemer | Orange `#FC7612` | Green |
| 39 | Ireland | Celtic harp | Connemara sheep | Emerald `#2F6B3F` | Cream |
| 40 | Norway | Viking longship | Stave church | Navy `#143351` | Ice blue |
| 41 | Singapore | Merlion | Orchid | Red `#E95245` | Cream |
| 42 | Philippines | Jeepney | Mango | Teal `#10A6AD` | Yellow |
| 43 | Cambodia | Angkor Wat towers | Lotus | Marigold `#F8AC24` | Deep red |
| 44 | New Zealand | Kiwi bird | Pavlova | Deep teal `#065655` | Mint |
| 45 | Argentina | Mate gourd with metal straw | Tango shoes | Lavender `#B48AD0` | Navy |
| 46 | Chile | Moai head | Copihue flower | Orange `#F6783D` | Cream |
| 47 | Peru | Llama | Machu Picchu | Terracotta `#C2412A` | Pink |
| 48 | Colombia | Coffee cherries and cup | Sombrero vueltiao (woven hat) | Turquoise `#18B4C3` | Yellow |
| 49 | Rwanda | Mountain gorilla | Agaseke basket | Leaf green `#7DB55E` | Cream |
| 50 | Senegal | Baobab tree | Painted pirogue (boat) | Coral `#F87372` | Green |
| 51 | Côte d'Ivoire | Split cocoa pod | Baoulé mask | Caramel `#E5A653` | Chocolate |
| 52 | Togo | Tamberma mud tower-house | Pineapple | Sunflower `#F4C430` | Brown |
| 53 | Benin | Ganvié stilt house with canoe | Fon appliqué banner | Lagoon teal `#2FA7A3` | Cream |
| 54 | Uganda | Grey crowned crane | Matooke bananas | Lime green `#8CC152` | Deep green |
| 55 | Namibia | Gemsbok (oryx) | Deadvlei camel-thorn tree | Dune orange `#EE8540` | Cream |
| 56 | Mauritius | Dodo | Sugarcane | Lagoon aqua `#3EC1C9` | Cream |
| 57 | Tunisia | Blue Sidi Bou Said door | Wire birdcage | Sand `#EBD9B4` | Blue |
| 58 | Sweden | Dala horse | Cinnamon bun | Sky blue `#4F9FD6` | Yellow |
| 59 | Finland | Reindeer | Sauna bucket and ladle | Ice blue `#9CCBE3` | Navy |
| 60 | Iceland | Puffin | Icelandic horse | Glacier blue `#7FB7D9` | Navy |
| 61 | Belgium | Waffle with strawberries | Cone of frites | Raspberry `#E0607E` | Cream |
| 62 | Hungary | String of red paprika | Herend porcelain cup | Butter `#F5DB7A` | Red |
| 63 | Jordan | Petra Treasury | Dead Sea salt crystals | Rose `#E8908A` | Burgundy |
| 64 | Qatar | Falcon on a leather glove | Dhow boat | Maroon `#8A1538` | Cream |
| 65 | Sri Lanka | Elephant | Cup of Ceylon tea | Turmeric `#E9A12B` | Deep red |
| 66 | Nepal | Boudhanath stupa | Momo dumplings | Himalayan blue `#3F6FB5` | Cream |
| 67 | Taiwan | Bubble tea | Sky lantern | Coral `#F07C6E` | Cream |
| 68 | Costa Rica | Red-eyed tree frog | Painted oxcart wheel | Jungle green `#2E9E6B` | Cream |
| 69 | Dominican Republic | Faceless Limé doll | Güira and tambora drum | Caribbean aqua `#3FB6C8` | Cream |
| 70 | Ecuador | Galápagos tortoise | Toquilla straw hat (the "Panama hat") | Sunflower `#F2B632` | Deep green |
| 71 | Armenia | Pomegranates on a plate | Duduk flute | Pink `#F2B5C9` | Burgundy |
| 72 | Kazakhstan | Yurt | Golden eagle | Orange `#E8653A` | Lime |
| 73 | Belarus | Bison | Straw-woven doll | Periwinkle `#9DB8E6` | Navy |
| 74 | Maldives | Spotted eagle rays | Dhoni boat | Bright blue `#5EB3EE` | White |
| 75 | Cuba | 1950s convertible car | Maracas | Flamingo pink `#F28AA0` | Teal |
| 76 | Jamaica | Doctor bird hummingbird | Ackee fruit | Sunshine yellow `#FFC93C` | Deep green |
| 77 | Bahamas | Queen conch shell | Flamingo | Bright cyan `#4CC9F0` | Coral |
| 78 | Guatemala | Resplendent quetzal | Woven huipil textile | Marigold `#F2B134` | Deep green |
| 79 | Bolivia | Cholita bowler hat on an aguayo weaving | Andean flamingo | Fuchsia `#D9418C` | Cream |
| 80 | Uruguay | Candombe tamboril drum | Chivito sandwich | Sky blue `#6CB4EE` | Navy |
| 81 | Panama | Panamanian golden frog | Mola textile panel | Teal `#1E9E9A` | Yellow |
| 82 | Ethiopia | Jebena coffee pot with cups | Lalibela rock church | Terracotta `#C8553D` | Cream |
| 83 | Madagascar | Ring-tailed lemur | Panther chameleon | Lime `#9BC53D` | Deep green |
| 84 | Botswana | Lilac-breasted roller | Mokoro canoe | Apricot `#F4A259` | Navy |
| 85 | Zimbabwe | Great Zimbabwe soapstone bird | Victoria Falls | Mustard `#E9B44C` | Deep green |
| 86 | Seychelles | Coco de mer nut | Fairy tern | Coral pink `#F59B8A` | Deep teal |
| 87 | Cameroon | Bamileke beaded elephant mask | Pineapple | Sea green `#7EC8A4` | Deep red |
| 88 | Cape Verde | Cavaquinho guitar | Pot of cachupa | Sunny yellow `#F6D365` | Blue |
| 89 | Malta | Luzzu fishing boat | Maltese balcony | Limestone `#F2D59B` | Deep blue |
| 90 | Cyprus | Grilled halloumi with mint | Mouflon | Olive `#A3B15A` | Cream |
| 91 | Slovenia | Lake Bled island church | Slice of potica | Mint `#9ED8C8` | Navy |
| 92 | Montenegro | Sveti Stefan island village | Bowl of figs | Lilac `#C9A0DC` | Deep plum |
| 93 | Romania | Bran Castle | Painted Easter egg | Plum `#7A4E9E` | Gold |
| 94 | Estonia | Bunch of cornflowers | Kiek in de Kök tower | Linen `#F5E6C8` | Blue |
| 95 | Georgia | Adjarian khachapuri | Qvevri wine jar | Wine `#8E2C48` | Cream |
| 96 | Albania | Çifteli lute | Qeleshe felt cap | Red `#D7263D` | Cream |
| 97 | Laos | Bamboo sticky-rice basket | That Luang stupa | Terracotta coral `#E2725B` | Cream |
| 98 | Mongolia | Morin khuur (horse-head fiddle) | Bactrian camel | Steppe blue `#4A90C2` | Gold |
| 99 | Uzbekistan | Blue-and-white cotton-pattern teapot | Samarkand dome | Saffron `#F4B942` | Deep blue |
| 100 | Bhutan | Tiger's Nest monastery | Takin | Sage `#A7C4A0` | Deep red |
| 101 | Oman | Frankincense burner | Khanjar dagger | Teal `#2A9D8F` | Cream |
| 102 | Lebanon | Cedar tree | Manakish flatbread | Wheat `#E9C46A` | Deep green |
| 103 | Fiji | Carved tanoa kava bowl | Drua canoe | Sea green `#06A77D` | Yellow |
| 104 | Pakistan | Decorated truck | Cup of chai | Emerald `#1B7F5C` | Cream |

Rows 71 to 104 are new destinations and need entries in `travel-covers.ts`.

## Generating

Ready-to-paste ChatGPT prompts for every row, with the generation steps, are in [flat-object-cover-prompts.md](./flat-object-cover-prompts.md).
