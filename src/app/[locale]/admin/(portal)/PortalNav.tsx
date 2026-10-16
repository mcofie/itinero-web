"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LINKS = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/discounts", label: "Discounts" },
    { href: "/admin/settings", label: "Settings" },
] as const;

export default function PortalNav() {
    const pathname = usePathname();
    return <nav className="flex items-center gap-3 overflow-x-auto sm:gap-6" aria-label="Admin">
        {LINKS.map(link => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                className={cn("whitespace-nowrap py-1 font-[family-name:var(--font-album-serif)] text-[15px] underline decoration-2 underline-offset-[7px] transition sm:text-[17px]",
                    active ? "text-[#2b1a07] decoration-[#ed7936]" : "text-[#7a6b5c] decoration-transparent hover:text-[#2b1a07] hover:decoration-[#ed7936]/50")}>
                {link.label}
            </Link>;
        })}
    </nav>;
}
