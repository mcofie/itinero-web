"use client";

import NextDynamic from "next/dynamic";

// Dynamically load the client-only DatePicker
const HeroDatePicker = NextDynamic(
    () => import("@/components/landing/DatePicker"),
    { ssr: false }
);

export default function HeroDatePickerClient() {
    return <HeroDatePicker />;
}