import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleAlert, PauseCircle, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ALBUM_FORMAT } from "@/lib/album-order";
import { formatOrderNumber, FULFILMENT_PATH, isOrderStatus, PLACED_STATUSES, STATUS_INFO } from "@/lib/album-fulfilment";
import { UUID_PATTERN } from "@/lib/album-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClientServerRSC } from "@/lib/supabase/server";
import { albumFontVariables } from "@/components/album/album-fonts";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const dateTime = (value: string) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) notFound();
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect(`/album-login?next=${encodeURIComponent(`/photobooks/${id}`)}`);

    const { data: order } = await sb.schema("itinero").from("photobooks")
        .select("id,order_number,title,status,held_from_status,cover_template_id,album_year,cover_typeface,cover_text_color,page_count,subtotal,discount_code,discount_amount,total_cost,currency,shipping_address,customer_message,courier_name,courier_phone,delivery_date,paid_at,images:photobook_images(count)")
        .eq("id", id).eq("user_id", user.id).maybeSingle();
    if (!order) notFound();
    if (!isOrderStatus(order.status) || !PLACED_STATUSES.includes(order.status)) redirect(`/make-album?id=${id}`);
    const status = order.status;

    // Ownership is checked above; the timeline table is only readable with the service role.
    const admin = createAdminClient();
    const { data: events } = admin ? await admin.schema("itinero").from("photobook_order_events")
        .select("to_status,created_at").eq("photobook_id", id).eq("kind", "status").order("created_at", { ascending: true }) : { data: [] };
    const reachedAt = new Map<string, string>();
    for (const event of events ?? []) if (event.to_status) reachedAt.set(event.to_status, event.created_at);
    if (order.paid_at && !reachedAt.has("paid")) reachedAt.set("paid", order.paid_at);

    // A paused order shows the progress it had reached; a change request sits within review.
    const progressStatus = status === "on_hold" && isOrderStatus(order.held_from_status) ? order.held_from_status : status;
    const pathIndex = FULFILMENT_PATH.indexOf(progressStatus === "changes_requested" ? "in_review" : progressStatus);
    const info = STATUS_INFO[status];
    const address = order.shipping_address as { fullName?: string; phone?: string; street?: string; area?: string; landmark?: string } | null;
    const photoCount = (order.images as { count: number }[] | null)?.[0]?.count ?? 0;

    return <main className={`${albumFontVariables} min-h-screen bg-[#f6f2ec] text-[#2b1a07]`}>
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
            <Link href="/photobooks" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#a2602f]"><ArrowLeft size={15} /> My albums</Link>
            <header className="mt-8 flex flex-col gap-8 border-b border-[#dfd3c4] pb-10 sm:flex-row sm:items-end">
                <AlbumCoverThumb coverId={order.cover_template_id} title={order.title} year={order.album_year} typeface={order.cover_typeface} textColor={order.cover_text_color} height={200} className="shadow-[7px_10px_18px_#2b1a0730]" />
                <div className="min-w-0">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[.23em] text-[#c16b36]">Order {formatOrderNumber(order.order_number)}</p>
                    <h1 className="font-[Georgia] text-4xl leading-[1.05] tracking-[-.04em] sm:text-5xl">{info.customerLabel}</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#776b60]">{info.customerDescription}</p>
                </div>
            </header>

            {status === "changes_requested" && <section className="mt-8 rounded-[22px] border border-[#f0c9a8] bg-[#fff4ea] p-6 sm:p-8">
                <div className="flex gap-3"><CircleAlert className="mt-0.5 shrink-0 text-[#c16b36]" size={22} />
                    <div><h2 className="font-[Georgia] text-2xl">What we need from you</h2>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#5e4a38]">{order.customer_message || "Please review your photos and pages."}</p>
                        <Link href={`/make-album?id=${order.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2b1a07] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#53330e]">Update my album <ArrowRight size={16} /></Link>
                    </div></div>
            </section>}
            {(status === "on_hold" || status === "cancelled") && <section className="mt-8 flex gap-3 rounded-[22px] border border-[#e2d6c7] bg-[#fdfbf8] p-6 text-sm leading-6 text-[#5e4a38]">
                <PauseCircle className="shrink-0 text-[#a2602f]" size={22} />
                <p>{status === "on_hold" ? "We’ve paused your order for a moment. We’ll contact you by email or WhatsApp with the next steps." : "This order was cancelled. If you have questions, reply to any of our order emails."}</p>
            </section>}

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <section className="rounded-[22px] border border-[#e4d9cb] bg-[#fdfbf8] p-6 sm:p-8" aria-label="Order progress">
                    <h2 className="mb-6 font-[Georgia] text-2xl">Your album’s journey</h2>
                    <ol className="space-y-0">
                        {FULFILMENT_PATH.map((step, index) => {
                            const done = (status !== "cancelled" && index < pathIndex) || (status === "delivered" && index === pathIndex);
                            const current = index === pathIndex && status !== "delivered" && status !== "cancelled";
                            const at = reachedAt.get(step);
                            return <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                                {index < FULFILMENT_PATH.length - 1 && <span className={cn("absolute left-[13px] top-7 h-[calc(100%-20px)] w-px", done ? "bg-[#c16b36]" : "bg-[#e2d6c7]")} />}
                                <span className={cn("relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold",
                                    done ? "border-[#c16b36] bg-[#c16b36] text-white" : current ? "border-[#c16b36] bg-white text-[#c16b36]" : "border-[#e2d6c7] bg-white text-[#b3a594]")}>
                                    {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                                </span>
                                <div className="pt-0.5">
                                    <strong className={cn("block text-sm", !done && !current && "text-[#a89a8a]")}>{STATUS_INFO[step].customerLabel}</strong>
                                    {(done || current) && at && <span className="text-xs text-[#8a7d70]">{dateTime(at)}</span>}
                                </div>
                            </li>;
                        })}
                    </ol>
                </section>

                <div className="space-y-6">
                    {(status === "out_for_delivery" || status === "delivered") && (order.courier_name || order.delivery_date) && <section className="rounded-[22px] border border-[#e4d9cb] bg-[#fdfbf8] p-6">
                        <h2 className="mb-3 flex items-center gap-2 font-[Georgia] text-xl"><Truck size={19} className="text-[#c16b36]" /> Delivery</h2>
                        <dl className="space-y-2 text-sm">
                            {order.courier_name && <div><dt className="text-xs text-[#8a7d70]">Rider</dt><dd>{order.courier_name}{order.courier_phone && <> · <a className="font-semibold text-[#a2602f]" href={`tel:${order.courier_phone}`}>{order.courier_phone}</a></>}</dd></div>}
                            {order.delivery_date && <div><dt className="text-xs text-[#8a7d70]">Expected</dt><dd>{new Date(`${order.delivery_date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</dd></div>}
                        </dl>
                    </section>}
                    <section className="rounded-[22px] border border-[#e4d9cb] bg-[#fdfbf8] p-6 text-sm">
                        <h2 className="mb-3 font-[Georgia] text-xl">Order details</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Album</dt><dd className="truncate text-right">{order.title}</dd></div>
                            <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Photos</dt><dd>{photoCount} · {order.page_count || "—"} pages</dd></div>
                            <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Format</dt><dd>{ALBUM_FORMAT}</dd></div>
                            {Number(order.discount_amount) > 0 && <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Discount</dt><dd>{order.discount_code} · − {order.currency || "GHS"} {order.discount_amount}</dd></div>}
                            <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Paid</dt><dd>{order.currency || "GHS"} {order.total_cost}</dd></div>
                        </dl>
                        {address && <div className="mt-4 border-t border-[#eee4d8] pt-4 leading-6">
                            <p className="text-xs text-[#8a7d70]">Delivering to</p>
                            <p>{address.fullName}<br />{address.street}, {address.area}{address.landmark && <><br />{address.landmark}</>}<br />Accra, Ghana</p>
                        </div>}
                    </section>
                </div>
            </div>
        </div>
    </main>;
}
