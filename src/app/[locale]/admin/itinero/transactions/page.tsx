import { createClientServerRSC } from "@/lib/supabase/server";
import PaymentHistoryClient, { Transaction } from "./PaymentHistoryClient";

export const dynamic = "force-dynamic";

export default async function PaymentHistoryPage() {
    const sb = await createClientServerRSC();

    // Fetch transactions
    const { data: transactions, error } = await sb
        .schema("itinero")
        .from("points_ledger")
        .select(`
            id,
            created_at,
            ref_id,
            delta,
            meta,
            user_id
        `)
        .eq("ref_type", "paystack")
        .order("created_at", { ascending: false }) as { data: any[], error: any };

    if (error) {
        console.error("Error fetching transactions:", error);
    }

    // Fetch user profiles to display names
    // Note: Profiles table might not have email, so we just use full_name.
    // If you need emails, you'd need the Service Role to query auth.users, 
    // or rely on a view that joins them. Assuming profiles has full_name here.
    const userIds = Array.from(new Set(transactions?.map((t: any) => t.user_id) || [])) as string[];
    const usersMap: Record<string, { email: string | null; full_name: string | null; avatarUrl?: string | null }> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await sb
            .schema("itinero")
            .from("profiles")
            .select("id, full_name, username, avatar_url") // Assuming no email in profiles
            .in("id", userIds);

        profiles?.forEach((p: any) => {
            // Fallback: use username if full_name is missing
            usersMap[p.id] = {
                email: p.username ? `@${p.username}` : "—",
                full_name: p.full_name,
                avatarUrl: p.avatar_url
            };
        });
    }

    const rows: Transaction[] = transactions?.map((t: any) => ({
        id: t.id,
        created_at: t.created_at,
        delta: t.delta,
        ref_id: t.ref_id,
        meta: t.meta,
        user: usersMap[t.user_id] || { email: "Unknown", full_name: "Unknown User", avatarUrl: null }
    })) || [];

    return <PaymentHistoryClient transactions={rows} />;
}
