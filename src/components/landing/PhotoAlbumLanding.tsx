"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Camera, Heart, ImagePlus, Layers, MapPin, Pencil, Plus, Smile, Sun } from "lucide-react";
import { Link } from "@/i18n/routing";
import styles from "./PhotoAlbumLanding.module.css";
import TravelAlbumCover from "./TravelAlbumCover";
import type { OverheadAlbum } from "@/lib/overhead-albums";
import { TRAVEL_COVERS_BY_ID, type FeaturedTravelCovers, type TravelCoverId } from "@/lib/travel-covers";

const photos = ["/collage_image_1.png", "/collage_image_2.png", "/collage_image_3.png", "/collage_image_4.png", "/images/how-it-works.png"];
const roman = ["I", "II", "III", "IV", "V"];

function Sticker({ kind = "flower", color = "#a9d96e", className = "" }: { kind?: "flower" | "heart" | "star"; color?: string; className?: string }) {
    const paths = {
        flower: "M48 24C29 0 10 22 24 39C-2 41 3 68 27 66C21 91 50 98 58 76C80 94 97 68 77 56C102 42 85 19 66 30C65 7 39 3 48 24Z",
        heart: "M49 85C36 74 5 51 9 29C13 6 40 10 50 26C61 5 88 10 92 30C96 52 63 78 49 85Z",
        star: "M50 6L62 35L94 36L69 56L78 89L50 72L21 89L30 57L6 36L38 34Z",
    };
    return <svg viewBox="0 0 100 100" className={`${styles.sticker} ${className}`} aria-hidden="true"><path d={paths[kind]} fill={color} stroke="#fffdf8" strokeWidth="10" strokeLinejoin="round" /><path d={paths[kind]} fill={color} stroke="#342719" strokeWidth="2.4" strokeLinejoin="round" /><ellipse cx="42" cy="46" rx="6" ry="8" fill="white" /><ellipse cx="59" cy="46" rx="6" ry="8" fill="white" /><circle cx="44" cy="47" r="2.7" fill="#241b10" /><circle cx="58" cy="47" r="2.7" fill="#241b10" /><path d="M43 62Q51 67 58 61" fill="none" stroke="#241b10" strokeWidth="2.5" strokeLinecap="round" /></svg>;
}

function CameraMark() {
    return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 21L21 20L25 12L40 13L44 21L54 22L55 49Q31 54 9 48Z" fill="#fffcf6" stroke="#fffcf6" strokeWidth="10" strokeLinejoin="round" /><path d="M10 21L21 20L25 12L40 13L44 21L54 22L55 49Q31 54 9 48Z" fill="#fffcf6" stroke="#302514" strokeWidth="3" strokeLinejoin="round" /><path d="M24 31C33 22 45 29 43 38C43 48 25 49 23 39C22 35 23 32 24 31Z" fill="none" stroke="#302514" strokeWidth="3" /><path d="M46 28L49 28M27 17L36 17" stroke="#302514" strokeWidth="3" strokeLinecap="round" /></svg>;
}


function Hero({ covers }: { covers: FeaturedTravelCovers }) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "-155%"]);

    return <section ref={ref} className={styles.heroJourney} aria-label="Meet Itinero" style={{ "--hero-cover-color": TRAVEL_COVERS_BY_ID[covers[0]].color } as CSSProperties}>
        <div className={styles.heroSticky}>
            <div className={styles.heroCopy}>
                <p className={styles.handwriting}>Dear travellers,</p>
                <h1><span>meet</span><span>itinero<span className={styles.titlePeriod}>.</span></span></h1>
                <p className={styles.heroSubtitle}>It’s a photo album that <span className={styles.handwriting}>actually!</span><br />brings your trips back.</p>
            </div>
            <div className={styles.heroAction}>
                <Link href="/photobooks/create" className={styles.outlineButton}>Make mine!</Link>
                <p>Your favourite photos. Beautifully bound.</p>
            </div>
            <div className={styles.mobileShowcase} aria-hidden="true">
                <div className={styles.showcaseLeft}><TravelAlbumCover design={covers[1]} eager /></div>
                <div className={styles.showcaseRight}><TravelAlbumCover design={covers[2]} eager /></div>
                <div className={styles.showcaseFront}><TravelAlbumCover design={covers[0]} eager /></div>
                <span className={styles.showcaseCaption}>a little piece of somewhere wonderful</span>
            </div>
            <motion.div className={styles.heroBook} style={{ rotate: -20, y: reduced ? 0 : y }} aria-hidden="true">
                <TravelAlbumCover design={covers[0]} eager />
            </motion.div>
        </div>
    </section>;
}

