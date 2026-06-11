/**
 * Standard-Kostenprofil und Konstanten für den FreightLens-Kalkulator.
 *
 * Portiert aus: src/geteilt/rechner/typen.ts
 * Die Werte entsprechen einem typischen deutschen Sattelzug (Euro VI, 5 Achsen).
 */

// ==================
// Standard-Kilometer pro Monat (für Fixkosten-Umlage)
// ==================

const KM_PRO_MONAT = 12000

// ==================
// Marge-Schwellenwerte für Bewertung
// ==================

const SCHWELLE_PROFITABEL = 5 // > 5 % = profitabel
const SCHWELLE_GRENZWERTIG = 0 // 0–5 % = grenzwertig, < 0 % = verlust

// ==================
// Fahrzeugtypen
// ==================

const FAHRZEUGTYPEN = {
  sattelzug: {
    schluessel: 'sattelzug',
    bezeichnung: 'Sattelzug 40t',
    gewichtKg: 40000,
    euroKlasse: 6,
    achsen: 5,
    standardVerbrauchLPro100Km: 32,
  },
  zugmaschine: {
    schluessel: 'zugmaschine',
    bezeichnung: 'Zugmaschine 40t',
    gewichtKg: 40000,
    euroKlasse: 6,
    achsen: 5,
    standardVerbrauchLPro100Km: 35,
  },
}

// ==================
// Standard-Kostenprofil (Demo-Profil)
// ==================

const STANDARD_PROFIL = {
  // Diesel/Kraftstoff
  verbrauchLPro100Km: 32,
  dieselPreisEurL: 1.65,
  leerkilometerAufschlag: 0.1,

  // Fahrerpersonal
  stundenlohnEur: 18.5,
  lenkzeitKorrekturfaktor: 1.2,
  spesenProTagEur: 35,
  uebernachtungEur: 65,

  // Maut/Toll
  mautDeutschlandEurProKm: 0.183,
  eurovignetteBetragEur: 0,
  mautAuslandPauschalEurProKm: 0.15,

  // Fixkosten (monatlich)
  kfzSteuerMonatlichEur: 150,
  huAuMonatlichEur: 25,
  versicherungMonatlichEur: 400,
  leasingAbschreibungMonatlichEur: 2500,
  wartungMonatlichEur: 200,
}

// ==================
// Max. Lenkzeit pro Tag (EU-Verordnung)
// ==================

const MAX_LENKZEIT_PRO_TAG_H = 8.5
