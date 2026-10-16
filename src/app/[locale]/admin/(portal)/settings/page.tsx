import { getAlbumSettings } from "@/lib/album-settings-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeading } from "../admin-ui";
import { PricingSettings, PrintSpecSettings } from "./SettingsForms";

export default async function SettingsPage() {
    const settings = await getAlbumSettings(createAdminClient());
    return <main className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6">
        <PageHeading note="the fine tuning" title="Settings">
            Prices apply to checkouts from now on; orders already placed keep the prices they were charged.
            {settings.updatedAt && <> Last changed {new Date(settings.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{settings.updatedBy && ` by ${settings.updatedBy}`}.</>}
        </PageHeading>
        <div className="mt-6 space-y-6">
            <PricingSettings pricing={settings.pricing} />
            <PrintSpecSettings spec={settings.printSpec} />
        </div>
    </main>;
}
