"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Digital Nomad",
        text: "Itinero completely changed how I plan my work-cations. The visa export feature alone is worth it.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
        name: "Marcus Chen",
        role: "Adventure Photographer",
        text: "Finding hidden spots for my shoots has never been easier. The community suggestions are gold.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
        name: "Elena Rodriguez",
        role: "Travel Blogger",
        text: "I use Itinero to draft all my blog itineraries. It's intuitive, fast, and the PDFs look professional.",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    },
    {
        name: "David Kim",
        role: "Backpacker",
        text: "Budgeting was always my nightmare. Itinero made it simple to track costs in multiple currencies.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
        name: "Priya Patel",
        role: "Family Traveler",
        text: "Planning for a family of four is chaos. This app brought sanity back to our holidays.",
        avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
    },
];

export function Testimonials() {
    return (
        <div className="relative overflow-hidden py-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex gap-6 overflow-hidden">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex gap-6 min-w-full"
                >
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[350px] rounded-2xl border border-border bg-card p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className="h-10 w-10 rounded-full object-cover border border-border"
                                />
                                <div>
                                    <div className="font-semibold text-sm">{t.name}</div>
                                    <div className="text-xs text-muted-foreground">{t.role}</div>
                                </div>
                                <div className="ml-auto flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="h-3 w-3 fill-primary text-primary" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                &quot;{t.text}&quot;
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
