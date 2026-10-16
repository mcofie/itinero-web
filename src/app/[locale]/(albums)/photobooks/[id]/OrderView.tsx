import { ArrowLeft, ArrowRight, Check, CircleAlert, PauseCircle, RefreshCw, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ALBUM_FORMAT } from "@/lib/album-order";
import { formatGhs } from "@/lib/album-pricing";
import { formatOrderNumber, FULFILMENT_PATH, isOrderStatus, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { resolveCoverBackground } from "@/lib/album-cover-style";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
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
    return `color-mix(in srgb, ${resolveCoverBackground(order.cover_color ?? "auto", TRAVEL_COVERS_BY_ID[id].color)} 34%, #f1e9de)`;
}

function Cover({ order, height, className }: { order: Pick<OrderViewData, "cover_template_id" | "title" | "album_year" | "cover_typeface" | "cover_text_color" | "cover_color">; height: number; className?: string }) {
    return <AlbumCoverThumb coverId={order.cover_template_id} title={order.title} year={order.album_year} typeface={order.cover_typeface}
        textColor={order.cover_text_color} background={order.cover_color} height={height} className={cn("shadow-[8px_14px_26px_#2b1a0738]", className)} />;
}

const card = "rounded-[24px] border border-[#e6dbcd] bg-[#fdfbf8]";
const eyebrow = "text-[11px] font-bold uppercase tracking-[.18em] text-[#b76839]";

