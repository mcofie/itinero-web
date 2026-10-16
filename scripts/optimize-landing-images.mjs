import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Run after changing source artwork; old generated variants are removed below.
const root = process.cwd();
const output = path.join(root, 'public/images/landing/optimized');
await mkdir(output, { recursive: true });
const covers = (await readdir('public/images/landing/covers')).filter(name => name.endsWith('.webp'));
const sources = [
    ...covers.map(name => `/images/landing/covers/${name}`),
    '/images/landing/hand-held-italy-album-v3.png',
    ...['japan', 'morocco', 'portugal'].map(country => `/images/landing/hand-held-${country}-album.png`),
    ...[1, 2, 3, 4].map(i => `/collage_image_${i}.png`),
    '/images/how-it-works.png',
];
const manifest = {};
const currentVariants = new Set();
let originalBytes = 0;
let fullSizeBytes = 0;
for (const source of sources) {
    const input = await readFile(path.join(root, 'public', source));
    const metadata = await sharp(input).metadata();
    const widths = [...new Set([360, 640, 1024, metadata.width].filter(width => width <= metadata.width))].sort((a, b) => a - b);
    const variants = [];
    for (const width of widths) {
        const buffer = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 88, effort: 6, smartSubsample: true }).toBuffer();
        const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 12);
        const name = `${path.parse(source).name}-${width}-${hash}.webp`;
        await writeFile(path.join(output, name), buffer);
        currentVariants.add(name);
        variants.push({ width, src: `/images/landing/optimized/${name}` });
        if (width === metadata.width) fullSizeBytes += buffer.length;
    }
    originalBytes += input.length;
    manifest[source] = { width: metadata.width, height: metadata.height, src: variants.at(-1).src, srcSet: variants.map(item => `${item.src} ${item.width}w`).join(', ') };
}
await writeFile('src/lib/landing-images.json', JSON.stringify(manifest, null, 2) + '\n');
for (const name of await readdir(output)) {
    if (name.endsWith('.webp') && !currentVariants.has(name)) await unlink(path.join(output, name));
}
console.log(JSON.stringify({ images: sources.length, originalBytes, fullSizeBytes, reductionPercent: +(100 * (1 - fullSizeBytes / originalBytes)).toFixed(1) }));
