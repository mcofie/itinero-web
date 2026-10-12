import styles from "./LandingSkeleton.module.css";

/** Loading placeholder that mirrors the landing hero: heading, tagline, button and album cover. */
export default function LandingSkeleton() {
    return <div className={styles.page} role="status" aria-label="Loading Itinero">
        <header className={styles.header}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/itinero-mark-animated.svg" alt="" width={76} height={46} />
            <span aria-hidden className={`${styles.bone} ${styles.button}`} />
        </header>
        <div className={styles.copy} aria-hidden>
            <span className={`${styles.bone} ${styles.greeting}`} />
            <span className={`${styles.bone} ${styles.title}`} />
            <span className={`${styles.bone} ${styles.title}`} />
            <span className={`${styles.bone} ${styles.line}`} />
            <span className={`${styles.bone} ${styles.line}`} />
        </div>
        <div className={styles.action} aria-hidden>
            <span className={`${styles.bone} ${styles.button}`} />
            <span className={`${styles.bone} ${styles.note}`} />
        </div>
        <div className={styles.books} aria-hidden>
            <span className={`${styles.bone} ${styles.book} ${styles.side} ${styles.left}`} />
            <span className={`${styles.bone} ${styles.book}`} />
            <span className={`${styles.bone} ${styles.book} ${styles.side} ${styles.right}`} />
        </div>
    </div>;
}
