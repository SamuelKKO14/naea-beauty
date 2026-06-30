import { NextRequest, NextResponse } from "next/server";

/**
 * Mode maintenance global, réversible via la variable d'env MAINTENANCE_MODE.
 *
 * - MAINTENANCE_MODE === "true" : TOUTE requête (vitrine, /academie, /admin, /api…)
 *   est réécrite vers /maintenance. Seuls les assets statiques nécessaires à
 *   l'affichage de cette page sont laissés passer (exclus par le `matcher`
 *   ci-dessous). La page /maintenance elle-même est laissée passer pour éviter
 *   une boucle de réécriture.
 * - Sinon : aucun effet, comportement normal du site.
 */
export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") {
    return NextResponse.next();
  }

  // La page maintenance ne se réécrit pas elle-même (évite la boucle).
  if (request.nextUrl.pathname === "/maintenance") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.rewrite(url);
}

export const config = {
  // Le middleware s'applique à TOUT, sauf les assets nécessaires à la page
  // maintenance (build statique Next, images optimisées, favicon, logo, icônes,
  // manifest). Rien d'autre n'est exclu : ni /admin, ni /academie, ni /api.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|logo-story.png|apple-touch-icon.png|icon-192.png|icon-512.png|manifest.json).*)",
  ],
};
