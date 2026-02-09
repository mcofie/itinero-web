import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: "",
                            ...options,
                        });
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        response.cookies.set({
                            name,
                            value: "",
                            ...options,
                        });
                    },
                },
            }
        );

        // refreshing the auth token
        try {
            await supabase.auth.getUser();
        } catch (authError) {
            console.error("Middleware Auth Error:", authError);
        }
    } else {
        console.warn("Middleware: Missing Supabase environment variables. Skipping auth refresh.");
    }

    // Run next-intl middleware
    const intlResponse = intlMiddleware(request);

    // Merge cookies from Supabase response into next-intl response
    if (intlResponse && response.cookies.getAll().length > 0) {
        response.cookies.getAll().forEach((cookie) => {
            intlResponse.cookies.set(cookie);
        });
    }

    return intlResponse || response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
