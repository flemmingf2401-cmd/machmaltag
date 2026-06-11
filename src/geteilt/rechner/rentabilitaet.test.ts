/**
 * Unit-Tests für die Rentabilitäts-Berechnungs-Engine.
 */

import { describe, it, expect } from 'vitest'
import { berechneRentabilitaet } from './rentabilitaet'
import { berechneDieselKosten } from './diesel'
import { berechneFahrerkosten } from './fahrer'
import { berechneMautkosten } from './maut'
import { berechneFixkosten } from './fixkosten'
import type { BerechnungsEingabe, KostenvorlageWerte } from './typen'

// ---- Testdaten ----

const STANDARD_PROFIL: KostenvorlageWerte = {
  // Diesel
  verbrauchLPro100Km: 32,
  dieselPreisEurL: 1.65,
  leerkilometerAufschlag: 0.1,
  // Fahrer
  stundenlohnEur: 18.5,
  lenkzeitKorrekturfaktor: 1.2,
  spesenProTagEur: 35,
  uebernachtungEur: 65,
  // Maut
  mautDeutschlandEurProKm: 0.183,
  eurovignetteBetragEur: 0,
  mautAuslandPauschalEurProKm: 0.15,
  // Fixkosten
  kfzSteuerMonatlichEur: 150,
  huAuMonatlichEur: 25,
  versicherungMonatlichEur: 400,
  leasingAbschreibungMonatlichEur: 2500,
  wartungMonatlichEur: 200,
}

const STANDARD_EINGABE: BerechnungsEingabe = {
  distanzKm: 800,
  leerkilometerAnteil: 0,
  fahrzeitStunden: 9.5,
  uebernachtungen: 1,
  laender: ['DE'],
  distanzProLand: { DE: 800 },
  profil: STANDARD_PROFIL,
  verdraengungskostenEur: 0,
}

// ---- Diesel-Tests ----

describe('berechneDieselKosten', () => {
  it('berechnet Dieselkosten korrekt für Standardstrecke', () => {
    const ergebnis = berechneDieselKosten(STANDARD_EINGABE)
    // 800km / 100 * 32l = 256l * 1.65€ = 422.40€
    expect(ergebnis.betragEur).toBe(422.4)
    expect(ergebnis.bezeichnung).toBe('Diesel/Kraftstoff')
    expect(ergebnis.positionen).toHaveLength(2)
  })

  it('berücksichtigt Leerkilometer-Aufschlag', () => {
    const eingabe: BerechnungsEingabe = {
      ...STANDARD_EINGABE,
      leerkilometerAnteil: 0.5, // 50% Leerfahrt
    }
    const ergebnis = berechneDieselKosten(eingabe)
    // Basis: 422.40€, Aufschlag: 256l * 0.5 * 0.1 = 12.8l → 12.8 * 1.65 = 21.12€
    // Gesamt: 422.40 + 21.12 = 443.52€
    expect(ergebnis.betragEur).toBe(443.52)
  })

  it('berechnet 0€ bei 0 km Distanz', () => {
    const eingabe: BerechnungsEingabe = {
      ...STANDARD_EINGABE,
      distanzKm: 0,
    }
    const ergebnis = berechneDieselKosten(eingabe)
    expect(ergebnis.betragEur).toBe(0)
  })
})

// ---- Fahrer-Tests ----

describe('berechneFahrerkosten', () => {
  it('berechnet Fahrerkosten korrekt', () => {
    const ergebnis = berechneFahrerkosten(STANDARD_EINGABE)
    // Fahrzeit: 9.5h * 1.2 = 11.4h * 18.50€ = 210.90€
    // Spesen: ceil(11.4/8.5) = 2 Tage * 35€ = 70€
    // Übernachtung: 1 * 65€ = 65€
    // Gesamt: 210.90 + 70 + 65 = 345.90€
    expect(ergebnis.betragEur).toBe(345.9)
    expect(ergebnis.positionen).toHaveLength(3)
  })

  it('berechnet ohne Übernachtung', () => {
    const eingabe: BerechnungsEingabe = {
      ...STANDARD_EINGABE,
      uebernachtungen: 0,
    }
    const ergebnis = berechneFahrerkosten(eingabe)
    // 210.90 + 70 + 0 = 280.90€
    expect(ergebnis.betragEur).toBe(280.9)
  })
})

// ---- Maut-Tests ----

