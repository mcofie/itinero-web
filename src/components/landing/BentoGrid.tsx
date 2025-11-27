"use client";

import { motion } from "framer-motion";
import { Users2, FileText, Wallet, Share2, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Crowdsourced Intelligence",
        description: "Get real-time tips and hidden gems from a community of verified travelers.",
        icon: Users2,
        className: "md:col-span-2",
        image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1000&auto=format&fit=crop",
    },
    {
        title: "Visa-Ready Exports",
        description: "Generate official PDF itineraries for visa applications in seconds.",
        icon: FileText,
        className: "md:col-span-1",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop",
    },
    {
        title: "Smart Budgeting",
        description: "Track expenses and get daily estimates based on local pricing.",
        icon: Wallet,
        className: "md:col-span-1",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop",
    },
    {
        title: "Seamless Collaboration",
        description: "Invite friends to plan together. Real-time sync across all devices.",
        icon: Share2,
        className: "md:col-span-2",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop",
    },
];

export function BentoGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-6">
            {features.map((feature, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                        "group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm min-h-[300px] flex flex-col justify-end p-6",
                        feature.className
                    )}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={feature.image}
                            alt={feature.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
                            <feature.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
