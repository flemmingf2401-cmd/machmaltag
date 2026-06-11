/**
 * Formatierungs-Hilfsfunktionen für FreightLens.
 *
 * Portiert aus: src/geteilt/helfer/utils.ts
 */

/**
 * Wert auf 2 Nachkommastellen runden.
 * @param {number} wert
 * @returns {number}
 */
function runde2(wert) {
  return Math.round(wert * 100) / 100
}

/**
 * Zahl als Euro-Währung formatieren (deutsche Locale).
 * @param {number} wert - Betrag in Euro
 * @returns {string} z.B. "1.234,56 €"
 */
function formatiereWaehrung(wert) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(wert)
}

/**
 * Zahl als Prozent formatieren (deutsche Locale).
 * @param {number} wert - Prozentwert (z.B. 8.5 für 8,5 %)
 * @param {number} [nachkommastellen=1] - Anzahl Nachkommastellen
 * @returns {string} z.B. "8,5 %"
 */
function formatiereProzent(wert, nachkommastellen = 1) {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: nachkommastellen,
    maximumFractionDigits: nachkommastellen,
  }).format(wert / 100)
}

/**
 * Number als deutsches Format formatieren (Tausendertrennung, Komma).
 * @param {number} wert
 * @param {number} [nachkommastellen=0]
 * @returns {string} z.B. "1.234,5"
 */
function formatiereZahl(wert, nachkommastellen = 0) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: nachkommastellen,
    maximumFractionDigits: nachkommastellen,
  }).format(wert)
}
