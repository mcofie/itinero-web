export const CITY_AIRPORT_CODES: Record<string, string> = {
    // Europe
    "London": "LHR",
    "Paris": "CDG",
    "Berlin": "BER",
    "Madrid": "MAD",
    "Rome": "FCO",
    "Amsterdam": "AMS",
    "Barcelona": "BCN",
    "Lisbon": "LIS",
    "Vienna": "VIE",
    "Prague": "PRG",
    "Dublin": "DUB",
    "Brussels": "BRU",
    "Zurich": "ZRH",
    "Munich": "MUC",
    "Frankfurt": "FRA",
    "Milan": "MXP",
    "Venice": "VCE",
    "Florence": "FLR",
    "Athens": "ATH",
    "Istanbul": "IST",
    "Copenhagen": "CPH",
    "Stockholm": "ARN",
    "Oslo": "OSL",
    "Helsinki": "HEL",
    "Budapest": "BUD",
    "Warsaw": "WAW",
    "Edinburgh": "EDI",
    "Manchester": "MAN",
    "Nice": "NCE",
    "Krakow": "KRK",
    "Seville": "SVQ",

    // North America
    "New York": "JFK",
    "Los Angeles": "LAX",
    "Chicago": "ORD",
    "Miami": "MIA",
    "San Francisco": "SFO",
    "Toronto": "YYZ",
    "Vancouver": "YVR",
    "Montreal": "YUL",
    "Mexico City": "MEX",
    "Cancun": "CUN",
    "Las Vegas": "LAS",
    "Orlando": "MCO",
    "Washington": "IAD",
    "Boston": "BOS",
    "Seattle": "SEA",
    "Atlanta": "ATL",
    "Dallas": "DFW",
    "Denver": "DEN",
    "Austin": "AUS",
    "Honolulu": "HNL",

    // Asia
    "Tokyo": "HND", // or NRT
    "Bangkok": "BKK",
    "Singapore": "SIN",
    "Hong Kong": "HKG",
    "Seoul": "ICN",
    "Dubai": "DXB",
    "Bali": "DPS", // Denpasar
    "Phuket": "HKT",
    "Kuala Lumpur": "KUL",
    "Ho Chi Minh City": "SGN",
    "Hanoi": "HAN",
    "Taipei": "TPE",
    "Manila": "MNL",
    "Mumbai": "BOM",
    "Delhi": "DEL",
    "Shanghai": "PVG",
    "Beijing": "PEK",
    "Osaka": "KIX",
    "Kyoto": "KIX", // Nearest major intl
    "Doha": "DOH",
    "Abu Dhabi": "AUH",
    "Tel Aviv": "TLV", // Generally considered part of Asia/Middle East route

    // Oceania
    "Sydney": "SYD",
    "Melbourne": "MEL",
    "Auckland": "AKL",
    "Brisbane": "BNE",
    "Perth": "PER",

    // South America
    "Sao Paulo": "GRU",
    "Rio de Janeiro": "GIG",
    "Buenos Aires": "EZE",
    "Santiago": "SCL",
    "Lima": "LIM",
    "Bogota": "BOG",
    "Cartagena": "CTG",
    "Cusco": "CUZ",

    // Africa
    "Cape Town": "CPT",
    "Johannesburg": "JNB",
    "Cairo": "CAI",
    "Marrakech": "RAK",
    "Casablanca": "CMN",
    "Nairobi": "NBO",
    "Zanzibar": "ZNZ",
    "Accra": "ACC",
    "Lagos": "LOS",
    "Dakar": "DSS",
};

/**
 * List of airport options suitable for comboboxes.
 * Format: { value: "london", label: "London (LHR)", code: "LHR" }
 */
export const AIRPORT_OPTIONS = Object.entries(CITY_AIRPORT_CODES).map(([city, code]) => ({
    value: city.toLowerCase(), // Using lowercase city name as value for searching
    label: `${city} (${code})`,
    code: code,
    city: city
}));

/**
 * Tries to find an IATA airport code for a given city name.
 * Returns the code if found, otherwise returns the normalized city name suitable for URL.
 */
export function getAirportCodeOrSlug(city: string): string {
    if (!city) return "";

    // Check direct match
    const directCode = CITY_AIRPORT_CODES[city];
    if (directCode) return directCode;

    // Check case-insensitive from our options list
    const normalizedCity = city.trim().toLowerCase();
    const found = AIRPORT_OPTIONS.find(opt => opt.value === normalizedCity || opt.code.toLowerCase() === normalizedCity);

    if (found) return found.code;

    // Fallback: slugify the city name
    return normalizedCity.replace(/\s+/g, '-');
}
