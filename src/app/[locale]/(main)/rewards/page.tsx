import * as React from "react";
import RewardsClient from "./RewardsClient";

export const metadata = {
    title: "Community Rewards | Itinero",
    description: "Earn points and perks by contributing to the Itinero travel community.",
};

export default function RewardsPage() {
    return <RewardsClient />;
}