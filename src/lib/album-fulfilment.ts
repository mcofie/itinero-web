/** Album order statuses, allowed moves and labels shared by the orders admin,
 * the customer order page and the order routes. Safe to import in the browser.
 */
export const ORDER_STATUSES = [
    "draft", "quote_requested", "pending_payment", "paid", "in_review", "changes_requested",
    "printing", "ready", "out_for_delivery", "delivered", "on_hold", "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses of a paid order (it has an order number). */
export const PLACED_STATUSES: readonly OrderStatus[] = [
    "paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "delivered", "on_hold", "cancelled",
];
/** Statuses where the customer may change photos and the proof. */
export const EDITABLE_STATUSES: readonly OrderStatus[] = ["draft", "changes_requested"];

export function isOrderStatus(value: unknown): value is OrderStatus {
    return ORDER_STATUSES.includes(value as OrderStatus);
}

type StatusInfo = { label: string; customerLabel: string; customerDescription: string; tone: "neutral" | "action" | "progress" | "done" | "warning" | "stopped" };

export const STATUS_INFO: Record<OrderStatus, StatusInfo> = {
    draft: { label: "Draft", customerLabel: "Draft", customerDescription: "", tone: "neutral" },
    quote_requested: { label: "Review requested", customerLabel: "Review requested", customerDescription: "", tone: "neutral" },
    pending_payment: { label: "Awaiting payment", customerLabel: "Payment pending", customerDescription: "Finish payment to place your order.", tone: "neutral" },
    paid: { label: "New order", customerLabel: "Order placed", customerDescription: "We’ve received your order and payment.", tone: "action" },
    in_review: { label: "In review", customerLabel: "Checking your files", customerDescription: "We’re checking your photos and pages before printing.", tone: "action" },
    changes_requested: { label: "Changes requested", customerLabel: "Needs your attention", customerDescription: "We need a small change before we can print.", tone: "warning" },
    printing: { label: "Printing", customerLabel: "Printing", customerDescription: "Your album is being printed and bound.", tone: "progress" },
    ready: { label: "Ready for delivery", customerLabel: "Ready", customerDescription: "Your album is printed and packed for delivery.", tone: "progress" },
    out_for_delivery: { label: "Out for delivery", customerLabel: "On its way", customerDescription: "Your album is on its way to you.", tone: "progress" },
    delivered: { label: "Delivered", customerLabel: "Delivered", customerDescription: "Your album has been delivered. Enjoy it.", tone: "done" },
    on_hold: { label: "On hold", customerLabel: "Paused", customerDescription: "We’ve paused your order for a moment and will be in touch.", tone: "warning" },
    cancelled: { label: "Cancelled", customerLabel: "Cancelled", customerDescription: "This order was cancelled.", tone: "stopped" },
};

/** The forward path shown as a progress tracker. */
export const FULFILMENT_PATH: readonly OrderStatus[] = ["paid", "in_review", "printing", "ready", "out_for_delivery", "delivered"];

const FORWARD: Partial<Record<OrderStatus, OrderStatus[]>> = {
    paid: ["in_review"],
    in_review: ["printing", "changes_requested"],
    changes_requested: ["in_review"],
    printing: ["ready"],
    ready: ["out_for_delivery"],
    out_for_delivery: ["delivered"],
};
const BACK: Partial<Record<OrderStatus, OrderStatus[]>> = {
    in_review: ["paid"],
    printing: ["in_review"],
    ready: ["printing"],
    out_for_delivery: ["ready"],
    delivered: ["out_for_delivery"],
};
const HOLDABLE: readonly OrderStatus[] = ["paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery"];

export type OrderMove = { to: OrderStatus; kind: "forward" | "back" | "hold" | "resume" | "cancel" };

/** Moves an admin may make from a status. `heldFrom` is the status an on-hold order resumes to. */
export function allowedMoves(from: OrderStatus, heldFrom?: string | null): OrderMove[] {
    if (from === "on_hold") {
        const moves: OrderMove[] = [];
        if (isOrderStatus(heldFrom) && HOLDABLE.includes(heldFrom)) moves.push({ to: heldFrom, kind: "resume" });
        moves.push({ to: "cancelled", kind: "cancel" });
        return moves;
    }
    const moves: OrderMove[] = [
        ...(FORWARD[from] ?? []).map(to => ({ to, kind: "forward" as const })),
        ...(BACK[from] ?? []).map(to => ({ to, kind: "back" as const })),
    ];
    if (HOLDABLE.includes(from)) moves.push({ to: "on_hold", kind: "hold" });
    if (HOLDABLE.includes(from)) moves.push({ to: "cancelled", kind: "cancel" });
    return moves;
}

/** What an admin must provide for a move. */
export function moveRequirements(move: OrderMove) {
    return {
        note: move.kind === "back" || move.kind === "hold" || move.kind === "cancel",
        customerMessage: move.to === "changes_requested",
        delivery: move.to === "out_for_delivery",
    };
}

export function moveLabel(move: OrderMove) {
    if (move.kind === "hold") return "Put on hold";
    if (move.kind === "cancel") return "Cancel order";
    if (move.kind === "resume") return `Resume · ${STATUS_INFO[move.to].label}`;
    if (move.kind === "back") return `Back to ${STATUS_INFO[move.to].label.toLowerCase()}`;
    const labels: Partial<Record<OrderStatus, string>> = {
        in_review: "Start review", printing: "Send to print", changes_requested: "Ask customer for changes",
        ready: "Mark ready", out_for_delivery: "Send out for delivery", delivered: "Mark delivered",
    };
    return labels[move.to] ?? STATUS_INFO[move.to].label;
}

export function formatOrderNumber(orderNumber: number | null | undefined) {
    return orderNumber ? `ITN-${orderNumber}` : "—";
}

/** Converts a Ghanaian phone number to WhatsApp's international digits. */
export function whatsappNumber(phone: string | null | undefined) {
    const digits = (phone ?? "").replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("233")) return digits;
    if (digits.startsWith("0")) return `233${digits.slice(1)}`;
    return digits.length === 9 ? `233${digits}` : digits;
}

/** Whole days since a timestamp. */
export function daysSince(timestamp: string | null | undefined, now = Date.now()) {
    if (!timestamp) return 0;
    return Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / 86_400_000));
}

/** Days an order may sit in a status before the admin flags it. */
export const STALE_AFTER_DAYS: Partial<Record<OrderStatus, number>> = {
    paid: 1, in_review: 2, changes_requested: 4, printing: 5, ready: 2, out_for_delivery: 2, on_hold: 3,
};
