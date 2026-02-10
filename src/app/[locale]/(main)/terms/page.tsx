import { useTranslations } from "next-intl";
import { Plane } from "lucide-react";

export default function TermsPage() {
    const t = useTranslations("Terms");

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="mx-auto max-w-3xl px-6 py-20 lg:py-32">
                <div className="flex items-center gap-3 mb-12">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <Plane className="h-5 w-5" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase transition-colors">
                        {t("title")}
                    </h1>
                </div>

                <div className="space-y-12">
                    <section>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
                            {t("lastUpdated")}: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            {t("intro")}
                        </p>
                    </section>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-400">
                        <h2 className="text-2xl mt-12 mb-6">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Itinero ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily use Itinero's travel planning tools for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                        <ul>
                            <li>You may not modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose;</li>
                            <li>Attempt to decompile or reverse engineer any software contained in Itinero;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>

                        <h2 className="text-2xl mt-12 mb-6">3. Accounts and Points</h2>
                        <p>
                            Users may purchase point bundles to unlock premium features and professional itineraries. Points are valid for 12 months from the date of purchase.
                        </p>
                        <p>
                            We reserve the right to modify the points required for specific features at any time. All sales of point bundles are final, though we may issue reflections or restores in accordance with our quality guarantee.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">4. Quality Guarantee</h2>
                        <p>
                            We are committed to providing high-quality, professional travel itineraries. If an itinerary fails to meet our quality standards, please contact us for a point restoration.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">5. Limitations</h2>
                        <p>
                            In no event shall Itinero or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">6. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Itinero operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </div>

                    <div className="pt-20 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-500 font-medium italic">
                            Thank you for planning your journey with Itinero. Travel with soul.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
