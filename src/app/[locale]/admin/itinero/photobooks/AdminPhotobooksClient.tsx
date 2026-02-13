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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Book, User, Calendar, DollarSign, ExternalLink, BadgeCheck, Truck, Package, Clock } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PhotobookAdmin = {
    id: string;
    title: string;
    status: string;
    total_cost: number;
    currency: string;
    created_at: string;
    user: {
        email: string;
        full_name: string;
    };
    images: { count: number }[];
};

export default function AdminPhotobooksClient({ initialPhotobooks }: { initialPhotobooks: any[] }) {
    const sb = getSupabaseBrowser();
    const [photobooks, setPhotobooks] = useState<PhotobookAdmin[]>(initialPhotobooks);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await sb
            .schema("itinero")
            .from("photobooks")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            setPhotobooks(photobooks.map(b => b.id === id ? { ...b, status: newStatus } : b));
            toast.success(`Status updated to ${newStatus}`);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <Clock className="h-3 w-3" />;
            case 'pending_payment': return <DollarSign className="h-3 w-3" />;
            case 'paid': return <BadgeCheck className="h-3 w-3 text-emerald-500" />;
            case 'processing': return <Package className="h-3 w-3 text-blue-500" />;
            case 'shipped': return <Truck className="h-3 w-3 text-purple-500" />;
            default: return null;
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
                <StatCard title="Revenue" value={`${photobooks[0]?.currency || 'GHS'} ${photobooks.reduce((acc, b) => acc + (b.status !== 'draft' ? b.total_cost : 0), 0).toFixed(2)}`} icon={DollarSign} color="text-emerald-600" />
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
                                                {book.images?.[0]?.count || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {book.currency} {book.total_cost}
                                        </TableCell>
                                        <TableCell>
                                            <Select defaultValue={book.status} onValueChange={(val) => updateStatus(book.id, val)}>
                                                <SelectTrigger className={cn(
                                                    "h-8 w-[140px] text-[10px] font-bold uppercase tracking-wider rounded-full",
                                                    book.status === 'paid' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                                                    book.status === 'processing' && "bg-blue-50 text-blue-700 border-blue-100",
                                                    book.status === 'shipped' && "bg-purple-50 text-purple-700 border-purple-100",
                                                    book.status === 'pending_payment' && "bg-amber-50 text-amber-700 border-amber-100",
                                                    book.status === 'draft' && "bg-slate-100 text-slate-500 border-slate-200"
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(book.status)}
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                                                    <SelectItem value="pending_payment" className="text-xs">Pending Payment</SelectItem>
                                                    <SelectItem value="paid" className="text-xs">Paid</SelectItem>
                                                    <SelectItem value="processing" className="text-xs">Processing</SelectItem>
                                                    <SelectItem value="shipped" className="text-xs">Shipped</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {new Date(book.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
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
