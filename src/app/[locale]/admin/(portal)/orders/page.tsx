import { Search } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ORDER_LIST_FIELDS, ORDER_TABS, orderQuery, parseOrderFilters, type OrderFilters } from "@/lib/admin-order-filters";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import OrdersTable, { type OrderListRow } from "./OrdersTable";

const PAGE_SIZE = 25;

function filterHref(filters: OrderFilters, changes: Partial<Record<"tab" | "q" | "from" | "to" | "sort" | "page", string>>) {
    const params = new URLSearchParams();
    const values = { tab: filters.tab.id, q: filters.q, from: filters.from, to: filters.to, sort: filters.sort === filters.tab.sort ? "" : filters.sort, page: "", ...changes };
    for (const [key, value] of Object.entries(values)) if (value && !(key === "page" && value === "1")) params.set(key, value);
    const query = params.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const filters = parseOrderFilters(await searchParams);
    const admin = createAdminClient();
    if (!admin) return <p className="mx-auto max-w-7xl p-6 text-sm">Order storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.</p>;

    const start = (filters.page - 1) * PAGE_SIZE;
    const [{ data: statusRows }, { data, count, error }] = await Promise.all([
        admin.schema("itinero").from("photobooks").select("status").not("status", "in", "(draft,quote_requested)"),
        orderQuery(admin, filters, ORDER_LIST_FIELDS, { count: "exact" }).range(start, start + PAGE_SIZE - 1),
    ]);
    const statusCounts = new Map<string, number>();
    for (const row of statusRows ?? []) statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
    const tabCount = (statuses: readonly string[]) => statuses.reduce((sum, status) => sum + (statusCounts.get(status) ?? 0), 0);
    const rows = (data ?? []) as unknown as OrderListRow[];
    const total = count ?? 0;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const exportParams = new URLSearchParams({ tab: filters.tab.id, ...(filters.q && { q: filters.q }), ...(filters.from && { from: filters.from }), ...(filters.to && { to: filters.to }), sort: filters.sort });

    return <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Order status">
            {ORDER_TABS.map(tab => {
                const active = tab.id === filters.tab.id;
                const tabTotal = tabCount(tab.statuses);
                return <Link key={tab.id} href={filterHref(filters, { tab: tab.id, sort: "", page: "" })} aria-current={active ? "page" : undefined}
                    className={cn("flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                        active ? "bg-[#2b1a07] text-white" : "text-[#6d5c4b] hover:bg-[#ece2d5]")}>
                    {tab.label}
                    {tabTotal > 0 && <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-white/20" : "bg-[#e7dccd]")}>{tabTotal}</span>}
                </Link>;
            })}
        </nav>

        <form className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#e4d9cb] bg-[#fdfbf8] p-3 lg:flex-row lg:items-end" action="/admin/orders">
            <input type="hidden" name="tab" value={filters.tab.id} />
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e2d6c7] bg-white px-3">
                <Search size={16} className="shrink-0 text-[#a89a8a]" />
                <input name="q" defaultValue={filters.q} placeholder="Order number, name, email, phone or Paystack reference" aria-label="Search orders" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a89a8a]" />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[auto_auto_auto_auto]">
                <label className="text-[11px] font-semibold text-[#8a7d70]">{filters.tab.id === "unpaid" ? "Started from" : "Paid from"}<input type="date" name="from" defaultValue={filters.from} className="mt-1 block h-10 w-full rounded-xl border border-[#e2d6c7] bg-white px-2 text-sm text-[#2b1a07]" /></label>
                <label className="text-[11px] font-semibold text-[#8a7d70]">to<input type="date" name="to" defaultValue={filters.to} className="mt-1 block h-10 w-full rounded-xl border border-[#e2d6c7] bg-white px-2 text-sm text-[#2b1a07]" /></label>
                <label className="text-[11px] font-semibold text-[#8a7d70]">Sort<select name="sort" defaultValue={filters.sort} className="mt-1 block h-10 w-full rounded-xl border border-[#e2d6c7] bg-white px-2 text-sm text-[#2b1a07]">
                    <option value="waiting">Waiting longest</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option>
                </select></label>
                <button className="h-10 self-end rounded-xl bg-[#2b1a07] px-5 text-sm font-bold text-white transition hover:bg-[#53330e]">Apply</button>
            </div>
        </form>
        {(filters.q || filters.from || filters.to) && <p className="mt-3 text-xs text-[#8a7d70]">{total} {total === 1 ? "order" : "orders"} match. <Link className="font-semibold text-[#a2602f]" href={filterHref(filters, { q: "", from: "", to: "", page: "" })}>Clear filters</Link></p>}

        {error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Could not load orders: {error.message}</p>
            : <OrdersTable rows={rows} exportAllHref={`/api/admin/orders/export?${exportParams}`} emptyLabel={filters.q || filters.from || filters.to ? "No orders match these filters." : `Nothing in “${filters.tab.label}” right now.`} />}

        {pages > 1 && <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pages">
            <span className="text-[#8a7d70]">Page {filters.page} of {pages} · {total} orders</span>
            <div className="flex gap-2">
                {filters.page > 1 && <Link href={filterHref(filters, { page: String(filters.page - 1) })} className="rounded-lg border border-[#e2d6c7] bg-[#fdfbf8] px-3 py-1.5 font-semibold">Previous</Link>}
                {filters.page < pages && <Link href={filterHref(filters, { page: String(filters.page + 1) })} className="rounded-lg border border-[#e2d6c7] bg-[#fdfbf8] px-3 py-1.5 font-semibold">Next</Link>}
            </div>
        </nav>}
    </main>;
}
