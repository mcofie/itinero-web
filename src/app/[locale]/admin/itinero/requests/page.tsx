
import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TourGuideActions } from "../TourGuideActions";
import { formatDistanceToNow } from "date-fns";
import { User2, Calendar, MapPin, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) redirect("/login");

    // Fetch pending tour guide requests
    const { data: requestRows, error: reqError } = await sb
        .schema("itinero")
        .from("tour_guide_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (reqError) {
        console.error("Error fetching requests", reqError);
    }

    // Fetch related profiles manually
    const userIds = Array.from(new Set(requestRows?.map((r) => r.user_id) || []));
    let profilesMap = new Map();

    if (userIds.length > 0) {
        const { data: profiles } = await sb
            .schema("itinero")
            .from("profiles")
            .select("id, full_name, avatar_url, username")
            .in("id", userIds);

        if (profiles) {
            profiles.forEach((p) => profilesMap.set(p.id, p));
        }
    }

    const requests = requestRows?.map((req) => ({
        ...req,
        profiles: profilesMap.get(req.user_id) || null,
    })) || [];


    return (
        <div className="container mx-auto max-w-7xl py-10 px-4 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Guide Requests</h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">Review and approve applications for local guides.</p>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1 font-medium bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                    {requests?.length || 0} Pending
                </Badge>
            </div>

            {(!requests || requests.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 dark:bg-slate-800">
                        <Globe className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No pending requests</h3>
                    <p className="text-slate-500 max-w-sm text-center mt-1 dark:text-slate-400">
                        There are currently no tour guide applications waiting for review.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {requests.map((req: any) => (
                        <Card key={req.id} className="overflow-hidden border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 relative rounded-full overflow-hidden bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        {req.profiles?.avatar_url ? (
                                            <Image
                                                src={req.profiles.avatar_url}
                                                alt="User"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : <User2 className="p-1.5 h-full w-full text-slate-400" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                                            {req.profiles?.full_name || "User"}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            {req.created_at ? (
                                                <>Applied {(() => {
                                                    try {
                                                        return formatDistanceToNow(new Date(req.created_at));
                                                    } catch (e) {
                                                        return "recently";
                                                    }
                                                })()} ago</>
                                            ) : (
                                                "Applied recently"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Reviewing</Badge>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Globe className="h-3 w-3" /> Country
                                        </div>
                                        <div className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                                            {req.country}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3" /> City
                                        </div>
                                        <div className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                                            {req.city}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" /> Availability
                                    </div>
                                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(req.available_times);
                                                // Simple summary rendering
                                                return Object.entries(parsed).filter(([_, slots]: any) => slots.length > 0)
                                                    .map(([day, slots]: any) => (
                                                        <div key={day} className="flex justify-between py-0.5 first:pt-0 last:pb-0">
                                                            <span className="font-semibold w-12">{day}</span>
                                                            <span>{slots.join(", ")}</span>
                                                        </div>
                                                    ));
                                            } catch (e) {
                                                return req.available_times;
                                            }
                                        })()}
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 font-medium">Action Required</span>
                                    <TourGuideActions requestId={req.id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
