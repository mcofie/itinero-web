import { useTranslations } from "next-intl";

export default function TermsPage() {
    const t = useTranslations("Terms");

    return (
        <div>
            <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
                <p className="font-[family-name:var(--font-album-hand)] text-[26px] leading-none text-[#ed7936] -rotate-2">the small print</p>
                <h1 className="mt-2 text-[44px] leading-[1.15] tracking-[-.03em] sm:text-[52px]">{t("title")}</h1>

                <div className="mt-8 space-y-10">
                    <section>
                        <p className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[.16em] text-[#a2602f]">
                            {t("lastUpdated")}: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[20px] leading-8 text-[#3f2f1d]">
                            {t("intro")}
                        </p>
                    </section>

                    <div className="border-t-2 border-dashed border-[#dfd6ce] pt-2 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[26px] [&_h2]:font-normal [&_h2]:tracking-[-.02em] [&_li]:font-sans [&_li]:text-[15px] [&_li]:leading-7 [&_li]:text-[#5e4a38] [&_p]:mb-3 [&_p]:font-sans [&_p]:text-[15px] [&_p]:leading-7 [&_p]:text-[#5e4a38] [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline [&_a]:decoration-[#ed7936] [&_a]:decoration-2 [&_a]:underline-offset-4">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Itinero ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>

                        <h2>2. Use License</h2>
                        <p>
                            Permission is granted to temporarily use Itinero's travel planning tools for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                        <ul>
                            <li>You may not modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose;</li>
                            <li>Attempt to decompile or reverse engineer any software contained in Itinero;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>

                        <h2>3. Accounts and Points</h2>
                        <p>
                            Users may purchase point bundles to unlock premium features and professional itineraries. Points are valid for 12 months from the date of purchase.
                        </p>
                        <p>
                            We reserve the right to modify the points required for specific features at any time. All sales of point bundles are final, though we may issue reflections or restores in accordance with our quality guarantee.
                        </p>

                        <h2>4. Quality Guarantee</h2>
                        <p>
                            We are committed to providing high-quality, professional travel itineraries. If an itinerary fails to meet our quality standards, please contact us for a point restoration.
                        </p>

                        <h2>5. Limitations</h2>
                        <p>
                            In no event shall Itinero or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
                        </p>

                        <h2>6. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Itinero operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </div>

                    <div className="border-t-2 border-dashed border-[#dfd6ce] pt-8">
                        <p className="text-center font-[family-name:var(--font-album-hand)] text-xl text-[#ed7936]">
                            Thank you for planning your journey with Itinero. Travel with soul.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
