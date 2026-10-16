import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

// Removes each print cover's flat background colour so the illustration can sit on a
// customer-chosen cover colour. Run after adding or changing print covers.
// Defaults to the web covers. `--print` uses the print-resolution covers in print-assets/ instead.
const print = process.argv.includes("--print");
const source = path.join(process.cwd(), print ? "print-assets/print-covers" : "public/images/landing/print-covers");
const output = path.join(process.cwd(), print ? "print-assets/cover-objects" : "public/images/landing/cover-objects");
await mkdir(output, { recursive: true });

// Colour distance below CLEAR is background; above SOLID is illustration; between is a soft edge.
const CLEAR = 9;
const SOLID = 30;
const only = process.argv.slice(2).filter(arg => !arg.startsWith("--"));

const files = (await readdir(source)).filter(name => name.endsWith(".webp") && (!only.length || only.includes(path.parse(name).name)));
for (const name of files) {
    const { data, info } = await sharp(path.join(source, name)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    // The background is the most common colour along the image border.
    const counts = new Map();
    const sample = (x, y) => { const i = (y * width + x) * 3; const key = `${data[i]},${data[i + 1]},${data[i + 2]}`; counts.set(key, (counts.get(key) ?? 0) + 1); };
    for (let x = 0; x < width; x += 4) { sample(x, 0); sample(x, height - 1); }
    for (let y = 0; y < height; y += 4) { sample(0, y); sample(width - 1, y); }
    const [br, bg, bb] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number);

    // Background is colour connected to the edge, or an enclosed area big enough to be a gap (e.g. inside a
    // ring of fish). Small background-coloured patches inside the illustration, like pale highlights, stay.
    const pixels = width * height;
    const scale = width / 1024;
    const minArea = Math.round(150 * scale * scale);
    const edgeReach = Math.max(2, Math.round(2 * scale));
    const distance = new Float32Array(pixels);
    for (let p = 0; p < pixels; p++) distance[p] = Math.hypot(data[p * 3] - br, data[p * 3 + 1] - bg, data[p * 3 + 2] - bb);
    const background = new Uint8Array(pixels);
    const seen = new Uint8Array(pixels);
    const queue = new Int32Array(pixels);
    const component = [];
    for (let start = 0; start < pixels; start++) {
        if (seen[start] || distance[start] > CLEAR) continue;
        let head = 0, tail = 0, touchesEdge = false;
        component.length = 0;
        queue[tail++] = start; seen[start] = 1;
        while (head < tail) {
            const q = queue[head++]; component.push(q);
            const x = q % width, y = (q - x) / width;
            if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesEdge = true;
            const neighbours = [x > 0 ? q - 1 : -1, x < width - 1 ? q + 1 : -1, y > 0 ? q - width : -1, y < height - 1 ? q + width : -1];
            for (const n of neighbours) if (n >= 0 && !seen[n] && distance[n] <= CLEAR) { seen[n] = 1; queue[tail++] = n; }
        }
        if (touchesEdge || component.length >= minArea) for (const q of component) background[q] = 1;
    }
    // Soft edges only within a few pixels of background.
    const nearBackground = new Uint8Array(pixels);
    let frontier = [];
    for (let p = 0; p < pixels; p++) if (background[p]) { nearBackground[p] = 1; frontier.push(p); }
    for (let step = 0; step < edgeReach; step++) {
        const next = [];
        for (const q of frontier) {
            const x = q % width, y = (q - x) / width;
            for (const n of [x > 0 ? q - 1 : -1, x < width - 1 ? q + 1 : -1, y > 0 ? q - width : -1, y < height - 1 ? q + width : -1]) {
                if (n >= 0 && !nearBackground[n]) { nearBackground[n] = 1; next.push(n); }
            }
        }
        frontier = next;
    }

    const out = Buffer.alloc(width * height * 4);
    for (let p = 0; p < pixels; p++) {
        const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
        const d = distance[p];
        const alpha = background[p] ? 0 : !nearBackground[p] || d >= SOLID ? 1 : Math.max(0, (d - CLEAR) / (SOLID - CLEAR));
        // Take the background's share out of edge pixels so they don't keep a halo of the old colour.
        const unmix = (value, back) => alpha === 0 ? 0 : Math.max(0, Math.min(255, Math.round((value - (1 - alpha) * back) / alpha)));
        out[p * 4] = unmix(r, br); out[p * 4 + 1] = unmix(g, bg); out[p * 4 + 2] = unmix(b, bb);
        out[p * 4 + 3] = Math.round(alpha * 255);
    }
    await sharp(out, { raw: { width, height, channels: 4 } }).webp({ quality: print ? 92 : 90, alphaQuality: 100, effort: print ? 4 : 6 }).toFile(path.join(output, name));
}
console.log(`Made ${files.length} cover cut-outs.`);
