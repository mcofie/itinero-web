import type { CSSProperties } from "react";
import { BookOpen } from "lucide-react";
import styles from "./AlbumBuilder.module.css";

function Bone({ style, className = "" }: { style?: CSSProperties; className?: string }) {
    return <span aria-hidden className={`${styles.bone} ${className}`} style={style} />;
}

/** Placeholder for the cover step while the builder opens a saved or local album. */
export function AlbumWorkspaceSkeleton() {
    return <div className={styles.workGrid} role="status" aria-label="Opening your album">
        <section className={styles.controls}>
            <Bone style={{ width: 130, height: 22 }} />
            <Bone style={{ width: "68%", height: 54, marginTop: 12 }} />
            <Bone style={{ width: "52%", height: 14, marginTop: 16 }} />
            <Bone style={{ height: 48, marginTop: 30, borderRadius: 12 }} />
            <div className={styles.destinationGrid} style={{ overflow: "hidden" }}>
                {Array.from({ length: 12 }, (_, index) => <span key={index} className={styles.destinationCard}>
                    <Bone style={{ width: 38, height: 48, borderRadius: 4, flex: "none" }} />
                    <Bone style={{ width: `${45 + (index * 17) % 30}%`, height: 12 }} />
                </span>)}
            </div>
            <div className={styles.formPair}><Bone style={{ height: 48 }} /><Bone style={{ height: 48 }} /></div>
            <Bone style={{ width: "60%", height: 12, marginTop: 14 }} />
        </section>
        <aside className={styles.previewColumn} aria-hidden>
            <div className={styles.previewHeading}><Bone style={{ width: 84, height: 10 }} /><Bone style={{ width: 84, height: 10 }} /></div>
            <Bone className={styles.boneCover} />
            <Bone style={{ width: "55%", height: 16, margin: "22px auto 4px" }} />
        </aside>
    </div>;
}

/** Full-page placeholder for /make-album while the route loads. Mirrors the builder's layout. */
export default function AlbumBuilderSkeleton() {
    return <div className={styles.builder}>
        <header className={styles.header}>
            <span className={styles.brand}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/itinero-mark-animated.svg" alt="" /><span>itinero</span>
            </span>
            <Bone style={{ width: 150, height: 14 }} />
        </header>
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <span className={styles.eyebrow}>A place for your places</span>
                <h1>Make a little <em>room to remember.</em></h1>
                <p>Choose a cover, bring your photos, and we’ll shape the pages with you.</p>
                <div className={styles.steps}>
                    {["Cover", "Photos", "Pages", "Review"].map((label, index) => <div key={label} className={`${styles.step} ${index === 0 ? styles.stepActive : ""}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>
                    </div>)}
                </div>
                <div className={styles.sidebarFoot}><BookOpen size={19} /><span>Designed by you.<br />Laid out with a little help.</span></div>
            </aside>
            <main className={styles.workspace}>
                <div className={styles.workspaceTop}><span>STEP 01 / 04</span><span>Your story starts here</span></div>
                <AlbumWorkspaceSkeleton />
            </main>
        </div>
    </div>;
}
