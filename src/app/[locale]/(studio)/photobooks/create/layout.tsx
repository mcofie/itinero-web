import * as React from "react";

export const metadata = {
    title: "Photobook Studio | Itinero",
    description: "Design and create your custom travel photobook",
};

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
