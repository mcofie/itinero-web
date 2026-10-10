import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Make your album",
    robots: { index: false, follow: false },
};

export default function MakeAlbumPage() {
    return <main style={{ minHeight: "100dvh", background: "#fdfbf9" }} />;
}
