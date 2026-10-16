import Link from "next/link";
import AlbumMessage from "@/components/album/AlbumMessage";
import ui from "@/components/album/album-ui.module.css";

export default function NotFoundPage() {
    return <AlbumMessage note="hmm, nothing here" title="We couldn’t find that page"
        actions={<><Link href="/" className={ui.button}>Back to Itinero</Link><Link href="/make-album" className={ui.link}>Make an album</Link></>}>
        The link may be old, or the page has moved.
    </AlbumMessage>;
}
