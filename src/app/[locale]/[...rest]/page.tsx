import { notFound } from "next/navigation";

/** Unknown paths render this locale's styled not-found page instead of the default one. */
export default function UnknownPage() {
    notFound();
}
