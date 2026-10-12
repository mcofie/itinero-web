import localFont from "next/font/local";

/** Cover title typefaces. Add `albumFontVariables` to a wrapper around any cover. */
const albumSerif = localFont({ src: "../../../public/fonts/landing/gelica-regular.woff2", variable: "--font-album-serif", display: "swap", fallback: ["Georgia", "serif"] });
const albumHand = localFont({ src: "../../../public/fonts/landing/handwritten.woff2", variable: "--font-album-hand", display: "swap", fallback: ["cursive"] });
const albumRound = localFont({ src: "../../../public/fonts/landing/lilita-one.ttf", variable: "--font-album-round", display: "swap", fallback: ["Arial", "sans-serif"] });

export const albumFontVariables = `${albumSerif.variable} ${albumHand.variable} ${albumRound.variable}`;
