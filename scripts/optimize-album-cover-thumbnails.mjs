import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = path.join(process.cwd(), "public/images/landing/print-covers");
const destinationDirectory = path.join(process.cwd(), "public/images/landing/covers/thumbs");
await mkdir(destinationDirectory, { recursive: true });

const covers = (await readdir(sourceDirectory)).filter(name => /\.webp$/i.test(name));
for (const name of covers) {
    const id = path.parse(name).name;
    await sharp(path.join(sourceDirectory, name))
        .resize(144, 180, { fit: "cover" })
        .webp({ quality: 78, effort: 6 })
        .toFile(path.join(destinationDirectory, `${id}.webp`));
}
console.log(`Prepared ${covers.length} album cover thumbnails.`);
