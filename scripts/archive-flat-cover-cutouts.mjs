import sharp from "sharp";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw new Error("Usage: node scripts/archive-flat-cover-cutouts.mjs <png-directory> [id ...]");

const promptGuide = await readFile("docs/design/flat-object-cover-prompts.md", "utf8");
const ids = [...promptGuide.matchAll(/^### ([a-z0-9-]+)$/gm)].map(match => match[1]);
const files = new Set(await readdir(sourceDirectory));
const selected = process.argv.slice(3).length
    ? process.argv.slice(3)
    : ids.filter(id => files.has(`${id}.png`));
if (!selected.length) throw new Error("No cover PNGs found to archive.");
const destinationDirectory = "assets/album-cover-cutouts";
await mkdir(destinationDirectory, { recursive: true });

for (const id of selected) {
    if (!ids.includes(id)) throw new Error(`Unknown cover ID: ${id}`);
    const name = `${id}.png`;
    if (!files.has(name)) throw new Error(`Missing source artwork: ${name}`);
    await sharp(path.join(sourceDirectory, name))
        .webp({ quality: 95, alphaQuality: 100, effort: 5 })
        .toFile(path.join(destinationDirectory, `${id}.webp`));
}

console.log(`Archived ${selected.length} transparent cover cutouts in ${destinationDirectory}.`);