describe('berechneMautkosten', () => {
  it('berechnet deutsche Maut korrekt', () => {
    const ergebnis = berechneMautkosten(STANDARD_EINGABE)
    // DE: 800km * 0.183€ = 146.40€ (Profil-Satz überschreibt Toll Collect)
    expect(ergebnis.betragEur).toBe(146.4)
  })

  it('berechnet Maut für mehrere Länder', () => {
    const eingabe: BerechnungsEingabe = {
      ...STANDARD_EINGABE,
      laender: ['DE', 'AT'],
      distanzProLand: { DE: 600, AT: 200 },
    }
    const ergebnis = berechneMautkosten(eingabe)
    // DE: 600 * 0.183 = 109.80€
    // AT: 200 * 0.22 (Ausland-Pauschale) = 44.00€
    // Gesamt: 153.80€
    expect(ergebnis.betragEur).toBe(153.8)
    expect(ergebnis.positionen).toHaveLength(2)
  })
})

// ---- Fixkosten-Tests ----

describe('berechneFixkosten', () => {
  it('berechnet Fixkosten korrekt', () => {
    const ergebnis = berechneFixkosten(STANDARD_EINGABE)
    // Monatlich: 150 + 25 + 400 + 2500 + 200 = 3275€
    // Pro km: 3275 / 12000 = 0.272917€
    // Für 800km: 218.33€
    expect(ergebnis.betragEur).toBe(218.33)
    expect(ergebnis.positionen).toHaveLength(5)
  })

  it('berechnet 0€ bei 0 km', () => {
    const eingabe: BerechnungsEingabe = {
      ...STANDARD_EINGABE,
      distanzKm: 0,
    }
    const ergebnis = berechneFixkosten(eingabe)
    expect(ergebnis.betragEur).toBe(0)
  })
})

// ---- Rentabilitäts-Orchestrator-Tests ----

describe('berechneRentabilitaet', () => {
  it('berechnet profitables Angebot korrekt', () => {
    const ergebnis = berechneRentabilitaet(1200, STANDARD_EINGABE)
    // Kosten: 422.40 + 345.90 + 146.40 + 218.33 = 1133.03€
    // Marge: 1200 - 1133.03 = 66.97€
    // Marge %: 66.97/1200 * 100 = 5.58%
    expect(ergebnis.kostenGesamtEur).toBe(1133.03)
    expect(ergebnis.margeEur).toBe(66.97)
    expect(ergebnis.margeProzent).toBe(5.58)
    expect(ergebnis.bewertung).toBe('profitabel')
  })

  it('erkennt grenzwertiges Angebot', () => {
    const ergebnis = berechneRentabilitaet(1150, STANDARD_EINGABE)
    // Marge: 1150 - 1133.03 = 16.97€
    // Marge %: 16.97/1150 * 100 = 1.48%
    expect(ergebnis.bewertung).toBe('grenzwertig')
  })

  it('erkennt Verlust-Angebot', () => {
    const ergebnis = berechneRentabilitaet(1000, STANDARD_EINGABE)
    // Marge: 1000 - 1133.03 = -133.03€
    expect(ergebnis.margeEur).toBe(-133.03)
    expect(ergebnis.bewertung).toBe('verlust')
  })

  it('berücksichtigt Verdrängungskosten', () => {
    const eingabe: BerechnungsEingabe = {
      ...STANDARD_EINGABE,
      verdraengungskostenEur: 100,
    }
    const ergebnis = berechneRentabilitaet(1200, eingabe)
    // Marge: 66.97€, Nettomarge: 66.97 - 100 = -33.03€
    expect(ergebnis.margeEur).toBe(66.97)
    expect(ergebnis.verdraengungskostenEur).toBe(100)
    expect(ergebnis.nettomargeEur).toBe(-33.03)
  })

  it('enthält alle 4 Kostentreiber', () => {
    const ergebnis = berechneRentabilitaet(1200, STANDARD_EINGABE)
    expect(ergebnis.kostentreiber.diesel.bezeichnung).toBe('Diesel/Kraftstoff')
    expect(ergebnis.kostentreiber.fahrer.bezeichnung).toBe('Fahrerpersonal')
    expect(ergebnis.kostentreiber.maut.bezeichnung).toBe('Maut/Toll')
    expect(ergebnis.kostentreiber.fixkosten.bezeichnung).toBe('Fixkosten Fahrzeug')
  })
})
