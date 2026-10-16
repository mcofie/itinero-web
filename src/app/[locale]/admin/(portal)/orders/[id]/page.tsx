import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Bell, FileText, Mail, MapPin, MessageCircle, Phone, StickyNote, Truck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ALBUM_BUCKET, ALBUM_FORMAT } from "@/lib/album-order";
import { formatGhs } from "@/lib/album-pricing";
import { daysSince, formatOrderNumber, isOrderStatus, STALE_AFTER_DAYS, STATUS_INFO, whatsappNumber } from "@/lib/album-fulfilment";
import { ORDER_FIELDS, type OrderRow } from "@/lib/album-orders-server";
import { UUID_PATTERN } from "@/lib/album-server";
import { SITE_URL } from "@/lib/site-metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
import { cn } from "@/lib/utils";
import { card, link, primaryButton, sectionLabel, serifHeading } from "../../admin-ui";
import StatusBadge from "../../StatusBadge";
import PrintFileButton from "./PrintFileButton";
import { DeliveryForm, NoteForm, PaymentCheck, StatusActions, WhatsAppUpdate } from "./OrderWorkspace";

type EventRow = { id: string; kind: "status" | "note" | "notification" | "delivery"; from_status: string | null; to_status: string | null; message: string | null; actor: string; metadata: Record<string, string>; created_at: string };
type PhotoRow = { id: string; storage_path: string; original_name: string | null; width: number | null; height: number | null; order_index: number; caption: string | null };

const LOW_RES_PX = 2400;
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const statusLabel = (status: string | null) => status && isOrderStatus(status) ? STATUS_INFO[status].label : status ?? "";

