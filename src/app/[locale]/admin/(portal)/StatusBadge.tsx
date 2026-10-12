import { isOrderStatus, STATUS_INFO } from "@/lib/album-fulfilment";
import { cn } from "@/lib/utils";

const tones = {
    neutral: "bg-[#efe8de] text-[#6d5c4b]",
    action: "bg-[#fde3cf] text-[#9a4a17]",
    warning: "bg-[#fbecc2] text-[#7a5a06]",
    progress: "bg-[#dcebf5] text-[#215479]",
    done: "bg-[#dcefdf] text-[#22603a]",
    stopped: "bg-[#ece6e3] text-[#7d6f69] line-through decoration-1",
};

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
    const info = isOrderStatus(status) ? STATUS_INFO[status] : null;
    return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", tones[info?.tone ?? "neutral"], className)}>
        {info?.label ?? status.replaceAll("_", " ")}
    </span>;
}
