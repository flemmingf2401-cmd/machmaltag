/**
 * Maut-Tariftabellen für den FreightLens-Kalkulator.
 *
 * Portiert aus:
 * - src/geteilt/maut/toll-collect.ts  (Deutschland)
 * - src/geteilt/maut/eurovignette.ts   (NL, BE, LU)
 * - src/geteilt/maut/ausland.ts        (12 Länder)
 *
 * Stand: 2024
 */

// ==================
// Toll Collect — Deutschland Autobahn
// ==================

const TOLL_COLLECT_TARIFE = [
  // Euro VI (ab 2014) — typisch für neue Sattelzüge
  { euroKlasse: 6, achsen: 4, preisEurProKm: 0.166 },
  { euroKlasse: 6, achsen: 5, preisEurProKm: 0.183 },

  // Euro V (2008–2013)
  { euroKlasse: 5, achsen: 4, preisEurProKm: 0.219 },
  { euroKlasse: 5, achsen: 5, preisEurProKm: 0.241 },

  // Euro EEV (Enhanced Environmentally Friendly Vehicle)
  { euroKlasse: -1, achsen: 4, preisEurProKm: 0.219 },
  { euroKlasse: -1, achsen: 5, preisEurProKm: 0.241 },

  // Euro III (2000–2005)
  { euroKlasse: 3, achsen: 4, preisEurProKm: 0.262 },
  { euroKlasse: 3, achsen: 5, preisEurProKm: 0.288 },

  // Euro II (1998–2000)
  { euroKlasse: 2, achsen: 4, preisEurProKm: 0.299 },
  { euroKlasse: 2, achsen: 5, preisEurProKm: 0.328 },
]

/** Fallback-Tarif falls kein passender gefunden wird */
const FALLBACK_TARIF_EUR_PRO_KM = 0.2

/**
 * Toll Collect-Kosten für eine gegebene Distanz berechnen.
 *
 * @param {number} distanzKm - Distanz in km
 * @param {number} [euroKlasse=6] - Euro-Emissionsklasse (2–6, -1 für EEV)
 * @param {number} [achsen=5] - Achszahl (4 oder 5)
 * @returns {number} Mautkosten in Euro
 */
function berechneTollCollectKosten(distanzKm, euroKlasse = 6, achsen = 5) {
  const tarif = TOLL_COLLECT_TARIFE.find(
    (t) => t.euroKlasse === euroKlasse && t.achsen === achsen
  )

  if (tarif) {
    return distanzKm * tarif.preisEurProKm
  }

  // Fallback: nächstgelegener Tarif (gleiche Achsen, niedrigste Euro-Klasse)
  const naechster = TOLL_COLLECT_TARIFE
    .filter((t) => t.achsen >= achsen)
    .sort((a, b) => a.euroKlasse - b.euroKlasse)[0]

  return distanzKm * (naechster?.preisEurProKm ?? FALLBACK_TARIF_EUR_PRO_KM)
}

// ==================
// Eurovignette — NL, BE, LU
// ==================

const EUROVIGNETTE_TARIFE = {
  NL: 0.15, // Niederlande pro km
  BE: 0.18, // Belgien pro km
  LU: 0.12, // Luxemburg pro km
}

/**
 * Prüft ob ein Land Eurovignette-Tarife hat.
 * @param {string} landCode - ISO 3166-1 alpha-2
 * @returns {boolean}
 */
function istEurovignetteLand(landCode) {
  return landCode in EUROVIGNETTE_TARIFE
}

/**
 * Eurovignette-Kosten für eine Distanz in einem Land berechnen.
 * @param {string} landCode - ISO 3166-1 alpha-2
 * @param {number} distanzKm - Distanz in diesem Land
 * @returns {number} Mautkosten in Euro
 */
function berechneEurovignetteKosten(landCode, distanzKm) {
  const tarif = EUROVIGNETTE_TARIFE[landCode]
  if (tarif === undefined) return 0
  return distanzKm * tarif
}

// ==================
// Auslands-Pauschalen — 12 Länder
// ==================

const AUSLAND_PAUSCHALEN = {
  AT: 0.22, // Österreich GO-Box
  FR: 0.2, // Frankreich EcoTaxe
  IT: 0.15, // Italien Telepass
  ES: 0.12, // Spanien
  PL: 0.1, // Polen viaToll
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
 * @param {string} landCode - ISO 3166-1 alpha-2
 * @param {number} distanzKm - Distanz in diesem Land
 * @param {number} profilPauschale - Pauschale aus dem Kostenprofil (Fallback)
 * @returns {number} Mautkosten in Euro
 */
function berechneAuslandMaut(landCode, distanzKm, profilPauschale) {
  const tarif = AUSLAND_PAUSCHALEN[landCode]
  if (tarif !== undefined) {
    return distanzKm * tarif
  }
  // Fallback auf Profil-Pauschale
  return distanzKm * profilPauschale
}
