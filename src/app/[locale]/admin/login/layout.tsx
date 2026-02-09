import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Login",
    description: "Sign in to Itinero Admin Dashboard.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
