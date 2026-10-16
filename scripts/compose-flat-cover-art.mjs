import sharp from "sharp";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw new Error("Usage: node scripts/compose-flat-cover-art.mjs <cutout-directory> [id ...]");
const outputDirectory = path.join(root, "public/images/landing/covers");
const printDirectory = path.join(root, "public/images/landing/print-covers");
const guide = await readFile(path.join(root, "docs/design/flat-object-covers.md"), "utf8");
const prompts = await readFile(path.join(root, "docs/design/flat-object-cover-prompts.md"), "utf8");
const ids = [...prompts.matchAll(/^### ([a-z0-9-]+)$/gm)].map(match => match[1]);
const rows = [...guide.matchAll(/^\| (\d+) \| [^|]+ \| [^|]+ \| [^|]+ \| [^|]*`(#[0-9a-fA-F]{6})`/gm)];
if (!ids.length || rows.length !== ids.length) throw new Error("The cover prompt and color lists are out of sync.");
const colors = Object.fromEntries(ids.map((id, index) => [id, rows[index][2]]));
const files = await readdir(sourceDirectory);
const selected = process.argv.slice(3).length ? process.argv.slice(3) : ids.filter(id => files.includes(`${id}.png`) || files.includes(`${id}.webp`));
await mkdir(outputDirectory, { recursive: true });
await mkdir(printDirectory, { recursive: true });

for (const id of selected) {
    if (!Object.hasOwn(colors, id)) throw new Error(`Unknown cover ID: ${id}`);
    const sourceName = files.includes(`${id}.png`) ? `${id}.png` : `${id}.webp`;
    if (!files.includes(sourceName)) throw new Error(`Missing cutout for ${id}`);
    const source = path.join(sourceDirectory, sourceName);
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width;
    let top = info.height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            if (data[(y * info.width + x) * info.channels + 3] <= 24) continue;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
        }
    }
    if (right < left) throw new Error(`${id} has no visible artwork.`);
    const bounds = { left, top, width: right - left + 1, height: bottom - top + 1 };
    for (const format of [
        { directory: outputDirectory, height: 1536, artWidth: 716, artHeight: 860, artTop: 520 },
        // Album previews and the 8×10 print PDF are 4:5. Leave room for the title and a visible bottom margin.
        { directory: printDirectory, height: 1280, artWidth: 820, artHeight: 840, artTop: 380 },
    ]) {
        const artwork = await sharp(source)
            .extract(bounds)
            .resize({ width: format.artWidth, height: format.artHeight, fit: "inside" })
            .png()
            .toBuffer();
        const dimensions = await sharp(artwork).metadata();
        await sharp({ create: { width: 1024, height: format.height, channels: 4, background: colors[id] } })
            .composite([{ input: artwork, left: Math.round((1024 - dimensions.width) / 2), top: Math.round(format.artTop + (format.artHeight - dimensions.height) / 2) }])
            .webp({ quality: 92, effort: 6, smartSubsample: true })
            .toFile(path.join(format.directory, `${id}.webp`));
    }
    console.log(`${id}: ${colors[id]}`);
}
