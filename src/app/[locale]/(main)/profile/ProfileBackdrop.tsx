"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
    "#3b82f6", // blue-500
    "#06b6d4", // cyan-500
    "#8b5cf6", // violet-500
    "#6366f1", // indigo-500
    "#ec4899", // pink-500
    "#10b981", // emerald-500 (accent)
];

type Shape = {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    rotation: number;
    delay: number;
    duration: number;
    borderRadius: string;
};

export function ProfileBackdrop() {
    const [shapes, setShapes] = useState<Shape[]>([]);

    useEffect(() => {
        // Generate random shapes on mount
        const newShapes: Shape[] = Array.from({ length: 15 }).map((_, i) => {
            // Generate random blobby border radius
            const r1 = Math.floor(Math.random() * 40) + 30; // 30-70%
            const r2 = Math.floor(Math.random() * 40) + 30;
            const r3 = Math.floor(Math.random() * 40) + 30;
            const r4 = Math.floor(Math.random() * 40) + 30;
            const borderRadius = `${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${r4}% ${100 - r4}% ${100 - r3}%`;

            return {
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 180 + 60,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rotation: Math.random() * 360,
                delay: Math.random() * 2,
                duration: Math.random() * 15 + 15, // Slower, more graceful
                borderRadius,
            };
        });
        setShapes(newShapes);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Base gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-black/40 dark:via-transparent dark:to-transparent z-10" />

            {shapes.map((shape) => (
                <motion.div
                    key={shape.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 0.5, 0.3],
                        scale: [0.8, 1.3, 0.9],
                        x: [0, Math.random() * 40 - 20, 0],
                        y: [0, Math.random() * 40 - 20, 0],
                        rotate: [shape.rotation, shape.rotation + 90, shape.rotation],
                        borderRadius: [
                            shape.borderRadius,
                            "50% 50% 50% 50% / 50% 50% 50% 50%", // Morph to circle
                            shape.borderRadius,
                        ],
                    }}
                    transition={{
                        duration: shape.duration,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: shape.delay,
                    }}
                    style={{
                        position: "absolute",
                        left: `${shape.x}%`,
                        top: `${shape.y}%`,
                        width: shape.size,
                        height: shape.size,
                        backgroundColor: shape.color,
                        filter: "blur(50px)",
                        transform: "translate(-50%, -50%)",
                        mixBlendMode: "multiply", // Interesting color blending
                    }}
                    className="opacity-40 dark:opacity-30 dark:mix-blend-screen" // Screen blend mode for dark mode
                />
            ))}
        </div>
    );
}
