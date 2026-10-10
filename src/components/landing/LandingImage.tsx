import type { CSSProperties } from "react";
import images from "@/lib/landing-images.json";

type LandingImageProps = {
    src: string;
    alt: string;
    sizes: string;
    className?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    eager?: boolean;
    prominent?: boolean;
    media?: "mobile" | "desktop";
};

const transparent = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

/** Pre-encoded, content-hashed images avoid cold image-optimizer requests. */
export default function LandingImage({ src, alt, sizes, className, width, height, fill, eager, prominent, media }: LandingImageProps) {
    const image = images[src as keyof typeof images];
    const fillStyle: CSSProperties | undefined = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined;
    return <picture>
        {media && <source media={media === "mobile" ? "(min-width: 901px)" : "(max-width: 900px)"} srcSet={transparent} />}
        {/* Native picture is intentional: source sets are generated at build time,
            and the media source prevents downloads for the hidden hero layout. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} srcSet={image.srcSet} sizes={sizes} alt={alt}
            width={width ?? image.width} height={height ?? image.height}
            className={className} style={fillStyle} loading={eager ? "eager" : "lazy"}
            fetchPriority={prominent ? "high" : "auto"} decoding="async" draggable={false} />
    </picture>;
}