const features = [
    { scene: "sky", intro: "Your photos,", accent: "in real life.", color: "#4183d9", items: ["Pick photos from your trip", "Choose a cover you love", "Put your story in order", "Add your own words", "Preview every page"] },
];

function OverheadPhoto({ album }: { album: OverheadAlbum }) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

    return <div ref={ref} className={styles.overheadPhoto}>
        <motion.div className={styles.overheadParallax} style={{ y: reduced ? 0 : y, inset: reduced ? 0 : undefined }}>
            <Image src={album.src} alt={`Overhead view of a Black woman's hand holding the ${album.country} photo album above a white table with a potted plant`} fill sizes="100vw" className={styles.heldAlbumPhoto} unoptimized />
        </motion.div>
    </div>;
}

function FeatureScene({ feature, index, album }: { feature: typeof features[number]; index: number; album: OverheadAlbum }) {
    const [active, setActive] = useState(0);
    const id = `album-scene-${index}`;
    return <section id={index === 0 ? "how-it-works" : undefined} className={`${styles.featureScene} ${styles[feature.scene]}`} style={{ "--scene-accent": feature.color } as CSSProperties}>
        <div id={id} className={styles.sceneArt} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
            <OverheadPhoto album={album} />
        </div>
        <div className={styles.featureCard}>
            <h2>{feature.intro}<br /><span>{feature.accent}</span></h2>
            <div role="tablist" aria-label={feature.accent} aria-orientation="vertical">{feature.items.map((item, i) => <button key={item} id={`${id}-tab-${i}`} role="tab" aria-selected={active === i} aria-controls={id} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(event) => {
                let next = active;
                if (event.key === "ArrowDown") next = (active + 1) % feature.items.length;
                else if (event.key === "ArrowUp") next = (active + feature.items.length - 1) % feature.items.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = feature.items.length - 1;
                else return;
                event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus();
            }}><span>{item}</span><span>{roman[i]}</span></button>)}</div>
        </div>
    </section>;
}

const notes: { icon: ReactNode; label: ReactNode }[] = [
    { icon: <ImagePlus />, label: <>Your photos.<br />All the good ones.</> },
    { icon: <Pencil />, label: <>Your story.<br />In your words.</> },
    { icon: <BookOpen />, label: <>Real pages.<br />Real memories.</> },
    { icon: <Heart />, label: <>Made to keep.<br />And keep.</> },
];

function Reassurance() {
    return <section className={styles.reassurance}>
        <h2>Everything you’d want.<br />Nothing you’d forget.</h2>
        <div className={styles.stickyNotes}>{notes.map((note, i) => <motion.div key={i} className={styles.stickyNote} initial={{ y: 45, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: .15 }} transition={{ delay: i * .07 }}><div>{note.icon}</div><p>{note.label}</p></motion.div>)}</div>
    </section>;
}

