
import * as React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TableImage({
    url,
    alt,
    icon: Icon,
}: {
    url?: string | null;
    alt: string;
    icon: React.ElementType;
}) {
    if (url) {
        return (
            <div
                className="h-9 w-9 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-100 dark:border-slate-800 dark:bg-slate-800 flex-shrink-0">
                <Image
                    src={url}
                    alt={alt}
                    fill
                    className="object-cover"
                />
            </div>
        );
    }
    return (
        <div
            className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-100 dark:border-slate-800 dark:bg-slate-800 flex-shrink-0">
            <Icon className="h-4 w-4 text-slate-400" />
        </div>
    );
}

export function FormInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {label}
            </Label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-white border-slate-200 rounded-xl focus-visible:ring-blue-600 dark:bg-slate-950 dark:border-slate-800"
            />
        </div>
    );
}

export function FormTextarea({
    label,
    value,
    onChange,
    placeholder,
    rows,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {label}
            </Label>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="bg-white border-slate-200 rounded-xl resize-none focus-visible:ring-blue-600 dark:bg-slate-950 dark:border-slate-800"
            />
        </div>
    );
}
