// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import TripWizard from "@/components/landing/TripWizard";

export const dynamic = "force-dynamic";

/* ---------- Curated Trips (unchanged) ---------- */
type CuratedTrip = {
    id: string;
    slug: string;
    title: string;
    destination: string;
    days: number;
    fromPrice: number; // USD (real cost floor)
    cover: string;
    tags: string[];
};

const CURATED: CuratedTrip[] = [
    {
        id: "ct-accra-3",
        slug: "accra-3-day-food-art",
        title: "Accra Food & Art",
        destination: "Accra, Ghana",
        days: 3,
        fromPrice: 185,
        cover: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=80",
        tags: ["food", "culture", "markets"]
    },
    {
        id: "ct-cape-5",
        slug: "cape-town-5-day-outdoors",
        title: "Cape Town Outdoors",
        destination: "Cape Town, South Africa",
        days: 5,
        fromPrice: 520,
        cover: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80",
        tags: ["adventure", "views", "wine"]
    },
    {
        id: "ct-zanzibar-4",
        slug: "zanzibar-4-day-beach",
        title: "Zanzibar Beach Break",
        destination: "Zanzibar, Tanzania",
        days: 4,
        fromPrice: 410,
        cover: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=80",
        tags: ["beach", "relax", "seafood"]
    },
    {
        id: "ct-nairobi-2",
        slug: "nairobi-2-day-city",
        title: "Nairobi City Sprint",
        destination: "Nairobi, Kenya",
        days: 2,
        fromPrice: 160,
        cover: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
        tags: ["city", "wildlife", "coffee"]
    },
];

/* ---------- NEW: Deals ---------- */
type Deal = {
    id: string;
    slug: string;
    title: string;
    destination: string;
    nights: number;
    original: number;   // USD
    price: number;      // USD (deal price)
    cover: string;
    endsAt: string;     // short text like "Ends May 30"
    includes: string[]; // short bullets
};

const DEALS: Deal[] = [
    {
        id: "de-accra-long",
        slug: "accra-city-4n-deal",
        title: "Accra City 4-Night Deal",
        destination: "Accra, Ghana",
        nights: 4,
        original: 460,
        price: 349,
        cover: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
        endsAt: "Ends Jun 30",
        includes: ["Hotel (4n)", "Airport pickup", "City tour"],
    },
    {
        id: "de-cpt-weekend",
        slug: "cape-town-3n-weekend",
        title: "Cape Town Weekend (3n)",
        destination: "Cape Town, South Africa",
        nights: 3,
        original: 590,
        price: 479,
        cover: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80",
        endsAt: "Ends Jul 15",
        includes: ["Guesthouse (3n)", "Winelands shuttle", "Table Mountain pass"],
    },
    {
        id: "de-zanzi-sun",
        slug: "zanzibar-5n-sun-saver",
        title: "Zanzibar 5-Night Sun Saver",
        destination: "Zanzibar, Tanzania",
        nights: 5,
        original: 830,
        price: 689,
        cover: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
        endsAt: "Ends Aug 10",
        includes: ["Beach resort (5n)", "Breakfast", "Stone Town tour"],
    },
];

