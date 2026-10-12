"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LINKS = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/discounts", label: "Discounts" },
] as const;

export default function PortalNav() {
    const pathname = usePathname();
    return <nav className="flex items-center gap-1" aria-label="Admin">
        {LINKS.map(link => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition", active ? "bg-[#f0e5d7] text-[#2b1a07]" : "text-[#7a6b5c] hover:text-[#2b1a07]")}>
                {link.label}
            </Link>;
        })}
    </nav>;
}
