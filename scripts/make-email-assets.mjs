// Renders the email images that email apps can't draw themselves: the logo mark as PNG and the
// handwritten notes in the landing page's hand font. Run: node scripts/make-email-assets.mjs
// Needs Chrome installed (CHROME_PATH to override). Writes to public/images/email/.
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const out = path.resolve("public/images/email");
const font = fs.readFileSync("public/fonts/landing/handwritten.woff2").toString("base64");
const mark = fs.readFileSync("public/brand/itinero-mark.svg", "utf8");
const markWhite = fs.readFileSync("public/brand/itinero-mark-white.svg", "utf8");
const NOTES = {
    "welcome-back": "welcome back!",
    "thank-you": "thank you!",
    "one-small-thing": "one small thing…",
    "printing": "warming up the press",
    "on-its-way": "it’s on its way!",
    "delivered": "it’s home!",
    "cancelled": "so sorry",
};

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 300, deviceScaleFactor: 2 });
const shoot = async (html, file) => {
    await page.setContent(`<style>@font-face{font-family:Hand;src:url(data:font/woff2;base64,${font})}body{margin:0;background:transparent}#x{display:inline-block;padding:6px 10px}</style><div id="x">${html}</div>`);
    await page.evaluate(() => document.fonts.ready);
    await (await page.$("#x")).screenshot({ path: path.join(out, file), omitBackground: true });
};
await shoot(`<div style="width:88px;height:44px">${mark.replace("<svg", '<svg width="88" height="44"')}</div>`, "mark.png");
await shoot(`<div style="width:120px;height:60px">${markWhite.replace("<svg", '<svg width="120" height="60"')}</div>`, "mark-white.png");
for (const [key, text] of Object.entries(NOTES)) {
    await shoot(`<div style="font:30px/1.1 Hand;color:#ed7936;transform:rotate(-2deg);white-space:nowrap;padding:4px 2px">${text}</div>`, `note-${key}.png`);
}
await browser.close();
console.log("Wrote", fs.readdirSync(out).join(", "));
