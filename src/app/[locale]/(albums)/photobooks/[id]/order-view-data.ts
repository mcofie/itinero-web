import type { OrderStatus } from "@/lib/album-fulfilment";
import type { OrderViewData } from "./OrderView";

export const ORDER_VIEW_FIELDS = "id,payment_reference,order_number,title,status,held_from_status,cover_template_id,album_year,cover_typeface,cover_text_color,cover_color,page_count,subtotal,discount_code,discount_amount,delivery_fee,tax_rate,tax_amount,total_cost,shipping_address,customer_message,courier_name,courier_phone,delivery_date,paid_at,images:photobook_images(count)";

export type OrderRow = Omit<OrderViewData, "photoCount" | "status"> & { status: string; images: { count: number }[] | null };

export function toOrderView(row: OrderRow): OrderViewData {
    return { ...row, status: row.status as OrderStatus, photoCount: row.images?.[0]?.count ?? 0 };
}
