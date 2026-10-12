/** Discord alert types the admin can switch on or off. Safe to import in the browser. */
export const ALERT_TYPES = [
    { id: "order_paid", label: "New paid order", description: "A customer paid for an album.", defaultOn: true },
    { id: "free_order", label: "Free order placed", description: "A discount covered the full price.", defaultOn: true },
    { id: "checkout_started", label: "Checkout started", description: "A customer opened Paystack payment.", defaultOn: true },
    { id: "payment_problem", label: "Payment problem", description: "Paystack reported a payment that doesn’t match its order.", defaultOn: true },
    { id: "customer_resubmitted", label: "Customer sent changes", description: "A customer updated an album you sent back.", defaultOn: true },
    { id: "order_cancelled", label: "Order cancelled", description: "An order was cancelled in the admin.", defaultOn: true },
    { id: "status_changed", label: "Every status change", description: "Each move in the admin, such as printing or delivered.", defaultOn: false },
    { id: "email_failed", label: "Customer email failed", description: "An order update email couldn’t be sent.", defaultOn: true },
    { id: "discount_used_up", label: "Discount code used up", description: "A limited code reached its last use.", defaultOn: true },
    { id: "pricing_changed", label: "Prices changed", description: "Album price, delivery fee or tax was changed.", defaultOn: true },
    { id: "new_album_saved", label: "New album saved", description: "A customer saved a new album to their account.", defaultOn: false },
] as const;

export type AlertType = (typeof ALERT_TYPES)[number]["id"];

export function alertEnabled(type: AlertType, settings: Record<string, boolean>) {
    return settings[type] ?? ALERT_TYPES.find(alert => alert.id === type)!.defaultOn;
}