function OtherThings() {
    const things = [{ icon: <Camera />, text: <>Straight from<br />your camera roll</> }, { icon: <Pencil />, text: <>Little captions,<br />big feelings</> }, { icon: <Layers />, text: <>Every page,<br />your way</> }, { icon: <Sun />, text: <>Keep a little<br />sunshine</> }, { icon: <MapPin />, text: <>Anywhere<br />you’ve been</> }, { icon: <Heart />, text: <>A very personal<br />present</> }, { icon: <Smile />, text: <>The blurry ones<br />count, too</> }, { icon: <BookOpen />, text: <>Your own library<br />of adventures</> }];
    return <section className={styles.otherThings}><div className={styles.otherHeading}><span className={styles.handwriting}>soooo much<br />⌄</span><h2>And there’s other<br />good stuff!</h2></div>{things.map((item, i) => <div key={i} className={styles.doodle} style={{ "--doodle-index": i } as CSSProperties}>{item.icon}<p>{item.text}</p></div>)}</section>;
}

function GalleryBook({ design, className }: { design: TravelCoverId; className: string }) {
    const name = TRAVEL_COVERS_BY_ID[design].country;
    return <Link href="/photobooks/create" className={`${styles.scatteredBook} ${className}`} aria-label={`Make your own photo album — ${name} cover`}>
        <TravelAlbumCover design={design} />
    </Link>;
}

function DrawnArrow({ className = "" }: { className?: string }) {
    return <svg className={`${styles.drawnArrow} ${className}`} viewBox="0 0 90 70" fill="none" aria-hidden="true"><path d="M8 6C7 44 34 58 77 47M65 38L80 47L69 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CoverGallery({ covers }: { covers: FeaturedTravelCovers }) {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    // Four scenes span 370vw; the last frame ends at the viewport edge.
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-72.972973%"]);
    return <section ref={ref} className={styles.coverJourney} id="your-way" aria-labelledby="cover-heading">
        <div className={styles.coverViewport}>
            <motion.div className={styles.coverTrack} style={{ x: reduced ? 0 : x }}>
                <div className={`${styles.coverPanel} ${styles.coverOpening}`}>
                    <GalleryBook design={covers[0]} className={styles.bookItaly} />
                    <div className={styles.coverHeading}><span className={styles.handwriting}>Made for keeping</span><h2 id="cover-heading">Your album.<br />Your way.</h2></div>
                    <GalleryBook design={covers[1]} className={styles.bookIstanbul} />
                    <div className={`${styles.coverNote} ${styles.lemonNote}`}>somewhere unforgettable<DrawnArrow /></div>
                    <div className={`${styles.coverNote} ${styles.teaNote}`}>your kind of colour<DrawnArrow /></div>
                    <Sticker kind="flower" color="#a9c875" className={styles.coverFlower} />
                    <Sticker kind="heart" color="#ec827d" className={styles.coverHeart} />
                </div>
                <div className={`${styles.coverPanel} ${styles.coverRome}`}>
                    <GalleryBook design={covers[2]} className={styles.bookRome} />
                    <div className={`${styles.coverNote} ${styles.romeNote}`}>for the places<br />you fell in love with<DrawnArrow /></div>
                    <div className={`${styles.loosePhoto} ${styles.romePhoto}`}><Image src={photos[0]} width={400} height={450} alt="A sunlit Italian coastal town" /><span>take me back ♡</span></div>
                </div>
                <div className={`${styles.coverPanel} ${styles.coverTokyo}`}>
                    <GalleryBook design={covers[3]} className={styles.bookTokyo} />
                    <div className={`${styles.coverNote} ${styles.tokyoNote}`}>all those little moments.<br />a proper place to keep them.<DrawnArrow /></div>
                    <div className={`${styles.loosePhoto} ${styles.memoryPhotoOne}`}><Image src={photos[1]} width={400} height={450} alt="A favourite view from a trip" /><span>the scenic route</span></div>
                    <div className={`${styles.loosePhoto} ${styles.memoryPhotoTwo}`}><Image src={photos[2]} width={400} height={450} alt="A travel memory to print" /><span>remember this?</span></div>
                    <Sticker kind="star" color="#f1c650" className={styles.coverStar} />
                </div>
                <div className={`${styles.coverPanel} ${styles.coverClosing}`}>
                    <GalleryBook design={covers[4]} className={styles.bookVietnam} />
                    <GalleryBook design={covers[5]} className={styles.bookAmsterdam} />
                    <div className={`${styles.coverNote} ${styles.finalNote}`}>and a cover that<br />feels like you.<DrawnArrow /><Link href="/photobooks/create" className={styles.coverStart}>Make it yours ↗</Link></div>
                </div>
            </motion.div>
        </div>
    </section>;
}

