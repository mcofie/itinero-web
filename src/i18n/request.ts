import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    const locale = await requestLocale;

    // Ensure that a valid locale is used
    const validatedLocale = (!locale || !(routing.locales as readonly string[]).includes(locale))
        ? routing.defaultLocale
        : locale;

    try {
        const messages = (await import(`../../messages/${validatedLocale}.json`)).default;
        return {
            locale: validatedLocale,
            messages
        };
    } catch (error) {
        console.error(`Failed to load messages for locale "${validatedLocale}":`, error);

        // Fallback to default locale if import fails
        try {
            const fallbackMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
            return {
                locale: routing.defaultLocale,
                messages: fallbackMessages
            };
        } catch (fallbackError) {
            console.error("Critical: Failed to load fallback messages:", fallbackError);
            return {
                locale: routing.defaultLocale,
                messages: {}
            };
        }
    }
});
