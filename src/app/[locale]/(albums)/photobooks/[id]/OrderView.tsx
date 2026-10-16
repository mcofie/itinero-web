import { ArrowLeft, ArrowRight, Check, CircleAlert, PauseCircle, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ALBUM_FORMAT } from "@/lib/album-order";
import { formatGhs } from "@/lib/album-pricing";
import { formatOrderNumber, FULFILMENT_PATH, isOrderStatus, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { resolveCoverBackground } from "@/lib/album-cover-style";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

export type OrderViewData = {
    id: string;
    order_number: number | null;
    title: string;
    status: OrderStatus;
    held_from_status: string | null;
    cover_template_id: string;
    album_year: string | null;
    cover_typeface: string | null;
    cover_text_color: string | null;
    cover_color: string | null;
    page_count: number | null;
    subtotal: number | null;
    discount_code: string | null;
    discount_amount: number | null;
    delivery_fee: number | null;
    tax_rate: number | null;
    tax_amount: number | null;
    total_cost: number | null;
    shipping_address: { fullName?: string; phone?: string; street?: string; area?: string; landmark?: string } | null;
    customer_message: string | null;
    courier_name: string | null;
    courier_phone: string | null;
    delivery_date: string | null;
    paid_at: string | null;
    payment_reference?: string | null;
    photoCount: number;
};

const shortDate = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const dateTime = (value: string) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fullDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const money = (value: number | null) => formatGhs(Number(value ?? 0));

/** The cover's colour, softened, as the panel its book sits on. */
function backdrop(order: Pick<OrderViewData, "cover_template_id" | "cover_color">) {
    const id = Object.hasOwn(TRAVEL_COVERS_BY_ID, order.cover_template_id) ? order.cover_template_id as TravelCoverId : "italy";
    return `color-mix(in srgb, ${resolveCoverBackground(order.cover_color ?? "auto", TRAVEL_COVERS_BY_ID[id].color)} 36%, #fdfbf9)`;
}

function Cover({ order, height, className }: { order: Pick<OrderViewData, "cover_template_id" | "title" | "album_year" | "cover_typeface" | "cover_text_color" | "cover_color">; height: number; className?: string }) {
    // The order's cover is always the main image above the fold.
    return <AlbumCoverThumb coverId={order.cover_template_id} title={order.title} year={order.album_year} typeface={order.cover_typeface}
        textColor={order.cover_text_color} background={order.cover_color} height={height} eager className={cn("shadow-[8px_14px_26px_#2b1a0738]", className)} />;
}

const sectionTitle = "text-[28px] leading-tight tracking-[-.025em]";

export default function OrderView({ order, reachedAt, justConfirmed }: { order: OrderViewData; reachedAt: Record<string, string>; justConfirmed: boolean }) {
    const status = order.status;
    const info = STATUS_INFO[status];
    // A paused order shows the progress it had reached; a change request sits within review.
    const progressStatus = status === "on_hold" && isOrderStatus(order.held_from_status) ? order.held_from_status : status;
    const pathIndex = FULFILMENT_PATH.indexOf(progressStatus === "changes_requested" ? "in_review" : progressStatus);
    const address = order.shipping_address;
    const showCourier = (status === "out_for_delivery" || status === "delivered") && (order.courier_name || order.delivery_date);

    return <main className="mx-auto max-w-5xl px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
        <Link href="/photobooks" className={cn(ui.link, "text-[16px]")}><ArrowLeft size={15} /> My albums</Link>

        {justConfirmed && status !== "cancelled" && <section role="status" className={cn(ui.card, "mt-6 flex items-center gap-4 px-5 py-4 sm:px-6")}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#423824] bg-[#fff2d8]"><Check size={18} strokeWidth={3} /></span>
            <p className="text-[16px] leading-6"><span className="font-[family-name:var(--font-album-hand)] text-xl text-[#ed7936]">thank you!</span> Order {formatOrderNumber(order.order_number)} is confirmed. <span className="text-[#6d5c4b]">{Number(order.total_cost) > 0 ? `We’ve received ${money(order.total_cost)}, and` : "Your discount covered the full price, and"} we’ll check every page before printing.</span></p>
        </section>}

        <header className={cn(ui.card, "mt-6 grid overflow-hidden md:grid-cols-[minmax(0,1fr)_340px]")}>
            <div className="p-7 sm:p-10">
                <p className={ui.label}>Order {formatOrderNumber(order.order_number)}{order.paid_at && ` · Placed ${shortDate(order.paid_at)}`}</p>
                <p className={cn(ui.hand, "mt-5 -rotate-2")}>your book is</p>
                <h1 className="mt-1 text-[44px] leading-[1.1] tracking-[-.03em] sm:text-[54px]">{info.customerLabel.toLowerCase()}</h1>
                <p className="mt-3 max-w-md font-sans text-[15px] leading-7 text-[#6d5c4b]">{info.customerDescription}</p>
                <div className={cn(ui.rule, "mt-8 pt-5")}>
                    <p className="truncate text-[22px]">{order.title}</p>
                    <p className="mt-1 font-sans text-sm text-[#8a7d70]">{ALBUM_FORMAT} · {order.photoCount} {order.photoCount === 1 ? "photo" : "photos"} · {order.page_count || "—"} pages</p>
                </div>
            </div>
            <div className="flex min-h-[300px] items-center justify-center border-t-2 border-[#493b2a] p-8 md:border-l-2 md:border-t-0" style={{ background: backdrop(order) }}>
                <Cover order={order} height={250} className="-rotate-2" />
            </div>
        </header>

        {status === "changes_requested" && <section className={cn(ui.card, "mt-6 flex flex-col gap-5 border-[#ed7936] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7")}>
            <div className="flex items-start gap-3">
                <CircleAlert size={22} className="mt-1 shrink-0 text-[#ed7936]" />
                <div><h2 className="text-[24px] leading-tight">A small change before we print</h2><p className="mt-1.5 max-w-xl whitespace-pre-line font-sans text-[15px] leading-6 text-[#5e4a38]">{order.customer_message || "Please review your photos and pages."}</p></div>
            </div>
            <Link href={`/make-album?id=${order.id}`} className={cn(ui.button, "shrink-0")}>Update my album <ArrowRight size={16} /></Link>
        </section>}

        {(status === "on_hold" || status === "cancelled") && <section className={cn(ui.card, "mt-6 flex items-start gap-3 p-6")}>
            <PauseCircle size={22} className="mt-1 shrink-0 text-[#ed7936]" />
            <div><h2 className="text-[24px] leading-tight">{status === "on_hold" ? "This order is paused" : "This order was cancelled"}</h2><p className="mt-1 font-sans text-[15px] leading-6 text-[#6d5c4b]">{status === "on_hold" ? "We’ll contact you by email or WhatsApp with the next steps." : "If you have questions, reply to any of our order emails."}</p></div>
        </section>}

        <section className={cn(ui.card, "mt-6 p-6 sm:p-8")} aria-label="Order progress">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className={sectionTitle}>Your album’s journey</h2>
                <span className="whitespace-nowrap font-[family-name:var(--font-album-hand)] text-xl text-[#ed7936]">{status === "cancelled" ? "stopped" : status === "delivered" ? "all done!" : `step ${Math.max(1, pathIndex + 1)} of ${FULFILMENT_PATH.length}`}</span>
            </div>
            <ol className="mt-8 grid gap-0 sm:grid-cols-6">
                {FULFILMENT_PATH.map((step, index) => {
                    const done = (status !== "cancelled" && index < pathIndex) || (status === "delivered" && index === pathIndex);
                    const current = index === pathIndex && status !== "delivered" && status !== "cancelled";
                    const at = reachedAt[step];
                    return <li key={step} className="relative flex gap-4 pb-6 last:pb-0 sm:block sm:pb-0 sm:text-center">
                        {index < FULFILMENT_PATH.length - 1 && <>
                            <span className={cn("absolute left-[15px] top-8 h-[calc(100%-24px)] border-l-2 sm:hidden", done ? "border-solid border-[#ed7936]" : "border-dashed border-[#dfd6ce]")} />
                            <span className={cn("absolute left-1/2 top-[15px] hidden w-full border-t-2 sm:block", done ? "border-solid border-[#ed7936]" : "border-dashed border-[#dfd6ce]")} />
                        </>}
                        <span className={cn("relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-sans text-xs font-bold sm:mx-auto",
                            done ? "border-[#423824] bg-[#ed7936] text-white" : current ? "border-[#423824] bg-[#fff2d8] text-[#2b1a07]" : "border-[#dfd6ce] bg-[#fffcf9] text-[#b3a594]")}>
                            {done ? <Check size={15} strokeWidth={3} /> : index + 1}
                        </span>
                        <div className="min-w-0 pt-0.5 sm:mt-3 sm:px-1 sm:pt-0">
                            <strong className={cn("block text-[16px] font-normal leading-5", !done && !current && "text-[#a89a8a]")}>{STATUS_INFO[step].customerLabel}</strong>
                            {(done || current) && at && <span className="mt-1 block font-sans text-[11px] text-[#8a7d70]">{dateTime(at)}</span>}
                        </div>
                    </li>;
                })}
            </ol>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className={cn(ui.card, "p-6 sm:p-7")}>
                <h2 className={sectionTitle}>Delivery</h2>
                {address ? <div className="mt-4 text-[16px] leading-7">
                    <p>{address.fullName}</p>
                    <p className="text-[#5e4a38]">{address.street}, {address.area}{address.landmark && <><br />Near {address.landmark}</>}<br />Accra, Ghana</p>
                    {address.phone && <p className="mt-1 font-sans text-sm text-[#8a7d70]">{address.phone}</p>}
                </div> : <p className="mt-4 font-sans text-sm text-[#8a7d70]">Delivery details will appear here.</p>}
                {showCourier && <div className={cn(ui.rule, "mt-5 flex gap-3 pt-5 text-[15px] leading-6")}>
                    <Truck size={18} className="mt-1 shrink-0 text-[#ed7936]" />
                    <div>
                        {order.courier_name && <p>Rider: {order.courier_name}{order.courier_phone && <> · <a className={ui.link} href={`tel:${order.courier_phone}`}>{order.courier_phone}</a></>}</p>}
                        {order.delivery_date && <p>Expected {fullDate(order.delivery_date)}</p>}
                    </div>
                </div>}
            </section>

            <section className={cn(ui.card, "p-6 sm:p-7")}>
                <h2 className={sectionTitle}>Payment</h2>
                <dl className="mt-4 text-[16px]">
                    <div className="flex justify-between gap-4 py-2"><dt className="text-[#6d5c4b]">Hardcover album</dt><dd>{money(order.subtotal ?? order.total_cost)}</dd></div>
                    {Number(order.discount_amount) > 0 && <div className="flex justify-between gap-4 py-2 text-[#2f7a4a]"><dt>Discount{order.discount_code && ` · ${order.discount_code}`}</dt><dd>− {money(order.discount_amount)}</dd></div>}
                    <div className="flex justify-between gap-4 py-2"><dt className="text-[#6d5c4b]">Delivery in Accra</dt><dd>{Number(order.delivery_fee) > 0 ? money(order.delivery_fee) : "Included"}</dd></div>
                    {Number(order.tax_amount) > 0 && <div className="flex justify-between gap-4 py-2"><dt className="text-[#6d5c4b]">Tax ({Number(order.tax_rate)}%)</dt><dd>{money(order.tax_amount)}</dd></div>}
                    <div className={cn(ui.rule, "mt-2 flex justify-between gap-4 pt-3 text-[20px]")}><dt>Total paid</dt><dd>{money(order.total_cost)}</dd></div>
                </dl>
                {order.paid_at && <p className="mt-2 font-sans text-xs text-[#8a7d70]">Paid {dateTime(order.paid_at)}</p>}
            </section>
        </div>

        <p className="mt-10 text-center"><span className={ui.hand}>we’ll keep you posted</span><br /><span className="font-sans text-sm text-[#8a7d70]">This page updates at every step, and we’ll get in touch if we need anything.</span></p>
    </main>;
}

/** Back from Paystack before the payment has settled (common with mobile money). */
export function PaymentProcessingView({ order }: { order: Pick<OrderViewData, "id" | "title" | "cover_template_id" | "album_year" | "cover_typeface" | "cover_text_color" | "cover_color" | "total_cost" | "payment_reference"> }) {
    return <main className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <section className={cn(ui.card, "flex flex-col items-center overflow-hidden text-center")}>
            <div className="flex w-full justify-center border-b-2 border-[#493b2a] p-10" style={{ background: backdrop(order) }}><Cover order={order} height={210} className="-rotate-2" /></div>
            <div className="p-8 sm:p-10">
                <p className={cn(ui.hand, "-rotate-2")}>almost there<br />⌄</p>
                <h1 className="mt-2 text-[40px] leading-[1.15] tracking-[-.03em] sm:text-[46px]">Your payment is processing</h1>
                <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-7 text-[#6d5c4b]">Mobile money can take a minute or two to confirm. You don’t need to pay again: your order updates as soon as {money(order.total_cost)} arrives.</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                    <a href={`/photobooks/${order.id}?payment=return`} className={ui.button}>Check again</a>
                    <Link href="/photobooks" className={ui.link}>My albums</Link>
                </div>
                {order.payment_reference && <p className="mt-6 font-sans text-xs text-[#a89a8a]">Payment reference {order.payment_reference}</p>}
            </div>
        </section>
    </main>;
}
