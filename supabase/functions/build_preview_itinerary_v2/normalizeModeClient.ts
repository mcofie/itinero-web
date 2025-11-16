// src/lib/utils/normalizeModeClient.ts

export function normalizeModeClient(mode?: string):
    'walking' | 'bicycling' | 'driving' | 'transit' {
    switch ((mode ?? '').toLowerCase()) {
        case 'walk':
        case 'walking':
            return 'walking';
        case 'bike':
        case 'bicycle':
        case 'cycling':
            return 'bicycling';
        case 'car':
        case 'drive':
        case 'driving':
            return 'driving';
        case 'transit':
            return 'transit';
        default:
            return 'walking';
    }
}