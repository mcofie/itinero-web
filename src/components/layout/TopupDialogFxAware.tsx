import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {getCurrencyMeta} from "@/lib/currency-data";
import {POINT_UNIT_PRICE_GHS} from "@/lib/points";
import {Coins, Loader2, Info} from "lucide-react";

type TopupDialogProps = {
    topupOpen: boolean;
    setTopupOpen: (open: boolean) => void;
    topupBusy: boolean;
    pointsInput: string;
    setPointsInput: (value: string) => void;
    onPointsKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    startTopup: () => void;
    ghsPreview: number;
    userCurrency: string;        // e.g. "USD", "EUR", "GHS"
    ghsToUserRate?: number | null; // 1 GHS = ? in userCurrency (optional)
};

const QUICK_AMOUNTS = [50, 100, 200, 500];

export function TopupDialogFxAware({
                                       topupOpen,
                                       setTopupOpen,
                                       topupBusy,
                                       pointsInput,
                                       setPointsInput,
                                       onPointsKeyDown,
                                       startTopup,
                                       ghsPreview,
                                       userCurrency,
                                       ghsToUserRate,
                                   }: TopupDialogProps) {
    const unitPriceGhs = POINT_UNIT_PRICE_GHS;

    const meta = getCurrencyMeta(userCurrency);
    const hasFx = !!ghsToUserRate && Number.isFinite(ghsToUserRate);

    const unitPriceForeign = hasFx ? unitPriceGhs * (ghsToUserRate as number) : null;
    const totalForeign = hasFx ? ghsPreview * (ghsToUserRate as number) : null;

    const formattedUnitForeign =
        hasFx && unitPriceForeign !== null
            ? `${meta.symbol}${unitPriceForeign.toFixed(2)}`
            : null;

    const formattedTotalForeign =
        hasFx && totalForeign !== null
            ? `${meta.symbol}${totalForeign.toFixed(2)}`
            : null;

    const numericPoints = Number(pointsInput || 0);
    const disableConfirm =
        topupBusy || !Number.isFinite(numericPoints) || numericPoints <= 0;

    console.log(userCurrency);

    return (
        <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
            <DialogContent className="sm:max-w-sm sm:rounded-2xl border-border">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <Coins className="h-4 w-4 text-primary"/>
              </span>
                            Top up points
                        </DialogTitle>
                        <div
                            className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                            Paying in
                            <span className="ml-1 font-semibold">
                {userCurrency.toUpperCase()}
              </span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Points are priced in Ghana cedis. We’ll show an approximate total in{" "}
                        {userCurrency.toUpperCase()} so you know what to expect on your card.
                    </p>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Price per point */}
                    <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-xs">
                        <div className="flex items-baseline justify-between gap-2">
                            <div className="space-y-0.5">
                                <div className="font-medium text-foreground">
                                    1 point = GHS {unitPriceGhs.toFixed(2)}
                                </div>
                                {formattedUnitForeign && userCurrency !== "GHS" && (
                                    <div className="text-[11px] text-muted-foreground">
                                        ≈ {formattedUnitForeign} {userCurrency.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="rounded-full bg-background px-2.5 py-1 text-[10px] text-muted-foreground">
                                Billed via Paystack
                            </div>
                        </div>
                    </div>

                    {/* Input + quick presets */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <label
                                htmlFor="pts"
                                className="font-medium text-muted-foreground"
                            >
                                Points to buy
                            </label>
                            <span className="text-[11px] text-muted-foreground">
                More points = more full itineraries
              </span>
                        </div>

                        <Input
                            id="pts"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            placeholder="e.g., 100"
                            value={pointsInput}
                            onChange={(e) => setPointsInput(e.target.value)}
                            onKeyDown={onPointsKeyDown}
                            aria-label="Points to purchase"
                        />

                        <div className="flex flex-wrap gap-2 pt-1">
                            {QUICK_AMOUNTS.map((amt) => (
                                <Button
                                    key={amt}
                                    type="button"
                                    size="sm"
                                    variant={numericPoints === amt ? "default" : "outline"}
                                    className="rounded-full text-[11px]"
                                    onClick={() => setPointsInput(String(amt))}
                                    disabled={topupBusy}
                                >
                                    {amt} pts
                                </Button>
                            ))}
                            <span className="text-[11px] text-muted-foreground">
                or enter a custom amount
              </span>
                        </div>
                    </div>

                    {/* Total cost summary */}
                    <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-3 text-sm">
                        <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Estimated charge
              </span>
                            <span className="text-base font-semibold">
                GHS {ghsPreview.toFixed(2)}
              </span>
                        </div>

                        {formattedTotalForeign && userCurrency !== "GHS" && (
                            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Approx. in {userCurrency.toUpperCase()}
                </span>
                                <span className="font-medium">
                  {formattedTotalForeign} {userCurrency.toUpperCase()}
                </span>
                            </div>
                        )}

                        <div className="mt-1 flex items-start gap-2 text-[11px] text-muted-foreground">
                            <Info className="mt-[1px] h-3 w-3 flex-shrink-0"/>
                            <span>
                After a successful payment, your points balance will update
                automatically. FX conversions are indicative only – your bank
                may apply a slightly different rate.
              </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setTopupOpen(false)}
                        disabled={topupBusy}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={startTopup}
                        disabled={disableConfirm}
                        className="min-w-[8rem]"
                    >
                        {topupBusy ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Processing…
                            </>
                        ) : (
                            "Confirm & Pay"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}