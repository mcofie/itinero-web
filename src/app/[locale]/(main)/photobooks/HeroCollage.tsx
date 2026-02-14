"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Image as ImageIcon } from "lucide-react";

export default function HeroCollage() {
    return (
        <div className="relative hidden lg:flex items-center justify-center h-[500px]">
            <div className="relative w-full h-full max-w-[500px]">
                {/* Main Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-96 z-20 rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white dark:ring-slate-900 rotate-[-4deg]"
                >
                    <Image src="/collage_image_1.png" alt="Travel 1" fill className="object-cover" />
                </motion.div>

                {/* Accent 1 */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 15 }}
                    animate={{ opacity: 1, x: 0, rotate: 8 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="absolute top-[10%] right-[5%] w-48 h-64 z-10 rounded-[1.5rem] overflow-hidden shadow-xl ring-4 ring-white dark:ring-slate-900"
                >
                    <Image src="/collage_image_2.png" alt="Travel 2" fill className="object-cover" />
                </motion.div>

                {/* Accent 2 */}
                <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -15 }}
                    animate={{ opacity: 1, x: 0, rotate: -12 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="absolute bottom-[10%] left-[5%] w-56 h-40 z-10 rounded-[1.5rem] overflow-hidden shadow-xl ring-4 ring-white dark:ring-slate-900"
                >
                    <Image src="/collage_image_3.png" alt="Travel 3" fill className="object-cover" />
                </motion.div>

                {/* Floating Icons/Decorations */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[10%] p-4 rounded-2xl bg-white shadow-lg z-30 dark:bg-slate-800"
                >
                    <Sparkles className="h-6 w-6 text-amber-500" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] right-[15%] p-4 rounded-2xl bg-blue-600 shadow-lg z-30 text-white"
                >
                    <ImageIcon className="h-6 w-6" />
                </motion.div>
            </div>
        </div>
    );
}
