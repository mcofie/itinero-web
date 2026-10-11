"use client";

import * as React from "react";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Book, DollarSign, ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AlbumShippingAddress } from "@/lib/album-order";

type PhotobookAdmin = {
    id: string;
    title: string;
    status: string;
    total_cost: number;
    currency: string;
    created_at: string;
    page_count?: number;
    pdf_path?: string | null;
    shipping_address?: AlbumShippingAddress | null;
    user: {
        email: string;
        full_name: string;
    };
    images: { id: string; original_name?: string | null; order_index: number; width?: number | null; height?: number | null }[];
};

export default function AdminPhotobooksClient({ initialPhotobooks }: { initialPhotobooks: PhotobookAdmin[] }) {
    const [photobooks, setPhotobooks] = useState<PhotobookAdmin[]>(initialPhotobooks);

    const updateStatus = async (id: string, newStatus: string) => {
        const response = await fetch(`/api/admin/albums/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
        const result = await response.json();
        if (!response.ok) toast.error(result.error || "Failed to update status");
        else {
            setPhotobooks(current => current.map(book => book.id === id ? { ...book, status: result.status } : book));
            toast.success(`Status updated to ${newStatus}`);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Book className="h-8 w-8 text-blue-600" />
                        Photo Book Requests
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage printing and fulfillment for travel photo books.
                    </p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-4">
                <StatCard title="Total Books" value={photobooks.length} icon={Book} color="text-blue-600" />
                <StatCard title="Paid/Processing" value={photobooks.filter(b => b.status === 'paid' || b.status === 'processing').length} icon={Package} color="text-emerald-600" />
                <StatCard title="Pending Payment" value={photobooks.filter(b => b.status === 'pending_payment').length} icon={DollarSign} color="text-amber-600" />
                <StatCard title="Paid revenue" value={`${photobooks[0]?.currency || 'GHS'} ${photobooks.reduce((acc, b) => acc + (['paid', 'processing', 'shipped'].includes(b.status) ? b.total_cost : 0), 0).toFixed(2)}`} icon={DollarSign} color="text-emerald-600" />
            </div>

            <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle>All Photo Books</CardTitle>
                    <CardDescription>A list of all photo book orders and drafts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableHead className="font-bold">Book Title</TableHead>
                                <TableHead className="font-bold">Customer</TableHead>
                                <TableHead className="font-bold">Pages</TableHead>
                                <TableHead className="font-bold">Cost</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Created</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {photobooks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        No photobooks found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                photobooks.map((book) => (
                                    <TableRow key={book.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <TableCell>
                                            <div className="font-bold text-slate-900 dark:text-white">{book.title}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{book.id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{book.user?.full_name || 'Guest'}</span>
                                                <span className="text-xs text-slate-500">{book.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold">
                                                {book.images?.length || 0} photos · {book.page_count || "—"} proof pages
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {book.currency} {book.total_cost}
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize",
                                                ['paid', 'processing', 'shipped'].includes(book.status) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{book.status.replaceAll('_', ' ')}</span>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {new Date(book.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <details className="inline-block text-left text-xs">
                                                <summary className="cursor-pointer rounded-lg border px-3 py-2 font-semibold">Order details</summary>
                                                <div className="mt-2 min-w-52 space-y-2 rounded-xl border bg-white p-3 shadow-lg dark:bg-slate-900">
                                                    {book.shipping_address && <p className="leading-5"><strong>Deliver to:</strong><br />{book.shipping_address.fullName}<br />{book.shipping_address.phone}<br />{book.shipping_address.street}, {book.shipping_address.area}<br />{book.shipping_address.landmark && <>{book.shipping_address.landmark}<br /></>}Accra, Ghana</p>}
                                                    {book.pdf_path && <a className="flex items-center gap-1 font-semibold text-blue-600" target="_blank" rel="noreferrer" href={`/api/admin/albums/${book.id}/file`}>Open album PDF <ExternalLink size={13} /></a>}
                                                    {book.images?.some(photo => Math.min(photo.width || 0, photo.height || 0) < 2400) && <p className="rounded-lg bg-amber-50 p-2 text-amber-800">Check low-resolution originals before printing.</p>}
                                                    {book.images?.length > 0 && <details><summary className="cursor-pointer font-semibold">Original photos ({book.images.length})</summary><div className="mt-1 max-h-32 overflow-auto">{[...book.images].sort((a, b) => a.order_index - b.order_index).map((photo, index) => <a key={photo.id} className="block py-1 text-blue-600" target="_blank" rel="noreferrer" href={`/api/admin/albums/${book.id}/file?photo=${photo.id}`}>{index + 1}. {photo.original_name || "Photo"}</a>)}</div></details>}
                                                    {book.status === "paid" && <button className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white" onClick={() => void updateStatus(book.id, "processing")}>Mark printing</button>}
                                                    {book.status === "processing" && <button className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white" onClick={() => void updateStatus(book.id, "shipped")}>Mark shipped</button>}
                                                </div>
                                            </details>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <Card className="border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black">{value}</div>
            </CardContent>
        </Card>
    );
}
