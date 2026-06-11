/**
 * Auslands-Maut-Pauschalen.
 *
 * Flat Rates für Länder ohne präzise Maut-Daten.
 * Disponenten können diese in ihrem Kostenprofil überschreiben.
 */

export const AUSLAND_PAUSCHALEN: Record<string, number> = {
  AT: 0.22, // Österreich GO-Box
  FR: 0.20, // Frankreich EcoTaxe
  IT: 0.15, // Italien Telepass
  ES: 0.12, // Spanien
  PL: 0.10, // Polen viaToll
  CZ: 0.08, // Tschechien
  SK: 0.07, // Slowakei
  HU: 0.06, // Ungarn
  SI: 0.05, // Slowenien
  HR: 0.06, // Kroatien
  RO: 0.05, // Rumänien
  CH: 0.25, // Schweiz LSVA
}

/**
 * Auslands-Maut-Kosten berechnen.
 * Verwendet Pauschalen falls kein genauer Tarif verfügbar.
 *
 * @param landCode - ISO 3166-1 alpha-2
 * @param distanzKm - Distanz in diesem Land
 * @param profilPauschale - Pauschale aus dem Kostenprofil (Fallback)
 * @returns Mautkosten in Euro
 */
export function berechneAuslandMaut(
  landCode: string,
  distanzKm: number,
  profilPauschale: number
): number {
  const tarif = AUSLAND_PAUSCHALEN[landCode]
  if (tarif !== undefined) {
    return distanzKm * tarif
  }
  // Fallback auf Profil-Pauschale
  return distanzKm * profilPauschale
}

/**
 * Alle unterstützten Länder mit Pauschalen zurückgeben.
 */
export function getAuslandPauschalen(): Record<string, number> {
  return { ...AUSLAND_PAUSCHALEN }
}