export default function OrderView({ order, reachedAt, justConfirmed }: { order: OrderViewData; reachedAt: Record<string, string>; justConfirmed: boolean }) {
    const status = order.status;
    const info = STATUS_INFO[status];
    // A paused order shows the progress it had reached; a change request sits within review.
    const progressStatus = status === "on_hold" && isOrderStatus(order.held_from_status) ? order.held_from_status : status;
    const pathIndex = FULFILMENT_PATH.indexOf(progressStatus === "changes_requested" ? "in_review" : progressStatus);
    const address = order.shipping_address;
    const showCourier = (status === "out_for_delivery" || status === "delivered") && (order.courier_name || order.delivery_date);

    return <main className="mx-auto max-w-5xl px-5 pb-6 pt-8 sm:px-8 sm:pt-12">
        <Link href="/photobooks" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8f5e3a] transition hover:text-[#4e3019]"><ArrowLeft size={15} /> My albums</Link>

        {justConfirmed && status !== "cancelled" && <section role="status" className="mt-5 flex items-center gap-4 rounded-[20px] border border-[#d3e5cb] bg-[#eef5ea] px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2f7a4a] text-white"><Check size={18} strokeWidth={3} /></span>
            <p className="text-sm leading-6 text-[#3f5a45]"><strong className="text-[#1f3d29]">Thank you. Order {formatOrderNumber(order.order_number)} is confirmed.</strong> {Number(order.total_cost) > 0 ? `We’ve received ${money(order.total_cost)}.` : "Your discount covered the full price."} We’ll check every page before printing.</p>
        </section>}

        <header className={cn(card, "mt-5 grid overflow-hidden md:grid-cols-[minmax(0,1fr)_340px]")}>
            <div className="p-7 sm:p-10">
                <p className={eyebrow}>Order {formatOrderNumber(order.order_number)}{order.paid_at && ` · Placed ${shortDate(order.paid_at)}`}</p>
                <h1 className="mt-4 font-[family-name:var(--font-album-round)] text-[44px] leading-[.95] tracking-[-.03em] sm:text-[56px]">{info.customerLabel}</h1>
                <p className="mt-4 max-w-md text-[15px] leading-7 text-[#6d5c4b]">{info.customerDescription}</p>
                <div className="mt-8 border-t border-[#ece2d6] pt-5">
                    <p className="truncate font-[Georgia] text-xl">{order.title}</p>
                    <p className="mt-1 text-sm text-[#8a7d70]">{ALBUM_FORMAT} · {order.photoCount} {order.photoCount === 1 ? "photo" : "photos"} · {order.page_count || "—"} pages</p>
                </div>
            </div>
            <div className="flex min-h-[300px] items-center justify-center p-8" style={{ background: backdrop(order) }}>
                <Cover order={order} height={250} className="-rotate-2" />
            </div>
        </header>

        {status === "changes_requested" && <section className="mt-5 flex flex-col gap-4 rounded-[24px] border border-[#efc29c] bg-[#fff4ea] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-3">
                <CircleAlert size={22} className="mt-0.5 shrink-0 text-[#c16b36]" />
                <div><h2 className="font-[Georgia] text-xl">A small change before we print</h2><p className="mt-1.5 max-w-xl whitespace-pre-line text-sm leading-6 text-[#5e4a38]">{order.customer_message || "Please review your photos and pages."}</p></div>
            </div>
            <Link href={`/make-album?id=${order.id}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2b1a07] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#53330e]">Update my album <ArrowRight size={16} /></Link>
        </section>}

        {(status === "on_hold" || status === "cancelled") && <section className={cn(card, "mt-5 flex items-start gap-3 p-6")}>
            <PauseCircle size={22} className="mt-0.5 shrink-0 text-[#a2602f]" />
            <div><h2 className="font-[Georgia] text-xl">{status === "on_hold" ? "This order is paused" : "This order was cancelled"}</h2><p className="mt-1 text-sm leading-6 text-[#6d5c4b]">{status === "on_hold" ? "We’ll contact you by email or WhatsApp with the next steps." : "If you have questions, reply to any of our order emails."}</p></div>
        </section>}

        <section className={cn(card, "mt-5 p-6 sm:p-8")} aria-label="Order progress">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-[Georgia] text-2xl">Progress</h2>
                <span className="text-xs font-semibold text-[#8a7d70]">{status === "cancelled" ? "Stopped" : status === "delivered" ? "Complete" : `Step ${Math.max(1, pathIndex + 1)} of ${FULFILMENT_PATH.length}`}</span>
            </div>
            <ol className="mt-7 grid gap-0 sm:grid-cols-6">
                {FULFILMENT_PATH.map((step, index) => {
                    const done = (status !== "cancelled" && index < pathIndex) || (status === "delivered" && index === pathIndex);
                    const current = index === pathIndex && status !== "delivered" && status !== "cancelled";
                    const at = reachedAt[step];
                    return <li key={step} className="relative flex gap-4 pb-6 last:pb-0 sm:block sm:pb-0 sm:text-center">
                        {index < FULFILMENT_PATH.length - 1 && <>
                            <span className={cn("absolute left-[13px] top-7 h-[calc(100%-22px)] w-px sm:hidden", done ? "bg-[#c16b36]" : "bg-[#e2d6c7]")} />
                            <span className={cn("absolute left-1/2 top-[13px] hidden h-px w-full sm:block", done ? "bg-[#c16b36]" : "bg-[#e2d6c7]")} />
                        </>}
                        <span className={cn("relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold sm:mx-auto",
                            done ? "border-[#c16b36] bg-[#c16b36] text-white" : current ? "border-[#c16b36] bg-[#fdfbf8] text-[#c16b36] ring-4 ring-[#f6e3d4]" : "border-[#ddd0c1] bg-[#fdfbf8] text-[#b3a594]")}>
                            {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                        </span>
                        <div className="min-w-0 pt-0.5 sm:mt-3 sm:px-1 sm:pt-0">
                            <strong className={cn("block text-sm font-semibold leading-5", !done && !current && "font-medium text-[#a89a8a]")}>{STATUS_INFO[step].customerLabel}</strong>
                            {(done || current) && at && <span className="mt-0.5 block text-[11px] text-[#8a7d70]">{dateTime(at)}</span>}
                        </div>
                    </li>;
                })}
            </ol>
        </section>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className={cn(card, "p-6 sm:p-7")}>
                <h2 className="font-[Georgia] text-xl">Delivery</h2>
                {address ? <div className="mt-4 text-sm leading-6 text-[#5e4a38]">
                    <p className="font-semibold text-[#2b1a07]">{address.fullName}</p>
                    <p>{address.street}, {address.area}{address.landmark && <><br />Near {address.landmark}</>}<br />Accra, Ghana</p>
                    {address.phone && <p className="mt-1 text-[#8a7d70]">{address.phone}</p>}
                </div> : <p className="mt-4 text-sm text-[#8a7d70]">Delivery details will appear here.</p>}
                {showCourier && <div className="mt-5 flex gap-3 rounded-2xl bg-[#f5eee6] p-4 text-sm leading-6">
                    <Truck size={18} className="mt-0.5 shrink-0 text-[#c16b36]" />
                    <div>
                        {order.courier_name && <p><span className="text-[#8a7d70]">Rider</span> {order.courier_name}{order.courier_phone && <> · <a className="font-semibold text-[#a2602f]" href={`tel:${order.courier_phone}`}>{order.courier_phone}</a></>}</p>}
                        {order.delivery_date && <p><span className="text-[#8a7d70]">Expected</span> {fullDate(order.delivery_date)}</p>}
                    </div>
                </div>}
            </section>

            <section className={cn(card, "p-6 sm:p-7")}>
                <h2 className="font-[Georgia] text-xl">Payment</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Hardcover album</dt><dd>{money(order.subtotal ?? order.total_cost)}</dd></div>
                    {Number(order.discount_amount) > 0 && <div className="flex justify-between gap-4 text-[#427052]"><dt>Discount{order.discount_code && ` · ${order.discount_code}`}</dt><dd>− {money(order.discount_amount)}</dd></div>}
                    <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Delivery in Accra</dt><dd>{Number(order.delivery_fee) > 0 ? money(order.delivery_fee) : "Included"}</dd></div>
                    {Number(order.tax_amount) > 0 && <div className="flex justify-between gap-4"><dt className="text-[#8a7d70]">Tax ({Number(order.tax_rate)}%)</dt><dd>{money(order.tax_amount)}</dd></div>}
                    <div className="flex justify-between gap-4 border-t border-[#ece2d6] pt-3 text-base font-semibold"><dt>Total paid</dt><dd>{money(order.total_cost)}</dd></div>
                </dl>
                {order.paid_at && <p className="mt-3 text-xs text-[#8a7d70]">Paid {dateTime(order.paid_at)}</p>}
            </section>
        </div>

        <p className="mt-8 text-center text-sm text-[#8a7d70]">We’ll keep this page up to date and get in touch if we need anything.</p>
    </main>;
}

/** Back from Paystack before the payment has settled (common with mobile money). */
export function PaymentProcessingView({ order }: { order: Pick<OrderViewData, "id" | "title" | "cover_template_id" | "album_year" | "cover_typeface" | "cover_text_color" | "cover_color" | "total_cost" | "payment_reference"> }) {
    return <main className="mx-auto max-w-3xl px-5 pb-6 pt-10 sm:px-8 sm:pt-16">
        <section className={cn(card, "flex flex-col items-center overflow-hidden text-center")}>
            <div className="flex w-full justify-center p-10" style={{ background: backdrop(order) }}><Cover order={order} height={210} className="-rotate-2" /></div>
            <div className="p-8 sm:p-10">
                <p className={eyebrow}>Almost there</p>
                <h1 className="mt-3 font-[family-name:var(--font-album-round)] text-[40px] leading-none tracking-[-.03em] sm:text-[48px]">Payment processing</h1>
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-[#6d5c4b]">Mobile money can take a minute or two to confirm. You don’t need to pay again: your order updates as soon as {money(order.total_cost)} arrives.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <a href={`/photobooks/${order.id}?payment=return`} className="inline-flex items-center gap-2 rounded-xl bg-[#2b1a07] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#53330e]"><RefreshCw size={15} /> Check again</a>
                    <Link href="/photobooks" className="rounded-xl border border-[#d9c8b5] px-5 py-3 text-sm font-bold text-[#5e4a38] transition hover:bg-[#f3ebe0]">My albums</Link>
                </div>
                {order.payment_reference && <p className="mt-6 text-xs text-[#a89a8a]">Payment reference {order.payment_reference}</p>}
            </div>
        </section>
    </main>;
}
