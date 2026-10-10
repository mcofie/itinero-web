"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Camera, Heart, ImagePlus, Layers, MapPin, Pencil, Plus, Smile, Sun } from "lucide-react";
import { Link } from "@/i18n/routing";
import styles from "./PhotoAlbumLanding.module.css";

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

function AlbumCover({ title = "Italy", year = "2025", color = "brown", decoration = false }: { title?: string; year?: string; color?: string; decoration?: boolean }) {
    return <div className={`${styles.albumCover} ${styles[color] || ""}`}>
        <div className={styles.coverGrain} />
        <div className={styles.coverLabel}><div className={styles.labelTitle}><small>Our trip to</small><span>{title}</span></div><div className={styles.labelBottom}><span>Year <b>{year}</b></span><span>Volume <b>01</b></span></div></div>
        {decoration && <Sticker kind={color === "pink" ? "heart" : "flower"} color={color === "pink" ? "#ed7067" : "#8ec44f"} className={styles.coverSticker} />}
        <span className={styles.embossedMark}><CameraMark /></span>
    </div>;
}

function Hero() {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        const query = window.matchMedia("(max-width: 700px)");
        const sync = () => setMobile(query.matches);
        sync();
        query.addEventListener("change", sync);
        return () => query.removeEventListener("change", sync);
    }, []);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const rotate = useTransform(scrollYProgress, [0, .6], [-20, 0]);
    const x = useTransform(scrollYProgress, [0, .6], ["0%", mobile ? "28%" : "18%"]);
    const y = useTransform(scrollYProgress, [0, .6], ["0%", mobile ? "-110%" : "-30%"]);
    const scale = useTransform(scrollYProgress, [0, .6], [1, mobile ? .55 : .77]);
    const coverRotate = useTransform(scrollYProgress, [.28, .8], [0, -177]);
    const copyOpacity = useTransform(scrollYProgress, [0, .24], [1, 0]);

    return <section ref={ref} className={styles.heroJourney} aria-label="Meet Itinero">
        <div className={styles.heroSticky}>
            <motion.div className={styles.heroCopy} style={{ opacity: reduced ? 1 : copyOpacity }}>
                <p className={styles.handwriting}>Dear travellers,</p>
                <h1><span>meet</span><span>itinero<span className={styles.titlePeriod}>.</span></span></h1>
                <p className={styles.heroSubtitle}>It’s a photo album that <span className={styles.handwriting}>actually!</span><br />brings your trips back.</p>
            </motion.div>
            <motion.div className={styles.heroAction} style={{ opacity: reduced ? 1 : copyOpacity }}>
                <Link href="/photobooks/create" className={styles.outlineButton}>Make mine!</Link>
                <p>Your photos. A real, hold-it-in-your-hands book.</p>
            </motion.div>
            <motion.div className={styles.heroBook} style={reduced ? undefined : { rotate, x, y, scale }} aria-hidden="true">
                <div className={styles.bookPageBlock}><div className={styles.insidePage}><span className={styles.handwriting}>Hello, memories!</span><div className={styles.welcomeTitle}>Welcome<br />back to<br />your trip.</div><Sticker kind="flower" color="#b2da72" className={styles.pageFlower} /><Sticker kind="heart" color="#e76c67" className={styles.pageHeart} /><span className={styles.pagePrompt}>IT ALL STARTS WITH YOUR PHOTOS</span></div></div>
                <motion.div className={styles.turningCover} style={reduced ? undefined : { rotateY: coverRotate }}><div className={styles.coverFront}><AlbumCover /></div><div className={styles.coverBack}><div className={styles.backPocket} /><CameraMark /></div></motion.div>
                <div className={styles.pencil}><span /><i /></div>
            </motion.div>
        </div>
    </section>;
}

const features = [
    { scene: "meadow", intro: "It’s kinda like", accent: "a time machine", color: "#57ad61", items: ["All your favourite moments", "The places you wandered", "The people who came along", "The little things in between", "A story you can hold"], notes: ["A trip worth remembering", "Somewhere we got lost", "Together is a good place", "The little moments", "Take me back"] },
    { scene: "sky", intro: "Your photos,", accent: "in real life.", color: "#4183d9", items: ["Pick photos from your trip", "Choose a cover you love", "Put your story in order", "Add your own words", "Preview every page"], notes: ["Our favourite escape", "A cover of our own", "One day at a time", "Wish you were here", "Every page, a memory"] },
    { scene: "desk", intro: "A little book with", accent: "a lot of feeling", color: "#d16ba4", items: ["Made for your coffee table", "Made for a rainy afternoon", "Made to pass around", "Made for someone you love", "Made to go back to"], notes: ["The best days", "A little sunshine", "Remember when?", "For you, with love", "Let’s do it all again"] },
];

