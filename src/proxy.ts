import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Mode maintenance global, réversible via MAINTENANCE_MODE ---
  // Si actif : TOUTE requête (vitrine, /academie, /admin, /api…) est réécrite
  // vers /maintenance. La page /maintenance elle-même passe (évite la boucle).
  // Les assets nécessaires à son affichage sont exclus par le `matcher` ci-dessous.
  if (process.env.MAINTENANCE_MODE === "true") {
    if (pathname === "/maintenance") {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  // Hors maintenance : seule la zone /admin nécessite la vérification Supabase.
  // Les autres routes passent telles quelles (comportement d'origine préservé).
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Le proxy doit pouvoir intercepter TOUTE route quand le mode maintenance est
  // actif. On exclut uniquement les assets nécessaires à la page /maintenance
  // (build statique Next, images optimisées, favicon, logo, icônes, manifest).
  // Hors maintenance, la logique interne ne s'exécute que pour /admin.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|logo-story.png|apple-touch-icon.png|icon-192.png|icon-512.png|manifest.json).*)",
  ],
};
