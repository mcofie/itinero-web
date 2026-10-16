import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { daysSince, formatOrderNumber, isOrderStatus, STALE_AFTER_DAYS, STATUS_INFO } from "@/lib/album-fulfilment";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { cn } from "@/lib/utils";
import ui from "@/components/album/album-ui.module.css";
import DailyChart, { type DailyPoint } from "./DailyChart";

const PERIODS = [7, 30, 90] as const;
const DAY = 86_400_000;
/** Paid orders that count as sales. Cancelled orders are left out. */
const SOLD = ["paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "delivered", "on_hold"];

type SaleRow = { status: string; paid_at: string; delivered_at: string | null; total_cost: number | null; discount_amount: number | null; discount_code: string | null; destination_id: string | null };
type OpenRow = { status: string; status_changed_at: string | null; paid_at: string | null; submitted_at: string | null; created_at: string };
type EventRow = { id: string; from_status: string | null; to_status: string | null; actor: string; created_at: string; photobook: { id: string; order_number: number | null; title: string } | null };

const money = (value: number) => `GHS ${value.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
const label = (status: string | null) => status && isOrderStatus(status) ? STATUS_INFO[status].label : status ?? "";

function summarise(rows: SaleRow[]) {
    const revenue = rows.reduce((sum, row) => sum + Number(row.total_cost ?? 0), 0);
    const discounts = rows.reduce((sum, row) => sum + Number(row.discount_amount ?? 0), 0);
    return { orders: rows.length, revenue, discounts, average: rows.length ? revenue / rows.length : 0 };
}

function Change({ current, previous, days, invert = false }: { current: number; previous: number; days: number; invert?: boolean }) {
    if (!previous && !current) return <span className="text-[#a89a8a]">No change vs previous {days} days</span>;
    if (!previous) return <span className="text-[#a89a8a]">None in previous {days} days</span>;
    const change = (current - previous) / previous * 100;
    const good = invert ? change < 0 : change > 0;
    return <span className={cn(Math.abs(change) < 0.5 ? "text-[#a89a8a]" : good ? "text-[#22603a]" : "text-[#a33a1a]")}>
        {change > 0 ? "▲" : change < 0 ? "▼" : "•"} {Math.abs(change).toFixed(0)}% vs previous {days} days
    </span>;
}

function Stat({ title, value, children }: { title: string; value: string; children?: React.ReactNode }) {
    return <div className={cn(ui.card, "p-5")}>
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">{title}</p>
        <p className="mt-2 font-[family-name:var(--font-album-serif)] text-[32px] leading-tight tracking-[-.02em] tabular-nums">{value}</p>
        <p className="mt-1.5 text-xs">{children}</p>
    </div>;
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const requested = Number((await searchParams).days);
    const days = PERIODS.find(period => period === requested) ?? 30;
    const admin = createAdminClient();
    if (!admin) return <p className="mx-auto max-w-7xl p-6 text-sm">Order storage is not configured.</p>;

    const now = Date.now();
    const todayStart = new Date(new Date(now).toISOString().slice(0, 10)).getTime();
    const start = todayStart - (days - 1) * DAY;
    const previousStart = start - days * DAY;

    const [sales, open, deliveredRows, recent] = await Promise.all([
        admin.schema("itinero").from("photobooks").select("status,paid_at,delivered_at,total_cost,discount_amount,discount_code,destination_id")
            .in("status", SOLD).gte("paid_at", new Date(previousStart).toISOString()),
        admin.schema("itinero").from("photobooks").select("status,status_changed_at,paid_at,submitted_at,created_at")
            .in("status", ["pending_payment", "paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "on_hold"]),
        admin.schema("itinero").from("photobooks").select("paid_at,delivered_at").eq("status", "delivered").gte("delivered_at", new Date(previousStart).toISOString()),
        admin.schema("itinero").from("photobook_order_events").select("id,from_status,to_status,actor,created_at,photobook:photobooks(id,order_number,title)")
            .eq("kind", "status").order("created_at", { ascending: false }).limit(8),
    ]);
    const loadError = sales.error ?? open.error ?? deliveredRows.error ?? recent.error;
    if (loadError) return <p className="mx-auto mt-8 max-w-7xl rounded-xl bg-red-50 p-4 text-sm text-red-700">Could not load the overview: {loadError.message}</p>;

    const saleRows = (sales.data ?? []) as SaleRow[];
    const current = saleRows.filter(row => new Date(row.paid_at).getTime() >= start);
    const previous = saleRows.filter(row => new Date(row.paid_at).getTime() < start);
    const now$ = summarise(current);
    const before$ = summarise(previous);

    const turnaround = (rows: { paid_at: string | null; delivered_at: string | null }[]) => {
        const spans = rows.filter(row => row.paid_at && row.delivered_at).map(row => (new Date(row.delivered_at!).getTime() - new Date(row.paid_at!).getTime()) / DAY);
        return spans.length ? spans.reduce((sum, span) => sum + span, 0) / spans.length : null;
    };
    const delivered = (deliveredRows.data ?? []) as { paid_at: string | null; delivered_at: string | null }[];
    const deliveredNow = delivered.filter(row => new Date(row.delivered_at!).getTime() >= start);
    const turnaroundNow = turnaround(deliveredNow);
    const turnaroundBefore = turnaround(delivered.filter(row => new Date(row.delivered_at!).getTime() < start));

    const points: DailyPoint[] = Array.from({ length: days }, (_, index) => ({ date: new Date(start + index * DAY).toISOString().slice(0, 10), orders: 0, revenue: 0 }));
    for (const row of current) {
        const point = points[Math.floor((new Date(row.paid_at).getTime() - start) / DAY)];
        if (point) { point.orders++; point.revenue += Number(row.total_cost ?? 0); }
    }

    // Work waiting on the admin right now.
    const openRows = (open.data ?? []) as OpenRow[];
    const countOf = (statuses: string[]) => openRows.filter(row => statuses.includes(row.status)).length;
    const overdue = openRows.filter(row => {
        const limit = isOrderStatus(row.status) ? STALE_AFTER_DAYS[row.status] : undefined;
        return limit !== undefined && daysSince(row.status_changed_at ?? row.paid_at ?? row.created_at, now) >= limit;
    }).length;
    const abandoned = openRows.filter(row => row.status === "pending_payment" && now - new Date(row.submitted_at ?? row.created_at).getTime() > DAY).length;
    const queue = [
        { label: "To do", detail: "New and in review", count: countOf(["paid", "in_review"]), tab: "todo" },
        { label: "Waiting on customer", detail: "Changes requested", count: countOf(["changes_requested"]), tab: "customer" },
        { label: "Printing", detail: "Printing and ready", count: countOf(["printing", "ready"]), tab: "printing" },
        { label: "Out for delivery", detail: "With a rider", count: countOf(["out_for_delivery"]), tab: "delivery" },
        { label: "On hold", detail: "Paused orders", count: countOf(["on_hold"]), tab: "on_hold" },
        { label: "Unpaid checkouts", detail: "Over a day without payment", count: abandoned, tab: "unpaid" },
    ];

    const tally = (key: (row: SaleRow) => string | null) => {
        const counts = new Map<string, number>();
        for (const row of current) { const value = key(row); if (value) counts.set(value, (counts.get(value) ?? 0) + 1); }
        return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    };
    const destinations = tally(row => row.destination_id);
    const codes = tally(row => row.discount_code);
    const events = (recent.data ?? []) as unknown as EventRow[];

    return <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className={cn(ui.hand, "-rotate-2 !text-[22px]")}>here’s how it’s going ⌄</p>
                <h1 className="mt-1 font-[family-name:var(--font-album-serif)] text-[40px] leading-tight tracking-[-.025em]">Overview</h1>
                <p className="mt-1 text-sm text-[#776b60]">Sales from paid orders, excluding cancellations. Days are in Accra time.</p>
            </div>
            <nav className="flex w-fit gap-1 rounded-[14px] border-2 border-[#493b2a] bg-[#fffcf9] p-1 font-[family-name:var(--font-album-serif)] text-[15px]" aria-label="Period">
                {PERIODS.map(period => <Link key={period} href={period === 30 ? "/admin" : `/admin?days=${period}`} aria-current={period === days ? "page" : undefined}
                    className={cn("rounded-[10px] px-3 py-1 transition", period === days ? "bg-[#fff2d8] text-[#2b1a07] shadow-[inset_0_0_0_1.5px_#493b2a]" : "text-[#6d5c4b] hover:bg-[#f6efe6]")}>{period} days</Link>)}
            </nav>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Key figures">
            <Stat title="Revenue" value={money(now$.revenue)}><Change current={now$.revenue} previous={before$.revenue} days={days} /></Stat>
            <Stat title="Orders" value={String(now$.orders)}><Change current={now$.orders} previous={before$.orders} days={days} /></Stat>
            <Stat title="Discounts given" value={money(now$.discounts)}><span className="text-[#8a7d70]">{now$.orders ? `${current.filter(row => Number(row.discount_amount) > 0).length} of ${now$.orders} orders used a code` : "No orders yet"}</span></Stat>
            <Stat title="Paid to delivered" value={turnaroundNow === null ? "—" : `${turnaroundNow.toFixed(1)} days`}>
                {turnaroundNow === null ? <span className="text-[#8a7d70]">No deliveries in this period</span>
                    : turnaroundBefore === null ? <span className="text-[#8a7d70]">{deliveredNow.length} delivered</span>
                    : <Change current={turnaroundNow} previous={turnaroundBefore} days={days} invert />}
            </Stat>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className={cn(ui.card, "p-5")}>
                <DailyChart points={points} />
            </section>

            <section className={cn(ui.card, "p-5")}>
                <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">Needs attention</h2>
                {overdue > 0 && <Link href="/admin/orders?tab=all&sort=waiting" className="mb-3 flex items-center gap-2 rounded-[10px] border-2 border-[#d4692c] bg-[#fff4ec] px-3 py-2.5 text-sm font-semibold text-[#9a4a17]">
                    <AlertTriangle size={16} /> {overdue} {overdue === 1 ? "order is" : "orders are"} overdue <ArrowRight size={14} className="ml-auto" />
                </Link>}
                <ul className="divide-y-2 divide-dashed divide-[#efe6dc]">
                    {queue.map(item => <li key={item.tab}>
                        <Link href={`/admin/orders?tab=${item.tab}`} className="flex items-center justify-between gap-3 py-2.5 text-sm transition hover:text-[#a2602f]">
                            <span><span className="block font-semibold">{item.label}</span><span className="block text-xs text-[#8a7d70]">{item.detail}</span></span>
                            <span className={cn("min-w-8 rounded-full px-2 py-0.5 text-center text-sm font-bold tabular-nums", item.count ? "bg-[#2b1a07] text-white" : "bg-[#efe8de] text-[#a89a8a]")}>{item.count}</span>
                        </Link>
                    </li>)}
                </ul>
            </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className={cn(ui.card, "p-5")}>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">Top destinations</h2>
                {destinations.length ? <ol className="space-y-3">
                    {destinations.map(([id, count]) => <li key={id} className="text-sm">
                        <div className="flex justify-between gap-3"><span>{Object.hasOwn(TRAVEL_COVERS_BY_ID, id) ? TRAVEL_COVERS_BY_ID[id as TravelCoverId].country : id}</span><span className="tabular-nums text-[#6d5c4b]">{count}</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-[#f0e8dd]"><div className="h-full rounded-full bg-[#ed7936]" style={{ width: `${count / destinations[0][1] * 100}%` }} /></div>
                    </li>)}
                </ol> : <p className="text-sm text-[#8a7d70]">No orders in this period.</p>}
            </section>

            <section className={cn(ui.card, "p-5")}>
                <div className="mb-4 flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">Discount codes used</h2><Link href="/admin/discounts" className={cn(ui.link, "font-[family-name:var(--font-album-serif)] text-sm")}>Manage</Link></div>
                {codes.length ? <ul className="space-y-2 text-sm">
                    {codes.map(([code, count]) => <li key={code} className="flex justify-between gap-3"><span className="font-mono text-[13px]">{code}</span><span className="tabular-nums text-[#6d5c4b]">{count} {count === 1 ? "order" : "orders"}</span></li>)}
                </ul> : <p className="text-sm text-[#8a7d70]">No codes used in this period.</p>}
                <p className="mt-4 border-t-2 border-dashed border-[#efe6dc] pt-3 text-xs text-[#8a7d70]">Average order: <strong className="text-[#2b1a07]">{now$.orders ? money(now$.average) : "—"}</strong></p>
            </section>

            <section className={cn(ui.card, "p-5")}>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">Recent activity</h2>
                {events.length ? <ul className="space-y-3 text-sm">
                    {events.map(event => <li key={event.id} className="min-w-0">
                        {event.photobook ? <Link href={`/admin/orders/${event.photobook.id}`} className="font-mono text-[13px] font-semibold text-[#a2602f]">{formatOrderNumber(event.photobook.order_number)}</Link> : <span>Order</span>}
                        <span className="text-[#5e4a38]"> · {event.from_status ? `${label(event.from_status)} → ` : ""}{label(event.to_status)}</span>
                        <span className="block truncate text-[11px] text-[#a89a8a]">{new Date(event.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {event.actor}</span>
                    </li>)}
                </ul> : <p className="text-sm text-[#8a7d70]">No activity yet.</p>}
            </section>
        </div>
    </main>;
}
