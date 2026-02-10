import * as React from "react";
import ResourcesClient from "./ResourcesClient";

export const metadata = {
    title: "Traveler Resources | Itinero",
    description: "Comprehensive toolkit for international travelers: Visa checkers, emergency contacts, tipping guides, and more.",
};

export default function ResourcesPage() {
    return <ResourcesClient />;
}
