import { useTranslations } from "next-intl";
import { Plane, Shield } from "lucide-react";

export default function PrivacyPage() {
    const t = useTranslations("Privacy");

    return (
        <div>
            <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
                <p className="font-[family-name:var(--font-album-hand)] text-[26px] leading-none text-[#ed7936] -rotate-2">your privacy</p>
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
                        <h2>1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, purchase point bundles, or use our itinerary planning tools. This may include:
                        </p>
                        <ul>
                            <li>Name and email address;</li>
                            <li>Payment information (processed securely through third-party providers);</li>
                            <li>Travel preferences and itinerary details;</li>
                            <li>Correspondence with our support team.</li>
                        </ul>

                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve Itinero, including:
                        </p>
                        <ul>
                            <li>Generating personalized travel itineraries;</li>
                            <li>Processing transactions and managing point balances;</li>
                            <li>Sending you technical notices and support messages;</li>
                            <li>Responding to your comments and questions.</li>
                        </ul>

                        <h2>3. Data Protection</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>

                        <h2>4. Third-Party Services</h2>
                        <p>
                            We may use third-party services such as Supabase for authentication and database management, and Stripe or other payment providers for transactions. These services have their own privacy policies.
                        </p>

                        <h2>5. Your Choices</h2>
                        <p>
                            You may update or correct your account information at any time by logging into your profile. You may also request the deletion of your account and personal data by contacting our support team.
                        </p>

                        <h2>6. Cookies</h2>
                        <p>
                            We use cookies and similar technologies to provide and support our Service and each of the uses outlined and described above.
                        </p>
                    </div>

                    <div className="border-t-2 border-dashed border-[#dfd6ce] pt-8">
                        <p className="text-center font-[family-name:var(--font-album-hand)] text-xl text-[#ed7936]">
                            Your peace of mind is our priority. Travel safely with Itinero.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