function Card({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
    return <section className={cn(card, className)}>
        <h2 className={cn(sectionLabel, "mb-4 flex items-center gap-2")}>{icon}{title}</h2>
        {children}
    </section>;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) notFound();
    const admin = createAdminClient();
    if (!admin) return <p className="mx-auto max-w-7xl p-6 text-sm">Order storage is not configured.</p>;

    const [{ data: order }, { data: photoData }, { data: eventData }] = await Promise.all([
        admin.schema("itinero").from("photobooks").select(ORDER_FIELDS).eq("id", id).maybeSingle<OrderRow>(),
        admin.schema("itinero").from("photobook_images").select("id,storage_path,original_name,width,height,order_index,caption").eq("photobook_id", id).order("order_index", { ascending: true }),
        admin.schema("itinero").from("photobook_order_events").select("id,kind,from_status,to_status,message,actor,metadata,created_at").eq("photobook_id", id).order("created_at", { ascending: false }),
    ]);
    if (!order || order.status === "draft") notFound();
    const photos = (photoData ?? []) as PhotoRow[];
    const events = (eventData ?? []) as EventRow[];
    const { data: signed } = photos.length ? await admin.storage.from(ALBUM_BUCKET).createSignedUrls(photos.map(photo => photo.storage_path), 3600) : { data: [] };
    const photoUrls = new Map((signed ?? []).map(item => [item.path, item.signedUrl]));

    const status = order.status;
    const waited = daysSince(order.status_changed_at ?? order.paid_at ?? order.created_at);
    const staleAfter = isOrderStatus(status) ? STALE_AFTER_DAYS[status] : undefined;
    const stale = staleAfter !== undefined && waited >= staleAfter;
    const address = order.shipping_address ?? {};
    const name = address.fullName || order.customer_name || "Customer";
    const whatsapp = whatsappNumber(address.phone);
    const lowRes = photos.filter(photo => Math.min(photo.width ?? 0, photo.height ?? 0) < LOW_RES_PX);
    const destination = order.destination_id && Object.hasOwn(TRAVEL_COVERS_BY_ID, order.destination_id) ? TRAVEL_COVERS_BY_ID[order.destination_id as TravelCoverId].country : order.destination_id;
    const mapQuery = [address.street, address.area, address.landmark, "Accra, Ghana"].filter(Boolean).join(", ");
    const messageInput = {
        id: order.id, title: order.title, orderNumber: order.order_number, customerName: name,
        customerMessage: order.customer_message, courierName: order.courier_name, courierPhone: order.courier_phone,
        deliveryDate: order.delivery_date, siteUrl: SITE_URL.origin,
    };

    return <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        <Link href="/admin/orders" className={cn(link, "font-[family-name:var(--font-album-serif)] text-[15px]")}><ArrowLeft size={15} /> All orders</Link>
        <header className="mt-5 flex flex-col gap-4 border-b-2 border-dashed border-[#dfd6ce] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className={cn(serifHeading, "text-[40px] leading-tight")}>{formatOrderNumber(order.order_number)}</h1>
                    <StatusBadge status={status} className="text-xs" />
                </div>
                <p className="mt-1 truncate font-[family-name:var(--font-album-serif)] text-[17px] text-[#6d5c4b]">{order.title} · {name}</p>
            </div>
            <p className={cn("text-sm", stale ? "font-bold text-[#b4441c]" : "text-[#8a7d70]")}>
                {stale && <AlertTriangle size={15} className="mr-1 inline -translate-y-px" />}
                {statusLabel(status)} for {waited === 0 ? "less than a day" : `${waited} ${waited === 1 ? "day" : "days"}`}{stale && " · overdue"}
            </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
                <Card title="Next step">
                    {status === "on_hold" && order.held_from_status && <p className="mb-3 text-sm text-[#776b60]">Paused while {statusLabel(order.held_from_status).toLowerCase()}.</p>}
                    {status === "changes_requested" && order.customer_message && <div className="mb-4 rounded-[10px] border-2 border-[#e0c066] bg-[#fff8e6] p-3 text-sm"><strong className="block text-xs text-[#7a5a06]">Asked the customer</strong><p className="mt-1 whitespace-pre-line">{order.customer_message}</p></div>}
                    <StatusActions order={{ id: order.id, status, heldFrom: order.held_from_status, courierName: order.courier_name, courierPhone: order.courier_phone, deliveryDate: order.delivery_date }} hasEmail={!!order.customer_email} />
                    <div className="mt-4 border-t-2 border-dashed border-[#efe6dc] pt-4">
                        <WhatsAppUpdate phone={whatsapp} status={status} message={messageInput} />
                    </div>
                </Card>

                <Card title="Print files" icon={<FileText size={14} />}>
                    <div className="flex flex-wrap items-center gap-3">
                        {order.pdf_path && <a href={`/api/admin/albums/${order.id}/file`} target="_blank" rel="noreferrer" className={primaryButton}><FileText size={16} /> Interior PDF</a>}
                        {order.cover_pdf_path && <a href={`/api/admin/albums/${order.id}/file?file=cover`} target="_blank" rel="noreferrer" className={primaryButton}><FileText size={16} /> Cover spread PDF</a>}
                        {!["draft", "pending_payment"].includes(status) && <PrintFileButton orderId={order.id} rebuild={!!order.pdf_path} />}
                        <span className="text-xs text-[#8a7d70]">{photos.length} photos · {order.page_count || "—"} proof pages · {ALBUM_FORMAT}</span>
                    </div>
                    {lowRes.length > 0 && <p className="mt-4 flex gap-2 rounded-[10px] border-2 border-[#e0c066] bg-[#fff8e6] p-3 text-sm text-[#6b4f05]"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{lowRes.length} {lowRes.length === 1 ? "photo is" : "photos are"} under {LOW_RES_PX} px on the short side and may print softly.</p>}
                    {photos.length > 0 && <ol className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
                        {photos.map((photo, index) => {
                            const url = photoUrls.get(photo.storage_path);
                            const low = Math.min(photo.width ?? 0, photo.height ?? 0) < LOW_RES_PX;
                            return <li key={photo.id} className="min-w-0">
                                <a href={url ?? `/api/admin/albums/${order.id}/file?photo=${photo.id}`} target="_blank" rel="noreferrer" className={cn("relative block aspect-square overflow-hidden rounded-[8px] border-2 border-[#493b2a]/80 bg-[#ece2d5]", low && "ring-2 ring-[#e0a81c]")}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {url && <img src={url} alt={photo.original_name ?? `Photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />}
                                    <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 text-[10px] font-bold text-white">{index + 1}</span>
                                </a>
                                <p className="mt-1 truncate text-[11px] text-[#6d5c4b]" title={photo.original_name ?? undefined}>{photo.original_name || "Photo"}</p>
                                <p className={cn("text-[10px]", low ? "font-bold text-[#a06d00]" : "text-[#a89a8a]")}>{photo.width}×{photo.height}{low && " · low"}</p>
                            </li>;
                        })}
                    </ol>}
                </Card>

                <Card title="Timeline" icon={<StickyNote size={14} />}>
                    <NoteForm orderId={order.id} />
                    <ol className="mt-5 space-y-4">
                        {events.map(event => <li key={event.id} className="flex gap-3 text-sm">
                            <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
                                event.kind === "note" ? "bg-[#fbecc2] text-[#7a5a06]" : event.kind === "notification" ? "bg-[#dcebf5] text-[#215479]" : event.kind === "delivery" ? "bg-[#e7dccd] text-[#6d5c4b]" : "bg-[#fde3cf] text-[#9a4a17]")}>
                                {event.kind === "note" ? <StickyNote size={13} /> : event.kind === "notification" ? <Bell size={13} /> : event.kind === "delivery" ? <Truck size={13} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                    {event.kind === "status" && <>{event.from_status ? `${statusLabel(event.from_status)} → ` : ""}{statusLabel(event.to_status)}</>}
                                    {event.kind === "note" && "Note"}
                                    {event.kind === "delivery" && "Delivery details updated"}
                                    {event.kind === "notification" && <>Email {event.metadata?.result === "sent" ? "sent" : event.metadata?.result === "failed" ? "failed" : "not sent"}: {event.message}</>}
                                </p>
                                {event.message && event.kind !== "notification" && <p className="mt-0.5 whitespace-pre-line text-[#5e4a38]">{event.message}</p>}
                                {event.metadata?.customerMessage && <p className="mt-1 whitespace-pre-line rounded-lg bg-[#f6f0e8] p-2 text-xs text-[#5e4a38]">To customer: {event.metadata.customerMessage}</p>}
                                {event.kind === "notification" && event.metadata?.result !== "sent" && event.metadata?.detail && <p className="mt-0.5 text-xs text-[#8a7d70]">{event.metadata.detail}</p>}
                                <p className="mt-0.5 text-[11px] text-[#a89a8a]">{dateTime(event.created_at)} · {event.actor}</p>
                            </div>
                        </li>)}
                        {events.length === 0 && <li className="text-sm text-[#8a7d70]">No activity recorded yet.</li>}
                    </ol>
                </Card>
            </div>

            <aside className="space-y-6">
                <Card title="Album">
                    <div className="flex gap-4">
                        <AlbumCoverThumb coverId={order.cover_template_id} title={order.title} year={order.album_year} typeface={order.cover_typeface} textColor={order.cover_text_color} background={order.cover_color} height={130} className="shadow-[4px_6px_12px_#2b1a0730]" />
                        <dl className="min-w-0 space-y-1.5 text-xs">
                            <div><dt className="text-[#8a7d70]">Title</dt><dd className="truncate font-semibold">{order.title}</dd></div>
                            <div><dt className="text-[#8a7d70]">Cover</dt><dd>{destination} · {order.album_year}</dd></div>
                            <div><dt className="text-[#8a7d70]">Style</dt><dd className="capitalize">{order.layout} layout · {order.cover_typeface} type</dd></div>
                            <div><dt className="text-[#8a7d70]">Title colour</dt><dd className="flex items-center gap-1.5">{order.cover_text_color !== "auto" && order.cover_text_color && <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: order.cover_text_color }} />}{order.cover_text_color === "auto" ? "Automatic" : order.cover_text_color}</dd></div>
                        </dl>
                    </div>
                </Card>

                <Card title="Customer">
                    <p className="font-[family-name:var(--font-album-serif)] text-[19px]">{name}</p>
                    <div className="mt-3 space-y-2 text-sm">
                        {address.phone && <p className="flex flex-wrap items-center gap-x-3 gap-y-1"><a href={`tel:${address.phone}`} className="inline-flex items-center gap-1.5 text-[#a2602f]"><Phone size={14} />{address.phone}</a>{whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f7a4a]"><MessageCircle size={13} />WhatsApp</a>}</p>}
                        {order.customer_email && <p><a href={`mailto:${order.customer_email}`} className="inline-flex items-center gap-1.5 break-all text-[#a2602f]"><Mail size={14} className="shrink-0" />{order.customer_email}</a></p>}
                    </div>
                    {address.street && <div className="mt-4 border-t-2 border-dashed border-[#efe6dc] pt-4 text-sm leading-6">
                        <p>{address.street}, {address.area}{address.landmark && <><br /><span className="text-[#776b60]">Near {address.landmark}</span></>}<br />Accra, Ghana</p>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer" className={cn(link, "mt-1 text-xs")}><MapPin size={13} />Open in Google Maps</a>
                    </div>}
                </Card>

                <Card title="Delivery" icon={<Truck size={14} />}>
                    <DeliveryForm orderId={order.id} courierName={order.courier_name} courierPhone={order.courier_phone} deliveryDate={order.delivery_date} />
                    {order.delivered_at && <p className="mt-3 text-xs text-[#22603a]">Delivered {dateTime(order.delivered_at)}</p>}
                </Card>

                <Card title="Payment">
                    <dl className="space-y-1.5 text-sm">
                        <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Album</dt><dd>{formatGhs(Number(order.subtotal ?? order.total_cost))}</dd></div>
                        {Number(order.discount_amount) > 0 && <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Discount</dt><dd className="text-[#22603a]"><span className="font-mono text-xs">{order.discount_code}</span> − {formatGhs(Number(order.discount_amount))}</dd></div>}
                        {Number(order.delivery_fee) > 0 && <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Delivery</dt><dd>{formatGhs(Number(order.delivery_fee))}</dd></div>}
                        {Number(order.tax_amount) > 0 && <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Tax ({Number(order.tax_rate)}%)</dt><dd>{formatGhs(Number(order.tax_amount))}</dd></div>}
                        <div className="flex justify-between gap-3 border-t-2 border-dashed border-[#efe6dc] pt-1.5"><dt className="text-[#8a7d70]">Charged</dt><dd className="font-semibold">{formatGhs(Number(order.total_cost))}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Paid</dt><dd>{dateTime(order.paid_at)}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="shrink-0 text-[#8a7d70]">Reference</dt><dd className="truncate font-mono text-xs leading-5" title={order.payment_reference ?? undefined}>{order.payment_reference || "—"}</dd></div>
                    </dl>
                    {order.payment_reference && !order.payment_reference.startsWith("free-") && <PaymentCheck orderId={order.id} />}
                    <p className="mt-3 text-[11px] leading-4 text-[#a89a8a]">Refunds are handled in the Paystack dashboard. Cancel the order here and add the refund to the reason.</p>
                </Card>
            </aside>
        </div>
    </main>;
}
