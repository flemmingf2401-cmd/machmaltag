/**
 * Eurovignette-Tarife.
 *
 * Gilt für NL, BE, LU (Maut pro km).
 * DK und SE haben die Eurovignette abgeschafft.
 */

export const EUROVIGNETTE_TARIFE: Record<string, number> = {
  NL: 0.15, // Niederlande pro km
  BE: 0.18, // Belgien pro km
  LU: 0.12, // Luxemburg pro km
}

/**
 * Prüft ob ein Land Eurovignette-Tarife hat.
 */
export function istEurovignetteLand(landCode: string): boolean {
  return landCode in EUROVIGNETTE_TARIFE
}

/**
 * Eurovignette-Kosten für eine Distanz in einem Land berechnen.
 */
export function berechneEurovignetteKosten(landCode: string, distanzKm: number): number {
  const tarif = EUROVIGNETTE_TARIFE[landCode]
  if (tarif === undefined) return 0
  return distanzKm * tarif
}
