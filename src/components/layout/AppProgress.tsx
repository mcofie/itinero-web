"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function AppProgressBar() {
    return (
        <ProgressBar
            height="3px"
            color="#0ea5e9"
            options={{ showSpinner: false }}
            shallowRouting
            style={`
                #nprogress .bar {
                    z-index: 9999 !important;
                }
            `}
        />
    );
}