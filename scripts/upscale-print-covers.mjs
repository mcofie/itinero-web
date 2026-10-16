import sharp from "sharp";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

// Upscales the 1024 × 1280 print covers to 2400 × 3000 (8 × 10 in at 300 dpi) with Real-ESRGAN.
// REALESRGAN_BIN points at realesrgan-ncnn-vulkan and REALESRGAN_MODELS at its models folder.
// Output goes to print-assets/ (not committed); upload it with scripts/upload-print-assets.mjs.
const run = promisify(execFile);
const bin = process.env.REALESRGAN_BIN;
const models = process.env.REALESRGAN_MODELS;
if (!bin || !models) throw new Error("Set REALESRGAN_BIN and REALESRGAN_MODELS.");

const source = path.join(process.cwd(), "public/images/landing/print-covers");
const output = path.join(process.cwd(), "print-assets/print-covers");
await mkdir(output, { recursive: true });
const work = await mkdtemp(path.join(os.tmpdir(), "covers-"));
const only = process.argv.slice(2);
const files = (await readdir(source)).filter(name => name.endsWith(".webp") && (!only.length || only.includes(path.parse(name).name)));

let done = 0;
for (const name of files) {
    const target = path.join(output, name);
    if (await stat(target).then(() => true, () => false)) { done++; continue; }
    const input = path.join(work, "in.png");
    const upscaled = path.join(work, "out.png");
    await sharp(path.join(source, name)).removeAlpha().png().toFile(input);
    await run(bin, ["-i", input, "-o", upscaled, "-n", "realesrgan-x4plus", "-m", models, "-s", "4"]);
    await sharp(upscaled).resize(2400, 3000, { kernel: "lanczos3" }).webp({ quality: 92, effort: 5 }).toFile(target);
    console.log(`${++done}/${files.length} ${name}`);
}
await rm(work, { recursive: true, force: true });
console.log(`Upscaled ${files.length} covers into print-assets/print-covers.`);
