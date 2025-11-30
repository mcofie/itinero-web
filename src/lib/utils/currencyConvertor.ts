export default function convert(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>,

): number {
    if (from === to) return amount;

    const rFrom = rates[from];
    const rTo = rates[to];

    if (!rFrom || !rTo) {
        throw new Error("Missing FX rate for one of the currencies");
    }

    const amountInUSD = amount / rFrom;
    return amountInUSD * rTo;
}