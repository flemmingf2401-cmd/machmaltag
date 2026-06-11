/**
 * Typdefinitionen für die Rentabilitäts-Berechnungs-Engine.
 * Alle Typen sind hier zentral definiert, damit sie von Web-App und Extension gemeinsam genutzt werden.
 */

// ==================
// Kostenvorlage (zusammengeführte Werte: Basis + persönliche Anpassungen)
// ==================

export interface KostenvorlageWerte {
  // Diesel/Kraftstoff
  verbrauchLPro100Km: number
  dieselPreisEurL: number
  leerkilometerAufschlag: number

  // Fahrerpersonal
  stundenlohnEur: number
  lenkzeitKorrekturfaktor: number
  spesenProTagEur: number
  uebernachtungEur: number

  // Maut/Toll
  mautDeutschlandEurProKm: number
  eurovignetteBetragEur: number
  mautAuslandPauschalEurProKm: number

  // Fixkosten (monatlich)
  kfzSteuerMonatlichEur: number
  huAuMonatlichEur: number
  versicherungMonatlichEur: number
  leasingAbschreibungMonatlichEur: number
  wartungMonatlichEur: number
}

// ==================
// Berechnungseingabe
// ==================

export interface BerechnungsEingabe {
  /** Distanz in km */
  distanzKm: number
  /** Anteil Leerkilometer (0.0 = voll, 1.0 = leer) */
  leerkilometerAnteil: number
  /** Fahrzeit in Stunden */
  fahrzeitStunden: number
  /** Anzahl Übernachtungen */
  uebernachtungen: number
  /** Länder-Durchfahrt (ISO 3166-1 alpha-2) */
  laender: string[]
  /** Distanz pro Land in km */
  distanzProLand: Record<string, number>

  /** Zusammengeführtes Kostenprofil (Basis + Anpassungen) */
  profil: KostenvorlageWerte
  /** Verdrängungskosten in Euro */
  verdraengungskostenEur: number
}

// ==================
// Kostenposition (einzelner Posten innerhalb eines Kostentreibers)
// ==================

export interface Kostenposition {
  bezeichnung: string
  betragEur: number
  detail?: string
}

// ==================
// Kostentreiber-Ergebnis (ein ganzer Block wie Diesel, Fahrer etc.)
// ==================

export interface KostentreiberErgebnis {
  bezeichnung: string
  betragEur: number
  positionen: Kostenposition[]
}

// ==================
// Gesamtergebnis der Rentabilitätsberechnung
// ==================

export type Bewertung = 'profitabel' | 'grenzwertig' | 'verlust'

export interface BerechnungsErgebnis {
  kostentreiber: {
    diesel: KostentreiberErgebnis
    fahrer: KostentreiberErgebnis
    maut: KostentreiberErgebnis
    fixkosten: KostentreiberErgebnis
  }
  kostenGesamtEur: number
  margeEur: number
  margeProzent: number
  verdraengungskostenEur: number
  nettomargeEur: number
  nettomargeProzent: number
  bewertung: Bewertung
}

// ==================
// Angebotdaten (von TimoCom extrahiert)
// ==================

export interface AngebotDaten {
  ladeort: string
  entladeort: string
  ladeortPlz: string
  entladeortPlz: string
  distanzKm?: number
  preisEur: number
  ladung: string
  gewicht?: number
  fahrzeugtyp?: string
  timocomAngebotId?: string
}

// ==================
// Fahrzeugtyp
// ==================

export type FahrzeugtypSchluessel = 'sattelzug' | 'zugmaschine'

export interface FahrzeugtypKonfiguration {
  schluessel: FahrzeugtypSchluessel
  bezeichnung: string
  gewichtKg: number
  euroKlasse: number
  achsen: number
  standardVerbrauchLPro100Km: number
}

export const FAHRZEUGTYPEN: Record<FahrzeugtypSchluessel, FahrzeugtypKonfiguration> = {
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
// Standard-Kilometer pro Monat (für Fixkosten-Umlage)
// ==================

export const KM_PRO_MONAT = 12_000
