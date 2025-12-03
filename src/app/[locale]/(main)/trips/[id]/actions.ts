"use server";

import { createClientServerRSC } from "@/lib/supabase/server"; // Update this path to your supabase server client
import { revalidatePath } from "next/cache";

/**
 * 1. Update Itinerary Item Note
 * Stored in: itinero.itinerary_items (column: notes)
 */
export async function updateItemNote(itemId: string, note: string) {
    const supabase = await createClientServerRSC();

    const { error } = await supabase
        .schema("itinero")
        .from("itinerary_items")
        .update({ notes: note })
        .eq("id", itemId);

    if (error) throw new Error(error.message);
    revalidatePath("/trips");
}

/**
 * 2. Update General Trip Note
 * Stored in: itinero.trips (column: inputs -> key: notes)
 */
export async function updateTripNote(tripId: string, note: string) {
    const supabase = await createClientServerRSC();

    // Fetch current inputs first to preserve other data
    const { data: trip } = await supabase
        .schema("itinero")
        .from("trips")
        .select("inputs")
        .eq("id", tripId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentInputs = (trip?.inputs as Record<string, any>) || {};

    const { error } = await supabase
        .schema("itinero")
        .from("trips")
        .update({
            inputs: { ...currentInputs, notes: note }
        })
        .eq("id", tripId);

    if (error) throw new Error(error.message);
    revalidatePath("/trips");
}

/**
 * 3. Update Day Note
 * Stored in: itinero.trips (column: inputs -> key: day_notes -> key: [date])
 */
export async function updateDayNote(tripId: string, dateKey: string, note: string) {
    const supabase = await createClientServerRSC();

    const { data: trip } = await supabase
        .schema("itinero")
        .from("trips")
        .select("inputs")
        .eq("id", tripId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentInputs = (trip?.inputs as Record<string, any>) || {};
    const currentDayNotes = currentInputs.day_notes || {};

    const { error } = await supabase
        .schema("itinero")
        .from("trips")
        .update({
            inputs: {
                ...currentInputs,
                day_notes: {
                    ...currentDayNotes,
                    [dateKey]: note
                }
            }
        })
        .eq("id", tripId);

    if (error) throw new Error(error.message);

    revalidatePath("/trips");
}

/**
 * 4. Update Trip Dates
 * Stored in: itinero.trips (columns: start_date, end_date)
 */
export async function updateTripDates(tripId: string, startDate: string, endDate: string) {
    const supabase = await createClientServerRSC();

    const { error } = await supabase
        .schema("itinero")
        .from("trips")
        .update({
            start_date: startDate,
            end_date: endDate,
        })
        .eq("id", tripId);

    if (error) throw new Error(error.message);
    revalidatePath("/trips");
}