export default function LandingPage() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="font-semibold text-lg">Itinero</Link>
                    <div className="flex gap-3">
                        <Link href="/login"><Button variant="ghost">Log in</Button></Link>
                        <Link href="/signup"><Button>Sign up</Button></Link>
                    </div>
                </div>
            </header>

            {/* Hero + Wizard */}
            <section className="mx-auto w-full max-w-8xl px-6 py-12 md:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
                        Plan smarter trips in minutes — then share, tweak, and go.
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg">
                        Itinero turns travel ideas into a day-by-day plan with suggested
                        activities, lodging, transport, and a budget — personalized to your vibe.
                    </p>

                </div>

                {/* Wizard */}
                <div className="mt-10">
                    <div className="mx-auto max-w-3xl rounded-xl  p-4 md:p-6">
                        <TripWizard/>
                    </div>
                </div>
            </section>

            {/* Curated trips carousel */}
            <section className="hidden mx-auto w-full max-w-6xl px-6 pb-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Curated trips you can start
                            from</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Real places with <span className="font-medium text-foreground">real costs</span> — not
                            estimates —
                            adjusted to your budget. Duplicate, tweak, and go.
                        </p>
                    </div>
                    <Link href="/explore"><Button variant="ghost">Explore all</Button></Link>
                </div>

                <div className="mt-6 relative">
                    <div
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {CURATED.map((t) => (
                            <Link key={t.id} href={`/trip/${t.slug}`}
                                  className="snap-start shrink-0 w-[280px] md:w-[320px] rounded-xl border bg-card hover:bg-accent/40 transition">
                                <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
                                    <Image src={t.cover} alt={t.title} fill className="object-cover"
                                           sizes="(max-width: 768px) 280px, 320px"/>
                                </div>
                                <div className="p-4">
                                    <div className="text-sm text-muted-foreground">{t.destination}</div>
                                    <h3 className="mt-1 font-medium">{t.title}</h3>
                                    <div className="mt-1 text-sm text-muted-foreground">{t.days} days</div>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {t.tags.slice(0, 3).map((tag) => (
                                            <span key={tag}
                                                  className="text-xs rounded-full border px-2 py-0.5 bg-muted">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-baseline justify-between">
                                        <div className="text-sm text-muted-foreground">From</div>
                                        <div className="text-base font-semibold">${t.fromPrice.toFixed(0)}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEW: Deals section */}
            <section className="hidden mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Limited-time deals</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Hand-picked bundles with transparent pricing — flights/stays/activities combined where
                            possible.
                        </p>
                    </div>
                    <Link href="/deals"><Button variant="ghost">See more</Button></Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {DEALS.map((d) => {
                        const save = Math.max(0, d.original - d.price);
                        const savePct = d.original > 0 ? Math.round((save / d.original) * 100) : 0;
                        return (
                            <Link key={d.id} href={`/deal/${d.slug}`}
                                  className="group rounded-xl border bg-card hover:bg-accent/40 transition overflow-hidden">
                                <div className="relative h-44 w-full">
                                    <Image src={d.cover} alt={d.title} fill
                                           className="object-cover transition-transform group-hover:scale-105"
                                           sizes="(max-width: 1024px) 100vw, 33vw"/>
                                    {savePct > 0 && (
                                        <div
                                            className="absolute left-3 top-3 rounded-full bg-green-600 text-white text-xs px-2 py-1 shadow">
                                            Save {savePct}%
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="text-sm text-muted-foreground">{d.destination}</div>
                                    <h3 className="mt-1 font-medium">{d.title}</h3>
                                    <div className="mt-1 text-sm text-muted-foreground">{d.nights} nights</div>

                                    <ul className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        {d.includes.slice(0, 3).map((i) => (
                                            <li key={i} className="rounded-full border px-2 py-0.5 bg-muted">{i}</li>
                                        ))}
                                    </ul>

                                    <div className="mt-4 flex items-end justify-between">
                                        <div className="space-y-0.5">
                                            <div
                                                className="text-xs line-through text-muted-foreground">${d.original.toFixed(0)}</div>
                                            <div className="text-lg font-semibold">${d.price.toFixed(0)}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{d.endsAt}</div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <Separator className="my-8 hidden"/>

            {/* Features */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-16 hidden">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-lg border p-5">
                        <h3 className="font-medium text-lg">Personalized picks</h3>
                        <p className="text-muted-foreground mt-2">
                            Activities, food, and stays that match your budget, time, and travel vibe.
                        </p>
                    </div>
                    <div className="rounded-lg border p-5">
                        <h3 className="font-medium text-lg">Plan to share</h3>
                        <p className="text-muted-foreground mt-2">
                            One link for friends/family. Collaborate or keep it view-only.
                        </p>
                    </div>
                    <div className="rounded-lg border p-5">
                        <h3 className="font-medium text-lg">Flexible pricing</h3>
                        <p className="text-muted-foreground mt-2">
                            No subscription required. Pay per trip — or choose a monthly plan.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t">
                <div
                    className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground flex items-center justify-between">
                    <div>© {new Date().getFullYear()} Itinero</div>
                    <div className="flex gap-4">
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/about">About</Link>
                        <Link href="/terms">Terms</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}