function FeatureScene({ feature, index }: { feature: typeof features[number]; index: number }) {
    const [active, setActive] = useState(0);
    const id = `album-scene-${index}`;
    const matrices = ["matrix(.58 .147 -.285 .803 545 146)", "matrix(.57 -.095 .117 .915 321 118)", "matrix(.54 0 0 .89 462 129)"];
    return <section id={index === 0 ? "how-it-works" : undefined} className={`${styles.featureScene} ${styles[feature.scene]}`} style={{ "--scene-accent": feature.color } as CSSProperties}>
        <div id={id} className={styles.sceneArt} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
            <svg viewBox="0 0 900 506.25" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${feature.notes[active]} — travel photos in an album`}>
                <rect width="900" height="507" fill="#fff9ed" />
                <g transform={matrices[index]}>
                    <rect x="-8" y="-8" width="325" height="330" fill="#fffaf0" />
                    <image href={photos[(active + index) % photos.length]} x="15" y="18" width="270" height="220" preserveAspectRatio="xMidYMid slice" />
                    <text x="150" y="272" textAnchor="middle" className={styles.sceneCaption}>{feature.notes[active]}</text>
                    <text x="150" y="298" textAnchor="middle" className={styles.scenePageNumber}>— {active + 1} —</text>
                </g>
                <image href={`/images/landing/${feature.scene}.webp`} width="900" height="506.25" />
            </svg>
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

function OfflineSection() {
    return <section className={styles.offline}><h2>A little more offline.</h2><p>Some things are better on paper.</p><div className={styles.notepaper}><span className={styles.handwriting}>The good kind of no.</span>{["no endless scrolling", "no forgotten folders", "no low-battery moments", "no notifications", "just your favourite people", "and places"].map((line, i) => <div key={line}><span>{i < 4 ? "×" : "♡"}</span>{line}</div>)}</div><div className={styles.offlineStar}><Sticker kind="star" color="#f5c44c" /><p>screen-free<br />reminiscing</p></div><div className={styles.offlineHeart}><Sticker kind="heart" color="#ef746c" /><p>made<br />with feeling</p></div></section>;
}

function CoverGallery() {
    const covers = [{ title: "Greece", color: "cloud", className: styles.galleryOne }, { title: "Paris", color: "pink", className: styles.galleryTwo }, { title: "Japan", color: "blue", className: styles.galleryThree }, { title: "Bali", color: "green", className: styles.galleryFour }, { title: "Ghana", color: "orange", className: styles.galleryFive }, { title: "Iceland", color: "grey", className: styles.gallerySix }];
    return <section className={styles.coverGallery} id="your-way"><div className={styles.galleryHeading}><span className={styles.handwriting}>Like making</span><h2>Our photo book.<br />Our way.</h2></div>{covers.map(cover => <Link key={cover.title} href="/photobooks/create" className={`${styles.galleryAlbum} ${cover.className}`} aria-label={`Create your own ${cover.title} photo album`}><AlbumCover title={cover.title} color={cover.color} decoration /></Link>)}<span className={`${styles.galleryNote} ${styles.noteOne}`}>a little blue<br />for the big blue sea ↙</span><span className={`${styles.galleryNote} ${styles.noteTwo}`}>cute pinks ↗</span><span className={`${styles.galleryNote} ${styles.noteThree}`}>every trip deserves<br />its own cover</span><span className={`${styles.galleryNote} ${styles.noteFour}`}>and the little details<br />that make it yours ↗</span><Sticker color="#629de0" className={styles.galleryFlower} /><Sticker kind="heart" color="#ef796f" className={styles.galleryHeart} /><Sticker kind="star" color="#ffd35a" className={styles.galleryStar} /><div className={styles.travelStickers}>{["paris-tower", "italy-lemon", "palm-tree", "sun", "seashell", "mountains"].map(name => <Image key={name} src={`/images/photobooks/${name}.png`} width={130} height={130} alt="" />)}</div></section>;
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

export default function PhotoAlbumLanding() {
    const reduced = useReducedMotion();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return <div className={`${styles.site} ${reduced ? styles.reducedMotion : ""}`}>
        <a className={styles.skipLink} href="#how-it-works">Skip to how it works</a>
        <header className={styles.header}><Link href="/" aria-label="Itinero home" className={styles.logo}><CameraMark /></Link><Link href="/photobooks/create" className={styles.outlineButton}>Make mine!</Link></header>
        <main><Hero /><Reassurance />{features.map((feature, i) => <FeatureScene key={feature.scene} feature={feature} index={i} />)}<OtherThings /><OfflineSection /><CoverGallery />
            <section className={styles.inGoodHands}><div className={styles.handsPhotos}>{photos.slice(0, 4).map((src, i) => <div key={src}><Image src={src} alt={["A seaside town to remember", "A favourite travel moment", "A trip worth printing", "A little piece of an adventure"][i]} fill sizes="(max-width: 700px) 42vw, 25vw" /></div>)}</div><div className={styles.careMessage}><h2>Good memories.<br />In good hands.</h2><span className={styles.handwriting}>made by you, for you ♡</span></div></section>
            <section className={styles.faq}><h2>Questions you might have</h2><div>{faqs.map(([question, answer], i) => <div className={styles.faqRow} key={question}><h3><button aria-expanded={openFaq === i} aria-controls={`album-faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{question}<Plus size={18} className={openFaq === i ? styles.expanded : ""} /></button></h3><div id={`album-faq-${i}`} hidden={openFaq !== i}><p>{answer}</p></div></div>)}</div></section>
            <section className={styles.story}><div className={styles.filmstrip}>{["/images/how-it-works.png", ...photos.slice(0, 3)].map((src, i) => <div key={`${src}-${i}`}><Image src={src} alt="A moment from a trip" fill sizes="25vw" /></div>)}</div><div className={styles.storyText}><span className={styles.handwriting}>real<br />⌄</span><h2>Make a story<br />out of your camera roll</h2><Link href="/photobooks/create" className={styles.outlineButton}>Let’s make a book</Link></div></section>
        </main>
        <footer className={styles.footer}><div className={styles.footerTop}><h2>Making books that<br />bring trips back.</h2><nav aria-label="Footer"><div><a href="#how-it-works">How it works</a><a href="#your-way">Make it yours</a><Link href="/photobooks">My albums</Link></div><div><Link href="/photobooks/create">Make a book</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></nav></div><Link href="/" className={styles.footerWordmark} aria-label="Itinero home">itinero</Link><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Itinero</span><span>For the trips that stay with you.</span></div></footer>
    </div>;
}
