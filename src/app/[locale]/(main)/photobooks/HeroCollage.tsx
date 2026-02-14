"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function HeroCollage() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse movement for parallax
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || window.innerWidth <= 1024) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl lg:perspective-1000 lg:cursor-crosshair bg-white dark:bg-slate-900/50"
        >
            <motion.div
                style={{
                    rotateX: x.get() === 0 ? 0 : rotateX,
                    rotateY: y.get() === 0 ? 0 : rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative aspect-[4/3] lg:aspect-square w-full scale-105 lg:scale-100"
            >
                <Image
                    src="/itinero_goods.png"
                    alt="Itinero Goods Collection"
                    fill
                    className="object-contain"
                    priority
                />

                {/* The "Workshop" Badge */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-4 right-4 lg:top-8 lg:right-8 w-16 h-16 lg:w-24 lg:h-24 flex lg:flex items-center justify-center opacity-40 lg:opacity-80 pointer-events-none"
                    style={{ z: 50 }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900/10 dark:fill-white/10 uppercase font-black text-[12px] lg:text-[10px] tracking-tighter">
                        <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                        <text className="font-mono">
                            <textPath href="#circlePath">
                                • ITINERO WORKSHOP • QUALITY GUARANTEED • ITINERO WORKSHOP •
                            </textPath>
                        </text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 lg:w-2 lg:h-2 rounded-full bg-blue-500/20" />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
