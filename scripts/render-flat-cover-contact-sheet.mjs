import sharp from "sharp";
import { readFile } from "node:fs/promises";

const promptGuide = await readFile("docs/design/flat-object-cover-prompts.md", "utf8");
const ids = [...promptGuide.matchAll(/^### ([a-z0-9-]+)$/gm)].map(match => match[1]);
const columns = 13;
const artworkWidth = 132;
const labelHeight = 20;
const gap = 6;

async function renderContactSheet({ sourceDirectory, artworkHeight, output }) {
    const rows = Math.ceil(ids.length / columns);
    const width = columns * (artworkWidth + gap) + gap;
    const height = rows * (artworkHeight + labelHeight + gap) + gap;
    const tiles = [];

    for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const left = gap + (index % columns) * (artworkWidth + gap);
        const top = gap + Math.floor(index / columns) * (artworkHeight + labelHeight + gap);
        const artwork = await sharp(`${sourceDirectory}/${id}.webp`)
            .resize(artworkWidth, artworkHeight)
            .png()
            .toBuffer();
        const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${artworkWidth}" height="${labelHeight}"><text x="${artworkWidth / 2}" y="14" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#493e34">${id}</text></svg>`);
        tiles.push({ input: artwork, left, top }, { input: label, left, top: top + artworkHeight });
    }

    await sharp({ create: { width, height, channels: 4, background: "#f6f2eb" } })
        .composite(tiles)
        .webp({ quality: 90, effort: 6 })
        .toFile(output);
    console.log(`Rendered ${ids.length} covers on a ${width}×${height} contact sheet: ${output}`);
}

await renderContactSheet({ sourceDirectory: "public/images/landing/covers", artworkHeight: 198, output: "docs/design/flat-object-covers-contact-sheet.webp" });
await renderContactSheet({ sourceDirectory: "public/images/landing/print-covers", artworkHeight: 165, output: "docs/design/flat-object-print-covers-contact-sheet.webp" });
