import { redirect } from "next/navigation";

/** The old sign-in page. Everyone signs in on /album-login now; keep where they were heading and any error. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const query = await searchParams;
    const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
    const params = new URLSearchParams();
    const next = first(query.next) || first(query.redirect);
    if (next.startsWith("/") && !next.startsWith("//")) params.set("next", next);
    if (first(query.error)) params.set("error", first(query.error));
    const search = params.toString();
    redirect(`/album-login${search ? `?${search}` : ""}`);
}
