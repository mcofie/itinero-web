// // supabase/functions/export_itinerary_pdf/index.ts
// // deno-lint-ignore-file no-explicit-any
// import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// import satori from "https://esm.sh/satori@0.10.13";
// import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
// import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
//
// // Load resvg wasm binary once
// const RESVG_WASM_URL =
//     "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
// const wasmBytes = await fetch(RESVG_WASM_URL).then((r) => r.arrayBuffer());
// await initWasm(wasmBytes);
//
// // Load fonts once (bundle a TTF in the function directory or fetch from a CDN)
// const fontInter = await Deno.readFile(
//     new URL("./fonts/Inter-Regular.ttf", import.meta.url),
// );
// // Optional bold:
// let fontInterBold: Uint8Array | null = null;
// try {
//     fontInterBold = await Deno.readFile(
//         new URL("./fonts/Inter-Bold.ttf", import.meta.url),
//     );
// } catch (_) {
//     // ok if missing
// }
//
// type Place = {
//     id: string;
//     name: string;
//     lat?: number;
//     lng?: number;
//     category?: string | null;
//     tags?: string[] | null;
//     popularity?: number | null;
//     cost_typical?: number | null;
//     cost_currency?: string | null;
// };
//
// type Day = {
//     date: string;
//     blocks: Array<{
//         when: "morning" | "afternoon" | "evening";
//         place_id: string | null;
//         title: string;
//         est_cost: number;
//         duration_min: number;
//         travel_min_from_prev: number;
//         notes?: string;
//     }>;
//     map_polyline?: string;
//     lodging?: { name: string; lat: number; lng: number } | null;
//     return_to_lodging_min?: number | null;
//     est_day_cost?: number;
//     budget_daily?: number;
// };
//
// type PreviewLike = {
//     trip_summary: {
//         total_days: number;
//         est_total_cost: number;
//         currency?: string;
//         inputs?: any;
//         start_date?: string;
//         end_date?: string;
//     };
//     days: Day[];
//     places: Place[];
// };
//
// const A4_PX = { width: 1240, height: 1754 }; // ~ 150 DPI
// const PDF_A4_PT = { width: 595.28, height: 841.89 }; // points
//
// function cors() {
//     return {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers":
//             "authorization, x-client-info, apikey, content-type",
//     };
// }
//
// function fmtRange(start?: string, end?: string) {
//     if (!start && !end) return "—";
//     const fmt = (d: string) =>
//         new Date(d + "T00:00:00").toLocaleDateString(undefined, {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//     if (start && end) return `${fmt(start)} → ${fmt(end)}`;
//     if (start) return fmt(start);
//     return fmt(end!);
// }
//
// async function jsxToPng(jsx: any, width = A4_PX.width, height = A4_PX.height) {
//     const svg = await satori(jsx, {
//         width,
//         height,
//         fonts: [
//             { name: "Inter", data: fontInter, weight: 400, style: "normal" },
//             ...(fontInterBold
//                 ? [{ name: "Inter", data: fontInterBold, weight: 700, style: "normal" }]
//                 : []),
//         ],
//     });
//
//     const resvg = new Resvg(svg, {
//         fitTo: { mode: "width", value: width },
//         background: "white",
//     });
//     return resvg.render().asPng();
// }
//
// function Cover({ trip }: { trip: PreviewLike }) {
//     const title =
//         (trip.trip_summary?.inputs?.destinations?.[0]?.name as string) ??
//         "Your Trip";
//     const date = fmtRange(trip.trip_summary.start_date, trip.trip_summary.end_date);
//     const est = trip.trip_summary.est_total_cost ?? 0;
//     const currency = trip.trip_summary.currency ?? "USD";
//
//     return (
//         <div
//             style={{
//         width: A4_PX.width,
//             height: A4_PX.height,
//             background:
//         "linear-gradient(135deg, rgba(30,64,175,0.08), rgba(59,130,246,0.12))",
//             padding: 64,
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "space-between",
//             color: "#0f172a",
//     }}
// >
//     <div style={{ fontSize: 14, opacity: 0.7 }}>Itinero — Smart Itinerary</div>
//
//     <div>
//     <div style={{ fontSize: 18, opacity: 0.7, marginBottom: 12 }}>Trip to</div>
//     <div style={{ fontSize: 56, fontWeight: 700 }}>{title}</div>
//     <div style={{ fontSize: 20, marginTop: 8 }}>{date}</div>
//
//     <div
//     style={{
//         marginTop: 24,
//             display: "inline-flex",
//             gap: 12,
//             alignItems: "center",
//             padding: "10px 14px",
//             borderRadius: 999,
//             background: "white",
//             boxShadow: "0 4px 18px rgba(30,58,138,0.12)",
//             fontSize: 16,
//     }}
// >
//     <span style={{ opacity: 0.6 }}>Est. total:</span>
//     <span style={{ fontWeight: 600 }}>
//     {currency} {Math.round(est)}
//     </span>
//     <span style={{ opacity: 0.5 }}>• {trip.trip_summary.total_days} days</span>
//     </div>
//     </div>
//
//     <div
//     style={{
//         fontSize: 12,
//             opacity: 0.7,
//             display: "flex",
//             justifyContent: "space-between",
//     }}
// >
//     <span>Generated by Itinero</span>
//     <span>Share • Print • Offline</span>
//     </div>
//     </div>
// );
// }
//
// function DayPage(
//     { day, index, allPlaces }: { day: Day; index: number; allPlaces: Map<string, Place> },
// ) {
//     const dayCost = Math.max(
//         0,
//         Math.round(day.blocks.reduce((a, b) => a + (Number(b.est_cost) || 0), 0)),
//     );
//
//     return (
//         <div
//             style={{
//         width: A4_PX.width,
//             height: A4_PX.height,
//             background: "#ffffff",
//             padding: 48,
//             display: "flex",
//             flexDirection: "column",
//             gap: 16,
//             color: "#0f172a",
//     }}
// >
//     {/* Header */}
//     <div
//         style={{
//         display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-end",
//             borderBottom: "1px solid #e2e8f0",
//             paddingBottom: 8,
//     }}
// >
//     <div>
//         <div style={{ fontSize: 12, opacity: 0.6 }}>Day {index + 1}</div>
//     <div style={{ fontSize: 22, fontWeight: 700 }}>
//     {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
//         weekday: "short",
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     })}
//     </div>
//     </div>
//     <div style={{ fontSize: 12, opacity: 0.8 }}>
//     Est. day cost: <b>${dayCost}</b>
//     </div>
//     </div>
//
//     {/* Blocks */}
//     <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//     {day.blocks.map((b, i) => {
//         const place = b.place_id ? allPlaces.get(b.place_id) : undefined;
//         return (
//             <div
//                 key={i}
//         style={{
//             border: "1px solid #e5e7eb",
//                 borderRadius: 12,
//                 padding: 16,
//                 boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
//                 display: "grid",
//                 gridTemplateColumns: "1fr 240px",
//                 gap: 10,
//         }}
//     >
//         <div>
//             <div
//                 style={{
//             fontSize: 11,
//                 textTransform: "uppercase",
//                 letterSpacing: 0.6,
//                 opacity: 0.6,
//         }}
//     >
//         {b.when}
//         </div>
//         <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>
//         {b.title}
//         </div>
//         {b.notes && (
//             <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>
//             {b.notes}
//             </div>
//         )}
//         {place && (
//             <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
//             <b>{place.name}</b>
//             {place.category ? ` • ${place.category}` : ""}
//             </div>
//         )}
//         </div>
//
//         {/* Metrics row */}
//         <div
//             style={{
//             display: "grid",
//                 gridTemplateColumns: "repeat(3, 1fr)",
//                 gap: 8,
//                 alignSelf: "end",
//         }}
//     >
//         <div
//             style={{
//             border: "1px solid #e5e7eb",
//                 borderRadius: 8,
//                 padding: "8px 10px",
//                 textAlign: "center",
//                 fontSize: 12,
//         }}
//     >
//         <div style={{ opacity: 0.6 }}>Est. cost</div>
//         <div style={{ fontWeight: 600 }}>${b.est_cost ?? 0}</div>
//         </div>
//         <div
//         style={{
//             border: "1px solid #e5e7eb",
//                 borderRadius: 8,
//                 padding: "8px 10px",
//                 textAlign: "center",
//                 fontSize: 12,
//         }}
//     >
//         <div style={{ opacity: 0.6 }}>Duration</div>
//         <div style={{ fontWeight: 600 }}>{b.duration_min ?? 0}m</div>
//         </div>
//         <div
//         style={{
//             border: "1px solid #e5e7eb",
//                 borderRadius: 8,
//                 padding: "8px 10px",
//                 textAlign: "center",
//                 fontSize: 12,
//         }}
//     >
//         <div style={{ opacity: 0.6 }}>Travel</div>
//         <div style={{ fontWeight: 600 }}>
//         {b.travel_min_from_prev ?? 0}m
//         </div>
//         </div>
//         </div>
//         </div>
//     );
//     })}
//     </div>
//
//     {/* Footer note */}
//     {day.lodging && (
//         <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.7 }}>
//         Base: <b>{day.lodging.name}</b>
//         {typeof day.return_to_lodging_min === "number"
//             ? ` • Return ~ ${day.return_to_lodging_min}m`
//             : ""}
//         </div>
//     )}
//     </div>
// );
// }
//
// serve(async (req) => {
//     if (req.method === "OPTIONS") {
//         return new Response(null, { headers: cors() });
//     }
//
//     try {
//         const trip = (await req.json()) as PreviewLike;
//
//         // Build a places map for fast lookup
//         const placesMap = new Map<string, Place>();
//         for (const p of trip.places || []) placesMap.set(p.id, p);
//
//         // Render pages to PNG
//         const images: Uint8Array[] = [];
//
//         // Cover
//         const coverPng = await jsxToPng(<Cover trip={trip} />);
//         images.push(coverPng);
//
//         // Days
//         for (let i = 0; i < (trip.days?.length || 0); i++) {
//             const png = await jsxToPng(
//                 <DayPage day={trip.days[i]} index={i} allPlaces={placesMap} />,
//         );
//             images.push(png);
//         }
//
//         // Make PDF
//         const pdf = await PDFDocument.create();
//         const font = await pdf.embedFont(StandardFonts.Helvetica);
//
//         for (const img of images) {
//             const pngEmbed = await pdf.embedPng(img);
//             const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
//             const { width, height } = pngEmbed.scaleToFit(
//                 PDF_A4_PT.width,
//                 PDF_A4_PT.height,
//             );
//             page.drawImage(pngEmbed, {
//                 x: (PDF_A4_PT.width - width) / 2,
//                 y: (PDF_A4_PT.height - height) / 2,
//                 width,
//                 height,
//             });
//
//             // Optional page footer
//             page.drawText("Itinero", {
//                 x: 24,
//                 y: 18,
//                 size: 8,
//                 font,
//                 color: rgb(0.35, 0.4, 0.5),
//             });
//         }
//
//         const bytes = await pdf.save();
//
//         return new Response(bytes, {
//             status: 200,
//             headers: {
//                 ...cors(),
//                 "Content-Type": "application/pdf",
//                 "Content-Disposition": `inline; filename="itinerary.pdf"`,
//             },
//         });
//     } catch (e) {
//         console.error(e);
//         return new Response(
//             JSON.stringify({ error: String(e?.message ?? e) }),
//             { status: 500, headers: { ...cors(), "Content-Type": "application/json" } },
//         );
//     }
// });