import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Orders admin sign in",
    description: "Sign in to the Itinero orders admin.",
    robots: { index: false, follow: false },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
