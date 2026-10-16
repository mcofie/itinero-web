"use client";

import Link from "next/link";
import { useEffect } from "react";
import AlbumMessage from "@/components/album/AlbumMessage";
import ui from "@/components/album/album-ui.module.css";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => { console.error("Page error:", error); }, [error]);
    return <AlbumMessage note="oops" title="Something went wrong"
        actions={<><button type="button" onClick={() => reset()} className={ui.button}>Try again</button><Link href="/" className={ui.link}>Back to Itinero</Link></>}>
        We couldn’t load this page. Please try again in a moment.
        {error.digest && <span className="mt-2 block text-xs text-[#a89a8a]">Reference {error.digest}</span>}
    </AlbumMessage>;
}
