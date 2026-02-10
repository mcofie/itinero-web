import { useTranslations } from "next-intl";
import { Plane, Shield } from "lucide-react";

export default function PrivacyPage() {
    const t = useTranslations("Privacy");

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="mx-auto max-w-3xl px-6 py-20 lg:py-32">
                <div className="flex items-center gap-3 mb-12">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <Shield className="h-5 w-5" />
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
                        <h2 className="text-2xl mt-12 mb-6">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, purchase point bundles, or use our itinerary planning tools. This may include:
                        </p>
                        <ul>
                            <li>Name and email address;</li>
                            <li>Payment information (processed securely through third-party providers);</li>
                            <li>Travel preferences and itinerary details;</li>
                            <li>Correspondence with our support team.</li>
                        </ul>

                        <h2 className="text-2xl mt-12 mb-6">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve Itinero, including:
                        </p>
                        <ul>
                            <li>Generating personalized travel itineraries;</li>
                            <li>Processing transactions and managing point balances;</li>
                            <li>Sending you technical notices and support messages;</li>
                            <li>Responding to your comments and questions.</li>
                        </ul>

                        <h2 className="text-2xl mt-12 mb-6">3. Data Protection</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">4. Third-Party Services</h2>
                        <p>
                            We may use third-party services such as Supabase for authentication and database management, and Stripe or other payment providers for transactions. These services have their own privacy policies.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">5. Your Choices</h2>
                        <p>
                            You may update or correct your account information at any time by logging into your profile. You may also request the deletion of your account and personal data by contacting our support team.
                        </p>

                        <h2 className="text-2xl mt-12 mb-6">6. Cookies</h2>
                        <p>
                            We use cookies and similar technologies to provide and support our Service and each of the uses outlined and described above.
                        </p>
                    </div>

                    <div className="pt-20 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-500 font-medium italic text-center">
                            Your peace of mind is our priority. Travel safely with Itinero.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
