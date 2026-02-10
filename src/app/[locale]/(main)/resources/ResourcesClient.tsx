"use client";

import * as React from "react";
import {
    Search,
    Globe,
    Smartphone,
    CreditCard,
    Landmark,
    Siren,
    Plane,
    Wifi,
    ShieldCheck,
    Map as MapIcon,
    Car,
    Utensils,
    HandHeart,
    Shirt,
    AlertTriangle,
    PhoneCall,
    Building2,
    Umbrella,
    Sun,
    CloudRain,
    Snowflake,
    Wind,
    BriefcaseMedical,
    ExternalLink,
    ChevronRight,
    Plug,
    Languages,
    Train,
    Mic,
    Coffee,
    AlertOctagon,
    Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MotionConfig, motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// --- Types & Data ---

type Season = "spring" | "summer" | "autumn" | "winter";
type RegionId = "global" | "europe" | "asia" | "africa" | "north_america" | "south_america" | "oceania";

interface ResourceLink {
    title: string;
    desc: string;
    url: string;
    icon: any;
    tag: string;
}

interface RegionData {
    id: RegionId;
    name: string;
    tagline: string;
    image: string; // Unsplash URL

    // Insurance
    insuranceTip: string;
    insuranceTags: string[];

    // Quick Stats
    emergency: { police: string; ambulance: string };
    voltage: string;
    plugs: string;
    plugType: string; // simple code for visualizer if we had images, text for now

    // Logistics & Entry
    logistics: ResourceLink[];

    // Digital Kit
    apps: {
        ride: { name: string; region: string; url?: string }[];
        connect: { name: string; type: string; url?: string }[];
        utility: { name: string; desc: string; url?: string }[];
    };

    // Financial
    finance: {
        tipping: string;
        cashStrategy: string;
        currencyTip: string;
        coffeeIndex: string; // Cost of a coffee
        mealIndex: string; // Cost of avg meal
    };

    // Safety & Scams (NEW)
    scams: {
        title: string;
        desc: string;
        severity: "Medium" | "High";
    }[];

    // Pocket Lingo (NEW)
    phrases: {
        original: string;
        phonetic: string;
        meaning: string;
    }[];

    // Cultural
    culture: ResourceLink[];

    // Wardrobe
    clothing: Record<Season, {
        summary: string;
        items: string[];
    }>;
}

const REGIONS: Record<RegionId, RegionData> = {
    global: {
        id: "global",
        name: "Global / General",
        tagline: "Universal travel standards and worldwide tools.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
        insuranceTip: "Look for policies with at least $100k emergency medical and repatriation coverage. Recommended: World Nomads or SafetyWing.",
        insuranceTags: ["Repatriation", "Medical", "Lost Luggage"],
        emergency: { police: "112 / 911", ambulance: "112 / 911" },
        voltage: "110-240V",
        plugs: "Universal Adapter Required",
        plugType: "Universal",
        logistics: [
            { title: "Sherpa Visa Checker", desc: "Verify entry requirements for any passport.", url: "https://www.joinsherpa.com/", icon: ShieldCheck, tag: "Essential" },
            { title: "Passport Index", desc: "Compare visa-free access globally.", url: "https://www.passportindex.org/", icon: Globe, tag: "Planning" },
            { title: "CDC Travel Health", desc: "Vaccination requirements by country.", url: "https://wwwnc.cdc.gov/travel", icon: BriefcaseMedical, tag: "Health" }
        ],
        apps: {
            ride: [{ name: "Uber", region: "Worldwide", url: "https://www.uber.com" }],
            connect: [{ name: "Airalo", type: "eSIM", url: "https://www.airalo.com" }, { name: "WhatsApp", type: "Msg", url: "https://www.whatsapp.com" }],
            utility: [{ name: "XE Currency", desc: "Rates", url: "https://www.xe.com" }, { name: "Google Translate", desc: "Lang", url: "https://translate.google.com" }]
        },
        finance: {
            tipping: "Varies significantly. Research destination specifically.",
            cashStrategy: "Always carry ~100 USD/EUR in cash as emergency backup.",
            currencyTip: "Avoid airport exchanges. Withdraw from ATMs in local currency.",
            coffeeIndex: "$2.50 - $5.00",
            mealIndex: "$10 - $25"
        },
        scams: [
            { title: "The 'Broken' Meter", desc: "Taxi drivers claiming meter is broken to overcharge.", severity: "Medium" },
            { title: "Public WiFi Hacks", desc: "Fake hotspots in airports/cafes to steal data.", severity: "High" }
        ],
        phrases: [
            { original: "Hello", phonetic: "Heh-loh", meaning: "Universal" },
            { original: "Thank You", phonetic: "Thangk Yew", meaning: "Gratitude" }
        ],
        culture: [
            { title: "Universal Etiquette", desc: "Learn 'Hello' and 'Thank You' everywhere.", url: "https://pt.babbel.com/", icon: Languages, tag: "Basics" },
            { title: "Dress Modestly", desc: "Rule of thumb for religious sites worldwide.", url: "https://www.travelandleisure.com/style/travel-clothing-packing-tips", icon: Shirt, tag: "Respect" }
        ],
        clothing: {
            spring: { summary: "Layers are key. Light jacket and breathable fabrics.", items: ["Light Jacket", "T-Shirts", "Jeans"] },
            summer: { summary: "Breathable natural fabrics like linen and cotton.", items: ["Linen Shirt", "Shorts", "Sun Hat"] },
            autumn: { summary: "Prepare for variable weather. Waterproof outer layer.", items: ["Rain Jacket", "Sweater", "Boots"] },
            winter: { summary: "Insulation involves 3 layers: base, warm, and outer.", items: ["Thermal Base", "Wool Coat", "Scarf"] }
        }
    },
    europe: {
        id: "europe",
        name: "Europe",
        tagline: "History, culture, and cobblestone streets.",
        image: "https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=2070&auto=format&fit=crop",
        insuranceTip: "Schengen Visa often REQUIRES insurance with €30k coverage. Ensure your policy certificate explicitly states 'Schengen compliant'.",
        insuranceTags: ["Schengen Compliant", "Theft Protection", "Train Delays"],
        emergency: { police: "112", ambulance: "112" },
        voltage: "230V",
        plugs: "Type C / F (Europlug)",
        plugType: "C / F",
        logistics: [
            { title: "ETIAS Info", desc: "New entry requirement for non-EU travelers (2025).", url: "https://travel-europe.europa.eu/etias_en", icon: ShieldCheck, tag: "New Rule" },
            { title: "Eurail Planner", desc: "Train schedules and pass booking.", url: "https://www.eurail.com/", icon: Train, tag: "Transport" }
        ],
        apps: {
            ride: [{ name: "Bolt", region: "East/Central", url: "https://bolt.eu" }, { name: "FREENOW", region: "West", url: "https://www.free-now.com" }, { name: "Uber", region: "Major Cities", url: "https://uber.com" }],
            connect: [{ name: "Airalo (Eurolink)", type: "eSIM", url: "https://www.airalo.com/europe-esim" }, { name: "Orange", type: "Sim", url: "https://travel.orange.com/" }],
            utility: [{ name: "Citymapper", desc: "Transit", url: "https://citymapper.com" }, { name: "TheFork", desc: "Dining", url: "https://www.thefork.com" }]
        },
        finance: {
            tipping: "Modest. Round up the bill or 5-10% for excellent service. Service charge often included.",
            cashStrategy: "Card is King in North/West. Cash (Euros) still essential in Germany and South/East.",
            currencyTip: "Multi-currency cards (Revolut/Wise) work perfectly here.",
            coffeeIndex: "€3.50 (Paris) - €1.50 (Lisbon)",
            mealIndex: "€15 - €30"
        },
        scams: [
            { title: "The Gold Ring", desc: "Found ring dropped by scammer, asks for money.", severity: "Medium" },
            { title: "Friendship Bracelet", desc: "Forced bracelet on wrist, then demand payment.", severity: "Medium" }
        ],
        phrases: [
            { original: "Bonjour", phonetic: "Bohn-zhoor", meaning: "Hello (FR)" },
            { original: "Danke", phonetic: "Dahn-kuh", meaning: "Thanks (DE)" },
            { original: "Ciao", phonetic: "Chow", meaning: "Hi/Bye (IT)" }
        ],
        culture: [
            { title: "Dining Etiquette", desc: "Ask for the bill ('L'addition'). Water isn't always free.", url: "https://www.ricksteves.com/travel-tips/money/tipping-in-europe", icon: Utensils, tag: "Dining" },
            { title: "Quiet Cars", desc: "Respect silence on trains.", url: "https://www.eurail.com/en/plan-your-trip/about-train-travel/train-types", icon: Siren, tag: "Manners" }
        ],
        clothing: {
            spring: { summary: "Unpredictable. Crisp mornings, rainy afternoons.", items: ["Trench Coat", "Leather Boots", "Scarf"] },
            summer: { summary: "Hot, especially South. Modest dress for churches.", items: ["Sundress/Chinos", "Walking Sandals", "Shoulder Cover"] },
            autumn: { summary: "Beautiful but cooling. Stylish layers.", items: ["Wool Blazer", "Dark Jeans", "Umbrella"] },
            winter: { summary: "Cold and damp. Smart wool coats preferred over sporty puffers in cities.", items: ["Wool Coat", "Gloves", "Thermal Socks"] }
        }
    },
    asia: {
        id: "asia",
        name: "Asia",
        tagline: "Diverse cultures, tropic heat, and bustling metropolises.",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop",
        insuranceTip: "Motorbike accidents are the #1 claim. Ensure your policy covers 'two-wheeled vehicles' if you plan to ride scooters.",
        insuranceTags: ["Motorbike Cover", "Food Poisoning", "Monsoon Delay"],
        emergency: { police: "Varies", ambulance: "Varies" },
        voltage: "220-240V",
        plugs: "Type A/C/G (Mixed)",
        plugType: "A / C / G",
        logistics: [
            { title: "Visa on Arrival", desc: "Check if your destination offers VOA or e-Visa.", url: "https://www.joinsherpa.com/", icon: ShieldCheck, tag: "Entry" },
            { title: "12Go Asia", desc: "Book trains, buses, and ferries across Asia.", url: "https://12go.asia/", icon: MapIcon, tag: "Transport" }
        ],
        apps: {
            ride: [{ name: "Grab", region: "SE Asia", url: "https://www.grab.com" }, { name: "Gojek", region: "Indonesia", url: "https://www.gojek.com" }, { name: "Kakao T", region: "Korea", url: "" }],
            connect: [{ name: "Airalo (Asialink)", type: "eSIM", url: "https://www.airalo.com/asia-esim" }, { name: "Line/WeChat", type: "Social", url: "" }],
            utility: [{ name: "Klook", desc: "Activities", url: "https://www.klook.com" }, { name: "Agoda", desc: "Hotels", url: "https://www.agoda.com" }]
        },
        finance: {
            tipping: "Generally NO tipping in Japan/China (can be offensive). Small tips appreciated in SE Asia.",
            cashStrategy: "Cash is essential. Street food, tuk-tuks, and local markets run on cash.",
            currencyTip: "Carry crisp USD bills for exchange in some countries (Cambodia/Laos/Myanmar).",
            coffeeIndex: "$2.00 - $4.50",
            mealIndex: "$3 (Street) - $20"
        },
        scams: [
            { title: "Tea House Scam", desc: "Friendly students invite you to tea, leave you with huge bill.", severity: "High" },
            { title: "Gem Scam", desc: "Tuk-tuk driver takes you to 'special' shop for fake gems.", severity: "High" }
        ],
        phrases: [
            { original: "Ni Hao", phonetic: "Nee How", meaning: "Hello (CH)" },
            { original: "Arigato", phonetic: "Ah-ree-gah-to", meaning: "Thanks (JP)" },
            { original: "Sawasdee", phonetic: "Sah-wah-dee", meaning: "Hello (TH)" }
        ],
        culture: [
            { title: "Temple Rules", desc: "Remove shoes. Cover shoulders/knees.", url: "https://www.gettingstamped.com/temple-etiquette-thailand/", icon: Building2, tag: "Respect" },
            { title: "The 'Wai' / Bow", desc: "Learn the local greeting gesture.", url: "https://theculturetrip.com/asia/thailand/articles/how-to-wai-properly-in-thailand", icon: HandHeart, tag: "Greeting" }
        ],
        clothing: {
            spring: { summary: "Warm but humid. Cherry blossom season in East Asia.", items: ["Light Cardigan", "Comfortable Sneakers"] },
            summer: { summary: "Intense heat and Monsoon rain. Quick-dry everything.", items: ["Moisture-wicking Tee", "Quick-dry Shorts", "Poncho"] },
            autumn: { summary: "Pleasant and dry. Best travel season.", items: ["Light Jacket", "Jeans", "T-shirts"] },
            winter: { summary: "Freezing in North/East, Perfect in South.", items: ["Down Jacket (North)", "Swimwear (South)"] }
        }
    },
    africa: {
        id: "africa",
        name: "Africa",
        tagline: "Vast landscapes, safaris, and vibrant traditions.",
        image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2072&auto=format&fit=crop",
        insuranceTip: "Medical Evacuation ('Medevac') coverage is CRITICAL for safaris or remote travel. Check specific 'Adventure Sports' coverage.",
        insuranceTags: ["Medevac", "Safari", "Gear Protection"],
        emergency: { police: "10111 (SA)", ambulance: "10177 (SA)" },
        voltage: "220-240V",
        plugs: "Type D/G/M",
        plugType: "D / G / M",
        logistics: [
            { title: "Yellow Fever Card", desc: "Mandatory for entry in many countries.", url: "https://www.who.int/health-topics/yellow-fever", icon: AlertTriangle, tag: "Health" },
            { title: "SafariBookings", desc: "Compare tours and operators.", url: "https://www.safaribookings.com/", icon: MapIcon, tag: "Planning" }
        ],
        apps: {
            ride: [{ name: "Uber", region: "Cities", url: "https://uber.com" }, { name: "Bolt", region: "South/West", url: "https://bolt.eu" }],
            connect: [{ name: "Airalo", type: "eSIM", url: "https://www.airalo.com/africa-esim" }, { name: "WhatsApp", type: "Dominant", url: "https://whatsapp.com" }],
            utility: [{ name: "Safaricom", desc: "M-Pesa (Kenya)", url: "https://www.safaricom.co.ke/" }, { name: "XE", desc: "Rates", url: "https://xe.com" }]
        },
        finance: {
            tipping: "Safari guides expect tips (USD preferred). Restaurants ~10%.",
            cashStrategy: "Cash (USD/EUR clean notes 2009+) allows better exchange rates.",
            currencyTip: "ATMs can be scarce outside cities. Plan withdrawals.",
            coffeeIndex: "$1.50 - $3.00",
            mealIndex: "$5 - $15"
        },
        scams: [
            { title: "Fake Guides", desc: "Locals posing as guides at monuments.", severity: "Medium" },
            { title: "Police Bribes", desc: "Fake fines for made-up traffic violations.", severity: "High" }
        ],
        phrases: [
            { original: "Jambo", phonetic: "Jahm-bo", meaning: "Hello (Swahili)" },
            { original: "Shukran", phonetic: "Shook-ran", meaning: "Thanks (Arabic)" },
            { original: "Sawubona", phonetic: "Sah-woo-boh-nah", meaning: "Hello (Zulu)" }
        ],
        culture: [
            { title: "Handshake", desc: "Prolonged handshakes are common and friendly.", url: "https://culturalatlas.sbs.com.au/", icon: HandHeart, tag: "Social" },
            { title: "Photo Etiquette", desc: "Always ask permission before photographing people.", url: "", icon: Siren, tag: "Respect" }
        ],
        clothing: {
            spring: { summary: "Shoulder season. Pleasant days.", items: ["Light Layers", "Dust-proof footwear"] },
            summer: { summary: "Extremely hot in North/Sahara. Cool in South (their winter).", items: ["Sun Hat", "Linen Trousers", "Safari Khakis"] },
            autumn: { summary: "Great for wildlife viewing.", items: ["Neutral Colors", "Fleece for mornings"] },
            winter: { summary: "Warm days, chilly desert nights.", items: ["Warm Fleece", "Beanie (Desert nights)", "Windbreaker"] }
        }
    },
    north_america: {
        id: "north_america",
        name: "North America",
        tagline: "Road trips, skyscrapers, and national parks.",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2089&auto=format&fit=crop",
        insuranceTip: "US healthcare is incredibly expensive. Unlimited medical coverage is highly recommended.",
        insuranceTags: ["High Medical Limit", "Rental Car Excess", "Liability"],
        emergency: { police: "911", ambulance: "911" },
        voltage: "120V",
        plugs: "Type A / B",
        plugType: "A / B",
        logistics: [
            { title: "ESTA (USA)", desc: "Apply at least 72h before flight.", url: "https://esta.cbp.dhs.gov/", icon: ShieldCheck, tag: "Visa Waiver" },
            { title: "eTA (Canada)", desc: "Required for visa-exempt flyers.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html", icon: ShieldCheck, tag: "Visa Waiver" }
        ],
        apps: {
            ride: [{ name: "Uber / Lyft", region: "Everywhere", url: "https://uber.com" }],
            connect: [{ name: "T-Mobile", type: "Tourist Sim", url: "https://www.t-mobile.com/" }],
            utility: [{ name: "Yelp", desc: "Food", url: "https://yelp.com" }, { name: "Google Maps", desc: "Essential", url: "https://maps.google.com" }]
        },
        finance: {
            tipping: "Mandatory. 18-22% is standard. $1-2 per drink at bars.",
            cashStrategy: "Card is accepted 99% of places. Cash only needed for small tips.",
            currencyTip: "Sales tax is added at checkout (not in price tag).",
            coffeeIndex: "$4.00 - $6.50",
            mealIndex: "$15 - $40"
        },
        scams: [
            { title: "Timeshare Sales", desc: "Free gifts in exchange for high-pressure sales pitch.", severity: "Medium" },
            { title: "CD Bullying", desc: "Musicians forcing CDs into your hand then demanding money.", severity: "Low" }
        ],
        phrases: [
            { original: "How ya doin?", phonetic: "How-yuh-do-in", meaning: "Hello" },
            { original: "Cheers", phonetic: "Cheers", meaning: "Thanks/Bye" },
            { original: "Restroom", phonetic: "Rest-room", meaning: "Toilet" }
        ],
        culture: [
            { title: "Small Talk", desc: "Friendly chat with strangers is normal.", url: "", icon: Languages, tag: "Social" },
            { title: "Personal Space", desc: "Keep an arm's length distance.", url: "", icon: HandHeart, tag: "Norms" }
        ],
        clothing: {
            spring: { summary: "Rainy and mild.", items: ["Rain Shell", "Hoodie", "Jeans"] },
            summer: { summary: "Hot and humid (East) or Dry (West).", items: ["T-shirt", "Shorts", "Cap"] },
            autumn: { summary: "Crisp air, foliage.", items: ["Flannel Shirt", "Denim Jacket", "Boots"] },
            winter: { summary: "Freezing in North/Canada.", items: ["Parka", "Thermal Underwear", "Snow Boots"] }
        }
    },
    south_america: {
        id: "south_america",
        name: "South America",
        tagline: "Andes mountains, rainforests, and carnival spirit.",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop",
        insuranceTip: "Altitude sickness coverage is needed for Peru/Bolivia/Andes. Check for 'High Altitude' exclusions.",
        insuranceTags: ["High Altitude", "Delay/Strike", "Theft"],
        emergency: { police: "190 (Br) / 101", ambulance: "192 (Br) / 107" },
        voltage: "127/220V (Mixed)",
        plugs: "Type A/C/N (Brazil special)",
        plugType: "A / C / N",
        logistics: [
            { title: "Yellow Fever", desc: "Certificate often required for jungle areas.", url: "https://www.who.int/health-topics/yellow-fever", icon: AlertTriangle, tag: "Health" },
            { title: "Busbud", desc: "Reliable intercity bus booking.", url: "https://www.busbud.com/", icon: MapIcon, tag: "Transport" }
        ],
        apps: {
            ride: [{ name: "Cabify", region: "Widespread", url: "https://cabify.com" }, { name: "Uber", region: "Major Cities", url: "https://uber.com" }],
            connect: [{ name: "WhatsApp", type: "Essential", url: "https://whatsapp.com" }],
            utility: [{ name: "Rappi", desc: "Delivery", url: "https://www.rappi.com/" }, { name: "Google Translate", desc: "Offline ES", url: "https://translate.google.com" }]
        },
        finance: {
            tipping: "10% 'servicio' often included. Add 5-10% extra for good service.",
            cashStrategy: "Carry small bills. ATMs can be unreliable in remote areas.",
            currencyTip: "Watch out for dynamic currency conversion ATMs.",
            coffeeIndex: "$2.00 - $4.00",
            mealIndex: "$8 - $20"
        },
        scams: [
            { title: "Mustard Scam", desc: "Stranger spills sauce on you, accomplice steals bag while 'cleaning'.", severity: "High" },
            { title: "Fake Taxi", desc: "Unmarked cars picking up tourists. Use apps.", severity: "High" }
        ],
        phrases: [
            { original: "Hola", phonetic: "Oh-lah", meaning: "Hello (ES)" },
            { original: "Oi", phonetic: "Oy", meaning: "Hi (PT)" },
            { original: "Gracias", phonetic: "Grah-syas", meaning: "Thanks" }
        ],
        culture: [
            { title: "Greeting Kiss", desc: "Cheek kiss is common greeting.", url: "", icon: HandHeart, tag: "Social" },
            { title: "Dinner Time", desc: "Late dining (9-10pm) is normal.", url: "", icon: Utensils, tag: "Food" }
        ],
        clothing: {
            spring: { summary: "Mild. Good for hiking.", items: ["Hiking Pants", "Light Fleece"] },
            summer: { summary: "Hot and humid.", items: ["Light Cotton", "Sun Protection", "Insect Shield"] },
            autumn: { summary: "Cooling down.", items: ["Light Jacket", "Long Sleeves"] },
            winter: { summary: "Cold in South (Patagonia).", items: ["Down Jacket", "Waterproof Pants", "Hiking Boots"] }
        }
    },
    oceania: {
        id: "oceania",
        name: "Oceania",
        tagline: "Beaches, reefs, and outback adventures.",
        image: "https://images.unsplash.com/photo-1523482580672-01e6f063f9c5?q=80&w=2080&auto=format&fit=crop",
        insuranceTip: "Adventure insurance strongly advised for diving, surfing, or extreme sports.",
        insuranceTags: ["Scuba/Surf", "Car Rental", "Sun/Heat"],
        emergency: { police: "000 (Aus)", ambulance: "000 (Aus)" },
        voltage: "230V",
        plugs: "Type I (Angled)",
        plugType: "Type I",
        logistics: [
            { title: "Nassau Visa (NZ)", desc: "NZeTA required for many.", url: "https://nzeta.immigration.govt.nz/", icon: ShieldCheck, tag: "Entry" },
            { title: "Bio-Security", desc: "Strict rules on food imports. Declare everything.", url: "https://www.abf.gov.au/entering-and-leaving-australia/can-you-bring-it-in", icon: AlertTriangle, tag: "Customs" }
        ],
        apps: {
            ride: [{ name: "Uber", region: "Cities", url: "https://uber.com" }, { name: "Didi", region: "Australia", url: "https://web.didiglobal.com/" }],
            connect: [{ name: "Telstra", type: "Best Coverage", url: "https://www.telstra.com.au" }],
            utility: [{ name: "WikiCamps", desc: "Camping", url: "https://www.wikicamps.com.au/" }]
        },
        finance: {
            tipping: "Not expected. Salaries are high. Rounding up is polite.",
            cashStrategy: "Card tap-to-pay is everywhere. Cash rarely needed in cities.",
            currencyTip: "Surcharges for card payments are common on weekends/holidays.",
            coffeeIndex: "$4.50 - $6.00",
            mealIndex: "$18 - $40"
        },
        scams: [
            { title: "Bar Tab Spike", desc: "Extra drinks added to bill in busy nightlife spots.", severity: "Low" },
            { title: "Taxi Meters", desc: "'Forgetting' to turn on meter. Always ask.", severity: "Low" }
        ],
        phrases: [
            { original: "G'day", phonetic: "Guh-day", meaning: "Hello" },
            { original: "Ta", phonetic: "Tah", meaning: "Thanks" },
            { original: "No worries", phonetic: "No wuh-rees", meaning: "You're welcome" }
        ],
        culture: [
            { title: "Front Seat", desc: "Sit in front seat of taxis.", url: "", icon: Car, tag: "Social" },
            { title: "Sun Safety", desc: "Slip, Slop, Slap. UV is extreme.", url: "https://www.cancer.org.au/cancer-information/causes-and-prevention/sun-safety", icon: Sun, tag: "Health" }
        ],
        clothing: {
            spring: { summary: "Warm days, cool nights.", items: ["T-shirt", "Light Sweater"] },
            summer: { summary: "Very hot UV. Sun protection is vital.", items: ["Rash Guard", "Broad Hat", "SPF 50+"] },
            autumn: { summary: "Mild and pleasant.", items: ["Jeans", "Long Sleeve Tee"] },
            winter: { summary: "Mild winters (rarely freezes).", items: ["Hoodie", "Windbreaker"] }
        }
    }
};

const SEASONS: { id: Season; label: string; icon: any }[] = [
    { id: "spring", label: "Spring", icon: CloudRain },
    { id: "summer", label: "Summer", icon: Sun },
    { id: "autumn", label: "Autumn", icon: Wind },
    { id: "winter", label: "Winter", icon: Snowflake },
];

// --- Components ---

export default function ResourcesClient() {
    const [selectedRegion, setSelectedRegion] = React.useState<RegionId>("global");
    const [selectedSeason, setSelectedSeason] = React.useState<Season>("spring");

    const data = REGIONS[selectedRegion];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* --- Hero / Region Select --- */}
            <div className="bg-slate-900 pt-24 pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={data.image}
                        alt={data.name}
                        fill
                        className="object-cover opacity-20 blur-sm scale-110 transition-all duration-1000 ease-in-out"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/80 to-slate-950" />
                </div>

                <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-3 text-blue-400 font-bold tracking-widest uppercase text-xs mb-3">
                                <Globe className="h-4 w-4" />
                                Traveler Intelligence Hub
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                Know Before You Go
                            </h1>
                            <p className="text-slate-400 max-w-xl text-lg">
                                Interactive guides on logistics, etiquette, insurance, and survival kits—tailored to your destination.
                            </p>
                        </div>

                        {/* Region Selector */}
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                                Select Destination Region
                            </label>
                            <Select
                                value={selectedRegion}
                                onValueChange={(val) => setSelectedRegion(val as RegionId)}
                            >
                                <SelectTrigger className="w-full md:w-[280px] h-12 bg-white/10 border-white/10 text-white backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors focus:ring-blue-500 font-medium">
                                    <SelectValue placeholder="Select Region" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(REGIONS).map((r) => (
                                        <SelectItem key={r.id} value={r.id} className="cursor-pointer">
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="container mx-auto px-6 -mt-20 relative z-20 max-w-6xl">

                {/* Region Intro Card */}
                <motion.div
                    key={selectedRegion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 mb-10 overflow-hidden relative"
                >
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <Image src={data.image} alt="" fill className="object-cover grayscale" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 shrink-0 relative">
                            <Image src={data.image} alt={data.name} fill className="object-cover" />
                        </div>
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{data.name}</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{data.tagline}</p>
                        </div>
                        <div className="md:ml-auto flex flex-wrap justify-center gap-3">
                            <Badge variant="outline" className="h-9 px-3 text-sm border-blue-200 text-blue-700 bg-blue-50">
                                <Siren className="h-3 w-3 mr-2" />
                                Police: {data.emergency.police}
                            </Badge>
                            <Badge variant="outline" className="h-9 px-3 text-sm border-rose-200 text-rose-700 bg-rose-50">
                                <BriefcaseMedical className="h-3 w-3 mr-2" />
                                EMS: {data.emergency.ambulance}
                            </Badge>
                            <Badge variant="outline" className="h-9 px-3 text-sm border-amber-200 text-amber-700 bg-amber-50">
                                <Plug className="h-3 w-3 mr-2" />
                                {data.plugs} ({data.voltage})
                            </Badge>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Practical Tools */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Regional Logistics (Re-added) */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="h-5 w-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Logistics & Entry</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {data.logistics.map((item, i) => (
                                    <ResourceActionCard key={i} item={item} />
                                ))}
                            </div>
                        </section>

                        {/* 2. Digital Survival Kit */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Smartphone className="h-5 w-5 text-purple-500" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Digital Survival Kit</h3>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <AppCard
                                    icon={Car}
                                    title="Move"
                                    apps={data.apps.ride}
                                    color="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                />
                                <AppCard
                                    icon={Wifi}
                                    title="Connect"
                                    apps={data.apps.connect.map(a => ({ name: a.name, region: a.type, url: a.url }))}
                                    color="bg-blue-500 text-white"
                                />
                                <AppCard
                                    icon={Utensils}
                                    title="Survive"
                                    apps={data.apps.utility.map(a => ({ name: a.name, region: a.desc, url: a.url }))}
                                    color="bg-emerald-500 text-white"
                                />
                            </div>
                        </section>

                        {/* 3. Insurance & Safety (Expanded) */}
                        <section className="grid sm:grid-cols-2 gap-6">
                            {/* Insurance Card */}
                            <Card className="border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm uppercase tracking-wider">
                                        <ShieldCheck className="h-4 w-4" />
                                        Insurance Intel
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Critical Coverage</h4>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                                        {data.insuranceTip}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.insuranceTags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-white dark:bg-slate-800 shadow-sm border border-rose-100 dark:border-rose-900/20 text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Scam Radar (NEW) */}
                            <Card className="border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-sm uppercase tracking-wider">
                                        <AlertOctagon className="h-4 w-4" />
                                        Scam Radar
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.scams.map((scam, i) => (
                                            <div key={i} className="relative pl-3 border-l-2 border-orange-300 dark:border-orange-700">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{scam.title}</h4>
                                                    <Badge className={cn("text-[10px] h-4 px-1", scam.severity === "High" ? "bg-red-500 hover:bg-red-500" : "bg-orange-400 hover:bg-orange-400")}>{scam.severity}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{scam.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* 4. Cultural & Finance */}
                        <section className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                {/* Pocket Lingo (NEW) */}
                                <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                                            <Mic className="h-4 w-4" />
                                            Pocket Lingo
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {data.phrases.map((phrase, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{phrase.original}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 italic">{phrase.phonetic}</div>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200">{phrase.meaning}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                                            <HandHeart className="h-4 w-4" />
                                            Tipping & Money
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                                            {data.finance.tipping}
                                        </p>

                                        {/* Coffee Index (NEW) */}
                                        <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-emerald-100 dark:border-emerald-900/20 mb-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                                <Coffee className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Coffee Index</div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{data.finance.coffeeIndex}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg text-xs text-slate-500 border border-emerald-100 dark:border-emerald-900/20">
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Pro Tip:</span> {data.finance.currencyTip}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                {data.culture.map((item, i) => (
                                    <Link href={item.url || "#"} key={i} target={item.url ? "_blank" : undefined} className={cn("block", item.url ? "cursor-pointer" : "cursor-default")}>
                                        <Card className="border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:shadow-md transition-all group">
                                            <div className="p-4 flex items-center gap-4">
                                                <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">{item.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                </div>
                                                {item.url && <ExternalLink className="ml-auto h-3 w-3 text-slate-300 group-hover:text-amber-500 transition-colors" />}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                                <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="p-4 flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <Landmark className="h-5 w-5 shrink-0 text-slate-400" />
                                        <span>{data.finance.cashStrategy}</span>
                                    </div>
                                </Card>

                                <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="p-4 flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <Zap className="h-5 w-5 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Power Sockets</span>
                                            <span>Types: {data.plugType} ({data.voltage})</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Interactive Wardrobe */}
                    <div className="lg:col-span-1">
                        <section className="sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <Shirt className="h-5 w-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Wardrobe Planner</h3>
                            </div>

                            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-lg">
                                <div className="p-1 bg-slate-100 dark:bg-slate-800 grid grid-cols-4 gap-1">
                                    {SEASONS.map((s) => {
                                        const Icon = s.icon;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedSeason(s.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center py-3 rounded-lg text-xs font-medium transition-all group",
                                                    selectedSeason === s.id
                                                        ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                )}
                                            >
                                                <Icon className={cn("h-4 w-4 mb-1 group-hover:scale-110 transition-transform", selectedSeason === s.id && "text-blue-500")} />
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <CardContent className="p-6">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${selectedRegion}-${selectedSeason}`}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2 capitalize flex items-center gap-2">
                                                {selectedSeason} Packing
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                                {data.clothing[selectedSeason].summary}
                                            </p>

                                            <div className="space-y-3">
                                                {data.clothing[selectedSeason].items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
                                                        <div className="h-2 w-2 rounded-full bg-blue-400" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <Link href="https://weather.com" target="_blank">
                                                    <Button variant="outline" className="w-full gap-2 text-xs h-9">
                                                        Check Weather Forecast <Globe className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- Sub-components ---

function AppCard({ icon: Icon, title, apps, color }: { icon: any; title: string; apps: { name: string, region: string, url?: string }[]; color: string }) {
    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 transition-colors">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3 shadow-md", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">{title}</h4>
            <div className="space-y-2">
                {apps.map((app, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        {app.url ? (
                            <Link href={app.url} target="_blank" className="font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 underline decoration-slate-300 hover:decoration-blue-600 transition-all">
                                {app.name}
                            </Link>
                        ) : (
                            <span className="font-medium text-slate-700 dark:text-slate-200">{app.name}</span>
                        )}
                        <span className="text-slate-400 truncate max-w-[80px]">{app.region}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResourceActionCard({ item }: { item: ResourceLink }) {
    if (!item.url || item.url === "#") {
        return (
            <div className="group relative flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 cursor-default">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded tracking-wide">{item.tag}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">{item.desc}</p>
                </div>
            </div>
        );
    }

    return (
        <Link href={item.url} target="_blank" className="group relative flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 cursor-pointer">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded tracking-wide">{item.tag}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">{item.desc}</p>
            </div>
            <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
        </Link>
    );
}
