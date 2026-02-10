
import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PaymentHistoryClient, { Transaction } from "./PaymentHistoryClient";

export const dynamic = "force-dynamic";

export default async function PaymentHistoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; size?: string }>;
}) {
    const { page: pageStr, size: sizeStr } = await searchParams;
    const page = Math.max(1, parseInt(pageStr || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(sizeStr || "20")));
    const offset = (page - 1) * pageSize;

    const sb = await createClientServerRSC();
    const adminSb = createAdminClient();
    const fetchClient = adminSb || sb;

    // Fetch transactions with pagination
    const { data: transactions, count, error } = await fetchClient
        .schema("itinero")
        .from("points_ledger")
        .select(`
            id,
            created_at,
            ref_id,
            delta,
            meta,
            user_id
        `, { count: "exact" })
        .eq("ref_type", "paystack")
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error) {
        console.error("Error fetching transactions:", error);
    }

    const userIds = Array.from(new Set(transactions?.map((t: any) => t.user_id) || [])) as string[];
    const usersMap: Record<string, { email: string | null; full_name: string | null; avatarUrl?: string | null }> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await fetchClient
            .schema("itinero")
            .from("profiles")
            .select("id, full_name, username, avatar_url")
            .in("id", userIds);

        profiles?.forEach((p: any) => {
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

    return (
        <PaymentHistoryClient
            transactions={rows}
            totalCount={count || 0}
            currentPage={page}
            pageSize={pageSize}
        />
    );
}
