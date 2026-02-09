
export type DestinationOption = {
    id: string;
    name: string | null;
    country_code?: string | null;
    lat?: number | null;
    lng?: number | null;
    cover_url?: string | null;
    image_attribution?: string | null;
    current_history_id?: string | null;
    timezone?: string | null;
    category?: string | null;
    popularity?: number | null;
};

export type PlaceOption = {
    id: string;
    name: string;
    category?: string | null;
    lat?: number | null;
    lng?: number | null;
    tags?: string[] | null;
    description?: string | null;
    destination_id?: string | null;
    popularity?: number | null;
    cost_typical?: number | null;
    cost_currency?: string | null;
    kind?: string;
    url?: string | null;
    booking_url?: string | null;
    is_partner?: boolean;
};

export type PlaceHour = {
    id?: string;
    place_id?: string;
    day_of_week: number; // 0=Sun, 1=Mon...
    open_time: string | null; // "HH:MM:SS" or "HH:MM"
    close_time: string | null;
};

export type KbygPayload = {
    currency?: string;
    plugs?: string;
    languages?: string[] | string;
    getting_around?: string;
    esim?: string;
    primary_city?: string;
    tipping?: string;
    payment?: string;
    cost_coffee?: string;
    cost_meal?: string;
    cost_beer?: string;
    etiquette_dos?: string;
    etiquette_donts?: string;
    packing_tips?: string;
    emergency_police?: string;
    emergency_medical?: string;
    hidden_gem_title?: string;
    hidden_gem_desc?: string;
    photography?: string;
    gestures?: string;
    dress_code?: string;
};

export type DestinationHistoryPayload = {
    about?: string;
    history?: string;
    kbyg?: KbygPayload;
};

export type DestinationHistoryRowUI = {
    id: string;
    destination_id: string;
    section: string | null;
    content: string;
    payload: DestinationHistoryPayload | null;
    created_at: string | null;
    backdrop_image_url?: string | null;
    backdrop_image_attribution?: string | null;
};
