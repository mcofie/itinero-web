// app/not-found.tsx OR app/_not-found/page.tsx (depending on your structure)
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation"; // if you need it

export default function NotFoundPage() {
    // const router = useRouter();

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl font-semibold mb-4">Page not found</h1>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                The page you’re looking for doesn’t exist or has been moved.
            </p>

            <Button asChild>
                <Link href="/">Go back home</Link>
            </Button>
        </main>
    );
}