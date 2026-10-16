// Lilita One advances at 100px with the cover's tight tracking. Keeping these
// small metrics in code lets server-rendered covers fit their titles immediately.
const GLYPH_WIDTHS: Record<string, number> = {
    A: 61, B: 54.9, C: 51.6, D: 57.1, E: 44.8, F: 42.7, G: 57.6,
    H: 59.9, I: 38.4, J: 41.7, K: 57.5, L: 39, M: 86.2, N: 60.3,
    O: 65.1, P: 52.5, Q: 66.1, R: 54.5, S: 48.6, T: 45.7, U: 58.3,
    V: 61.6, W: 90.8, X: 63.8, Y: 57, Z: 51.8,
    " ": 14.3, "-": 48, "’": 26.9, "'": 26.9,
};

function titleWidth(value: string) {
    return [...value.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")]
        .reduce((width, letter) => width + (GLYPH_WIDTHS[letter] ?? 60), 0);
}

export function coverTitleLayout(value: string) {
    const words = value.trim().split(/\s+/).filter(Boolean);
    const title = words.join(" ") || "My trip";
    // 83.4% leaves a little tolerance inside the cover's 86% text width.
    let best = { lines: [title], size: Math.min(29, 8340 / titleWidth(title)) };
    for (let split = 1; split < words.length; split++) {
        const lines = [words.slice(0, split).join(" "), words.slice(split).join(" ")];
        const size = Math.min(17, 8340 / Math.max(...lines.map(titleWidth)));
        if (size > best.size * 1.06) best = { lines, size };
    }
    return { lines: best.lines, size: Math.floor(best.size * 10) / 10 };
}