const faqs = [
    ["What even IS Itinero?", "Itinero helps you turn photos from a trip into a printed photo album. Bring your pictures together, choose a cover, arrange your pages, and make a book of your memories."],
    ["Who is it for?", "Anyone with a trip they want to remember. A big adventure, a weekend away, your honeymoon, or that little holiday you still talk about."],
    ["Can I use photos from my phone?", "Yes. You can upload photos from your phone or computer in the photo book studio. Use the original, full-resolution files for the clearest prints."],
    ["Do I need to be good at design?", "No. Start with a cover template, add your photos, and make it your own using the layouts and design tools in the studio."],
    ["Can I add my own words?", "Yes. Add a title and captions to help tell the story behind the photos."],
    ["Can I change things before I order?", "Yes. You can rearrange photos, change your cover, and preview your book in the studio before placing an order."],
    ["Can I make one as a gift?", "Absolutely. A book of shared memories makes a lovely gift. You can create an album for someone using photos you have permission to print."],
    ["How do I get started?", "Choose ‘Make mine!’ to sign in and open the photo book studio. From there, you can upload photos and start putting your album together."],
];

export default function PhotoAlbumLanding({ featuredCovers, overheadAlbum }: { featuredCovers: FeaturedTravelCovers; overheadAlbum: OverheadAlbum }) {
    const reduced = useReducedMotion();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return <div className={`${styles.site} ${reduced ? styles.reducedMotion : ""}`}>
        <a className={styles.skipLink} href="#how-it-works">Skip to how it works</a>
        <header className={styles.header}><Link href="/" aria-label="Itinero home" className={styles.logo}><CameraMark /></Link><Link href="/photobooks/create" className={styles.outlineButton}>Make mine!</Link></header>
        <main><Hero covers={featuredCovers} /><Reassurance />{features.map((feature, i) => <FeatureScene key={feature.scene} feature={feature} index={i} album={overheadAlbum} />)}<OtherThings /><CoverGallery covers={featuredCovers} />
            <section className={styles.faq}><h2>Questions you might have</h2><div>{faqs.map(([question, answer], i) => <div className={styles.faqRow} key={question}><h3><button aria-expanded={openFaq === i} aria-controls={`album-faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{question}<Plus size={18} className={openFaq === i ? styles.expanded : ""} /></button></h3><div id={`album-faq-${i}`} hidden={openFaq !== i}><p>{answer}</p></div></div>)}</div></section>
            <section className={styles.story}><div className={styles.filmstrip}>{["/images/how-it-works.png", ...photos.slice(0, 3)].map((src, i) => <div key={`${src}-${i}`}><Image src={src} alt="A moment from a trip" fill sizes="25vw" /></div>)}</div><div className={styles.storyText}><span className={styles.handwriting}>real<br />⌄</span><h2>Make a story<br />out of your camera roll</h2><Link href="/photobooks/create" className={styles.outlineButton}>Let’s make a book</Link></div></section>
        </main>
        <footer className={styles.footer}><div className={styles.footerTop}><h2>Making books that<br />bring trips back.</h2><nav aria-label="Footer"><div><a href="#how-it-works">How it works</a><a href="#your-way">Make it yours</a><Link href="/photobooks">My albums</Link></div><div><Link href="/photobooks/create">Make a book</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></nav></div><Link href="/" className={styles.footerWordmark} aria-label="Itinero home">itinero</Link><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Itinero</span><span>For the trips that stay with you.</span></div></footer>
    </div>;
}
