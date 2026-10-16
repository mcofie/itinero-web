"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import LandingImage from "./LandingImage";
import { LazyMotion, domAnimation, m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Camera, Check, Heart, ImagePlus, Layers, MapPin, PackageCheck, Pencil, Plus, ShieldCheck, Smile, Sun, Truck } from "lucide-react";
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

function Hero({ covers }: { covers: FeaturedTravelCovers }) {
    const ref = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<HTMLDivElement>(null);
    const [geometry, setGeometry] = useState({ travel: 0, start: 0, height: 0 });
    const reduced = useReducedMotion();
    const { scrollY, scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    useLayoutEffect(() => {
        const section = ref.current;
        const sticky = stickyRef.current;
        const book = bookRef.current;
        if (!section || !sticky || !book) return;
        const measure = () => {
            // Match the reference: release when the rotated book's bottom-left
            // corner reaches 85% of the viewport, then move the whole hero together.
            const bottom = book.offsetTop + book.offsetHeight * Math.cos(20 * Math.PI / 180);
            const travel = Math.max(0, bottom - window.innerHeight * .85);
            const start = section.getBoundingClientRect().top + window.scrollY;
            const height = sticky.offsetHeight + travel;
            setGeometry(previous => previous.travel === travel && previous.start === start && previous.height === height ? previous : { travel, start, height });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(sticky);
        observer.observe(book);
        window.addEventListener("resize", measure);
        return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
    }, []);
    const y = useTransform(() => -Math.min(geometry.travel, Math.max(0, scrollY.get() - geometry.start)));
    const titleY = useTransform(scrollYProgress, [0, .5, 1], [0, -10, 0]);

    return <section ref={ref} className={styles.heroJourney} aria-label="Meet Itinero" style={{ "--hero-cover-color": TRAVEL_COVERS_BY_ID[covers[0]].color, "--hero-height": geometry.height ? `${geometry.height}px` : undefined } as CSSProperties}>
        <div ref={stickyRef} className={styles.heroSticky}>
            <div className={styles.heroCopy}>
                <p className={`${styles.handwriting} ${styles.heroGreeting}`}>Dear travellers,</p>
                <m.h1 aria-label="meet itinero." style={{ y: reduced ? 0 : titleY }}>
                    {["meet", "itinero"].map((word, line) => <span key={word} aria-hidden="true">
                        {[...word].map((letter, i) => <span key={i} className={styles.heroLetter} style={{ "--letter-delay": `${.12 + line * .25 + i * .045}s` } as CSSProperties}>{letter}</span>)}
                        {line === 1 && <span className={styles.titlePeriod}>.</span>}
                    </span>)}
                </m.h1>
                <p className={styles.heroSubtitle}>It’s a photo album that <span className={`${styles.handwriting} ${styles.heroActually}`}>actually!<svg viewBox="0 0 140 14" fill="none" aria-hidden="true"><path d="M3 9C32 2 91 2 136 7M20 13C51 8 96 9 119 11" pathLength="1" /></svg></span><br />brings your trips back.</p>
            </div>
            <div className={styles.heroAction}>
                <Link prefetch={false} href="/make-album" className={styles.outlineButton}>Make mine!</Link>
                <p><strong>8 × 10 hardcover · GHS 800</strong><span>Delivery available across Accra</span></p>
            </div>
            <div className={styles.mobileShowcase} aria-hidden="true">
                <div className={styles.showcaseLeft}><TravelAlbumCover design={covers[1]} eager media="mobile" /></div>
                <div className={styles.showcaseRight}><TravelAlbumCover design={covers[2]} eager media="mobile" /></div>
                <div className={styles.showcaseFront}><TravelAlbumCover design={covers[0]} eager media="mobile" prominent /></div>
                <span className={styles.showcaseCaption}>a little piece of somewhere wonderful</span>
            </div>
            <m.div ref={bookRef} className={styles.heroBook} style={{ rotate: -20, y: reduced ? 0 : y }} aria-hidden="true">
                <TravelAlbumCover design={covers[0]} eager media="desktop" prominent />
            </m.div>
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
        <m.div className={styles.overheadParallax} style={{ y: reduced ? 0 : y, inset: reduced ? 0 : undefined }}>
            <LandingImage src={album.src} alt={`Overhead view of a Black woman's hand holding the ${album.country} photo album above a white table with a potted plant`} fill sizes="100vw" className={styles.heldAlbumPhoto} />
        </m.div>
    </div>;
}

function ProcessVisual({ active, album, covers }: { active: number; album: OverheadAlbum; covers: FeaturedTravelCovers }) {
    const labels = ["Choose your favourite moments", "Find the cover that feels right", "Move every moment into place", "Add the words you want to remember", "See the whole book before it prints"];
    return <m.div key={active} className={`${styles.processVisual} ${styles[`processVisual${active}`]}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} aria-label={labels[active]}>
        {active === 0 && <div className={styles.photoPickerDemo}>
            <div className={styles.demoTopline}><span>YOUR CAMERA ROLL</span><strong>12 selected</strong></div>
            <div className={styles.demoPhotoGrid}>{photos.slice(0, 4).map((src, index) => <div key={src}><LandingImage src={src} alt="" fill sizes="25vw" /><span>{index + 1}</span>{index < 3 && <Check size={14} />}</div>)}</div>
            <div className={styles.demoButton}>Add these moments</div>
        </div>}
        {active === 1 && <div className={styles.coverPickerDemo}>
            <span className={styles.demoKicker}>Choose a destination cover</span>
            <div>{covers.slice(0, 3).map((cover, index) => <div key={cover} className={index === 1 ? styles.demoCoverActive : ""}><TravelAlbumCover design={cover} /></div>)}</div>
            <strong>144 places, one shared style</strong>
        </div>}
        {active === 2 && <div className={styles.orderDemo}>
            <span className={styles.demoKicker}>Drag to tell it your way</span>
            <div className={styles.orderStrip}>{photos.slice(0, 4).map((src, index) => <div key={src}><b>{String(index + 1).padStart(2, "0")}</b><LandingImage src={src} alt="" fill sizes="20vw" /><span>⋮⋮</span></div>)}</div>
            <div className={styles.orderLine}><span /><strong>Your trip, in order</strong><span /></div>
        </div>}
        {active === 3 && <div className={styles.captionDemo}>
            <div className={styles.captionPage}>
                <LandingImage src={photos[1]} alt="" fill sizes="50vw" />
                <span>the scenic route was worth it</span>
            </div>
            <div className={styles.captionEditor}><span>CAPTION</span><strong>The scenic route was worth it</strong><i>|</i></div>
        </div>}
        {active === 4 && <div className={styles.finishedDemo}>
            <OverheadPhoto album={album} />
            <div className={styles.proofBadge}><Check size={17} /><span><strong>Every page checked</strong>Ready for print</span></div>
        </div>}
    </m.div>;
}

function FeatureScene({ feature, index, album, covers }: { feature: typeof features[number]; index: number; album: OverheadAlbum; covers: FeaturedTravelCovers }) {
    const [active, setActive] = useState(0);
    const id = `album-scene-${index}`;
    return <section id={index === 0 ? "how-it-works" : undefined} className={`${styles.featureScene} ${styles[feature.scene]}`} style={{ "--scene-accent": feature.color } as CSSProperties}>
        <div id={id} className={styles.sceneArt} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
            <ProcessVisual active={active} album={album} covers={covers} />
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

function InsideBook() {
    return <section className={styles.insideBook} aria-labelledby="inside-book-heading">
        <div className={styles.insideBookCopy}>
            <span className={styles.handwriting}>open it up</span>
            <h2 id="inside-book-heading">The cover is only<br />the beginning.</h2>
            <p>Give the big views room to breathe, bring little moments together, and add the words that make the memory yours.</p>
            <ul><li><Check size={17} />Full-page and editorial layouts</li><li><Check size={17} />Captions in your own words</li><li><Check size={17} />A PDF proof before ordering</li></ul>
        </div>
        <div className={styles.openAlbum} aria-label="Examples of printed photo album pages">
            <div className={styles.spreadPage}>
                <span className={styles.spreadFolio}>ITALY · 01</span>
                <div className={styles.spreadHeroPhoto}><LandingImage src={photos[0]} alt="A coastal town printed across a photo album page" fill sizes="45vw" /></div>
                <p>the afternoon we followed the coast</p>
            </div>
            <div className={styles.spreadPage}>
                <span className={styles.spreadFolio}>ITALY · 02</span>
                <div className={styles.spreadPhotoPair}><div><LandingImage src={photos[1]} alt="A travel view in an editorial photo layout" fill sizes="22vw" /></div><div><LandingImage src={photos[2]} alt="A favourite travel moment in a printed album" fill sizes="22vw" /></div></div>
                <p>small stops, good light, nowhere else to be</p>
            </div>
        </div>
        <div className={styles.insideBookDetails}><span><strong>8 × 10 in</strong>hardcover format</span><span><strong>GHS 800</strong>album price</span><span><strong>Your proof</strong>review every page first</span></div>
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
        <div className={styles.stickyNotes}>{notes.map((note, i) => <m.div key={i} className={styles.stickyNote} initial={{ y: 45, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: .15 }} transition={{ delay: i * .07 }}><div>{note.icon}</div><p>{note.label}</p></m.div>)}</div>
    </section>;
}

function OtherThings() {
    const things = [{ icon: <Camera />, text: <>Straight from<br />your camera roll</> }, { icon: <Pencil />, text: <>Little captions,<br />big feelings</> }, { icon: <Layers />, text: <>Every page,<br />your way</> }, { icon: <Sun />, text: <>Keep a little<br />sunshine</> }, { icon: <MapPin />, text: <>Anywhere<br />you’ve been</> }, { icon: <Heart />, text: <>A very personal<br />present</> }, { icon: <Smile />, text: <>The blurry ones<br />count, too</> }, { icon: <BookOpen />, text: <>Your own library<br />of adventures</> }];
    return <section className={styles.otherThings}><div className={styles.otherHeading}><span className={styles.handwriting}>soooo much<br />⌄</span><h2>And there’s other<br />good stuff!</h2></div>{things.map((item, i) => <div key={i} className={styles.doodle} style={{ "--doodle-index": i } as CSSProperties}>{item.icon}<p>{item.text}</p></div>)}</section>;
}

function GalleryBook({ design, className }: { design: TravelCoverId; className: string }) {
    const name = TRAVEL_COVERS_BY_ID[design].country;
    return <Link prefetch={false} href="/make-album" className={`${styles.scatteredBook} ${className}`} aria-label={`Make your own photo album — ${name} cover`}>
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
    // Three focused scenes span 270vw; the last frame ends at the viewport edge.
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62.962963%"]);
    const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
    return <section ref={ref} className={styles.coverJourney} id="your-way" aria-labelledby="cover-heading">
        <div className={styles.coverViewport}>
            <m.div className={styles.coverTrack} style={{ x: reduced ? 0 : x }}>
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
                    <div className={`${styles.loosePhoto} ${styles.romePhoto}`}><LandingImage src={photos[0]} width={400} height={450} sizes="(max-width: 540px) 45vw, 30vw" alt="A sunlit Italian coastal town" /><span>take me back ♡</span></div>
                </div>
                <div className={`${styles.coverPanel} ${styles.coverClosing}`}>
                    <GalleryBook design={covers[4]} className={styles.bookVietnam} />
                    <GalleryBook design={covers[5]} className={styles.bookAmsterdam} />
                    <div className={`${styles.coverNote} ${styles.finalNote}`}>and a cover that<br />feels like you.<DrawnArrow /><Link prefetch={false} href="/make-album" className={styles.coverStart}>Make it yours ↗</Link></div>
                </div>
            </m.div>
            <div className={styles.coverProgress} aria-hidden="true"><span>THE COVERS</span><i><m.b style={{ scaleX: progress }} /></i><span>01 — 03</span></div>
        </div>
    </section>;
}

const fulfilmentSteps = [
    { icon: <BookOpen />, number: "01", title: "Build your album", copy: "Choose a cover, add your photos, arrange the pages and download your PDF proof." },
    { icon: <ShieldCheck />, number: "02", title: "We check the files", copy: "We review the print file and contact you if a photo or page needs attention." },
    { icon: <PackageCheck />, number: "03", title: "We print and bind", copy: "Printing begins after payment and file review. You can follow the order from My Albums." },
    { icon: <Truck />, number: "04", title: "Delivered in Accra", copy: "We currently deliver albums within Accra, Ghana. Your delivery fee is shown clearly in the builder." },
];

function Fulfilment() {
    return <section className={styles.fulfilment} aria-labelledby="fulfilment-heading">
        <div className={styles.fulfilmentHeading}><span className={styles.handwriting}>from camera roll to coffee table</span><h2 id="fulfilment-heading">What happens after<br />you make your book.</h2></div>
        <div className={styles.fulfilmentSteps}>{fulfilmentSteps.map(step => <article key={step.number}><div>{step.icon}</div><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div>
        <div className={styles.fulfilmentOffer}><span><strong>GHS 800</strong> for an 8 × 10 in hardcover</span><span>Delivery available across Accra</span><Link prefetch={false} href="/make-album" className={styles.outlineButton}>Start your album</Link></div>
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
    ["How much does it cost?", "An 8 × 10 inch hardcover album is GHS 800. The current Accra delivery fee is shown clearly in the album builder before you order."],
    ["Where do you deliver?", "We currently deliver within Accra, Ghana. You can follow file review, printing and delivery from My Albums after ordering."],
    ["How do I get started?", "Choose a destination cover, add your photos, arrange the pages, preview every page, and order when you are happy with the book."],
];

export default function PhotoAlbumLanding({ featuredCovers, overheadAlbum }: { featuredCovers: FeaturedTravelCovers; overheadAlbum: OverheadAlbum }) {
    const reduced = useReducedMotion();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return <LazyMotion features={domAnimation} strict><div className={`${styles.site} ${reduced ? styles.reducedMotion : ""}`}>
        <a className={styles.skipLink} href="#how-it-works">Skip to how it works</a>
        <header className={styles.header}><Link prefetch={false} href="/" aria-label="Itinero home" className={styles.logo}><img src="/brand/itinero-mark-animated.svg" alt="" width={76} height={46} /></Link><Link prefetch={false} href="/make-album" className={styles.outlineButton}>Make mine!</Link></header>
        <main><Hero covers={featuredCovers} /><Reassurance />{features.map((feature, i) => <FeatureScene key={feature.scene} feature={feature} index={i} album={overheadAlbum} covers={featuredCovers} />)}<InsideBook /><OtherThings /><CoverGallery covers={featuredCovers} /><Fulfilment />
            <section className={styles.faq}><h2>Questions you might have</h2><div>{faqs.map(([question, answer], i) => <div className={styles.faqRow} key={question}><h3><button aria-expanded={openFaq === i} aria-controls={`album-faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{question}<Plus size={18} className={openFaq === i ? styles.expanded : ""} /></button></h3><div id={`album-faq-${i}`} hidden={openFaq !== i}><p>{answer}</p></div></div>)}</div></section>
            <section className={styles.story}><div className={styles.filmstrip}>{["/images/how-it-works.png", ...photos.slice(0, 3)].map((src, i) => <div key={`${src}-${i}`}><LandingImage src={src} alt="A moment from a trip" fill sizes="25vw" /></div>)}</div><div className={styles.storyText}><span className={styles.handwriting}>real<br />⌄</span><h2>Make a story<br />out of your camera roll</h2><Link prefetch={false} href="/make-album" className={styles.outlineButton}>Let’s make a book</Link></div></section>
        </main>
        <footer className={styles.footer}><div className={styles.footerTop}><h2>Making books that<br />bring trips back.</h2><nav aria-label="Footer"><div><a href="#how-it-works">How it works</a><a href="#your-way">Make it yours</a><Link prefetch={false} href="/photobooks">My albums</Link></div><div><Link prefetch={false} href="/make-album">Make a book</Link><Link prefetch={false} href="/terms">Terms</Link><Link prefetch={false} href="/privacy">Privacy</Link></div></nav></div><img className={styles.footerBrandMark} src="/brand/itinero-mark-white-animated.svg" alt="" width={132} height={66} /><Link prefetch={false} href="/" className={styles.footerWordmark} aria-label="Itinero home">itinero</Link><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Itinero</span><span>For the trips that stay with you.</span></div></footer>
    </div></LazyMotion>;
}
