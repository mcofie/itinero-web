import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Uploads print-resolution cover art from print-assets/ to the private `print-assets` bucket,
// where the orders admin reads it when building print files. Needs NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY (for example: node --env-file=.env.local scripts/upload-print-assets.mjs).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "print-assets";

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) throw listError;
if (!buckets.some(bucket => bucket.id === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) throw error;
    console.log(`Created private bucket ${BUCKET}.`);
}

let uploaded = 0;
for (const folder of ["print-covers", "cover-objects"]) {
    const directory = path.join(process.cwd(), "print-assets", folder);
    const files = (await readdir(directory).catch(() => [])).filter(name => name.endsWith(".webp"));
    for (const name of files) {
        const { error } = await supabase.storage.from(BUCKET).upload(`${folder}/${name}`, await readFile(path.join(directory, name)), { contentType: "image/webp", upsert: true });
        if (error) throw new Error(`${folder}/${name}: ${error.message}`);
        uploaded++;
    }
    console.log(`${folder}: ${files.length} files`);
}
console.log(`Uploaded ${uploaded} files to ${BUCKET}.`);
