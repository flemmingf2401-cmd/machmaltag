/**
 * Rechner-Store — Zustand für die Rechner-Seite.
 *
 * Verwaltet:
 * - Alle Eingabefelder des Rechners
 * - Aktives Kostenprofil (Kostenvorlage + Anpassungen)
 * - Berechnungsergebnis
 * - Länder-Auswahl
 */

import { create } from 'zustand'
import { berechneRentabilitaet } from '@/geteilt/rechner/rentabilitaet'
import type { BerechnungsEingabe, BerechnungsErgebnis, KostenvorlageWerte, FahrzeugtypSchluessel } from '@/geteilt/rechner/typen'
import { FAHRZEUGTYPEN } from '@/geteilt/rechner/typen'

// Demo-Profil für sofortige Nutzung ohne Supabase
const DEMO_PROFIL: KostenvorlageWerte = {
  verbrauchLPro100Km: 32,
  dieselPreisEurL: 1.65,
  leerkilometerAufschlag: 0.1,
  stundenlohnEur: 18.5,
  lenkzeitKorrekturfaktor: 1.2,
  spesenProTagEur: 35,
  uebernachtungEur: 65,
  mautDeutschlandEurProKm: 0.183,
  eurovignetteBetragEur: 0,
  mautAuslandPauschalEurProKm: 0.15,
  kfzSteuerMonatlichEur: 150,
  huAuMonatlichEur: 25,
  versicherungMonatlichEur: 400,
  leasingAbschreibungMonatlichEur: 2500,
  wartungMonatlichEur: 200,
}

interface RechnerZustand {
  // Eingabefelder
  ladeort: string
  entladeort: string
  distanzKm: number
  angebotPreisEur: number
  fahrzeugtyp: FahrzeugtypSchluessel
  leerkilometerAnteil: number
  fahrzeitStunden: number
  uebernachtungen: number
  verdraengungskostenEur: number
  laender: string[]
  distanzProLand: Record<string, number>

  // Kostenprofil
  profil: KostenvorlageWerte

  // Berechnungsergebnis
  ergebnis: BerechnungsErgebnis | null
  berechnet: boolean

  // Live-Berechnung
  liveBerechnung: boolean

  // Aktionen
  feldSetzen: (feld: string, wert: string | number | string[] | Record<string, number>) => void
  fahrzeugtypSetzen: (typ: FahrzeugtypSchluessel) => void
  profilSetzen: (profil: KostenvorlageWerte) => void
  landHinzufuegen: (land: string) => void
  landEntfernen: (land: string) => void
  distanzProLandSetzen: (land: string, km: number) => void
  berechnen: () => void
  zuruecksetzen: () => void
  liveBerechnungUmschalten: () => void
}

const STANDARD_LÄNDER = ['DE']

function erstelleEingabe(zustand: Partial<RechnerZustand>): BerechnungsEingabe {
  return {
    distanzKm: zustand.distanzKm ?? 0,
    leerkilometerAnteil: zustand.leerkilometerAnteil ?? 0,
    fahrzeitStunden: zustand.fahrzeitStunden ?? 0,
    uebernachtungen: zustand.uebernachtungen ?? 0,
    laender: zustand.laender ?? STANDARD_LÄNDER,
    distanzProLand: zustand.distanzProLand ?? {},
    profil: zustand.profil ?? DEMO_PROFIL,
    verdraengungskostenEur: zustand.verdraengungskostenEur ?? 0,
  }
}

export const useRechnerStore = create<RechnerZustand>((set, get) => ({
  // Standard-Eingabewerte
  ladeort: '',
  entladeort: '',
  distanzKm: 800,
  angebotPreisEur: 1200,
  fahrzeugtyp: 'sattelzug',
  leerkilometerAnteil: 0,
  fahrzeitStunden: 9.5,
  uebernachtungen: 1,
  verdraengungskostenEur: 0,
  laender: [...STANDARD_LÄNDER],
  distanzProLand: { DE: 800 },

  // Demo-Profil
  profil: { ...DEMO_PROFIL },

  // Ergebnis
  ergebnis: null,
  berechnet: false,
  liveBerechnung: false,

  feldSetzen: (feld, wert) => {
    set({ [feld]: wert } as Partial<RechnerZustand>)

    // Auto-Berechnung wenn Live-Modus aktiv
    if (get().liveBerechnung) {
      const neuerZustand = { ...get(), [feld]: wert } as RechnerZustand
      if (neuerZustand.distanzKm > 0 && neuerZustand.angebotPreisEur > 0) {
        set({
          ergebnis: berechneRentabilitaet(
            neuerZustand.angebotPreisEur,
            erstelleEingabe(neuerZustand)
          ),
          berechnet: true,
        })
      }
    }
  },

  fahrzeugtypSetzen: (typ) => {
    const fahrzeug = FAHRZEUGTYPEN[typ]
    set({
      fahrzeugtyp: typ,
      profil: {
        ...get().profil,
        verbrauchLPro100Km: fahrzeug.standardVerbrauchLPro100Km,
      },
    })
  },

  profilSetzen: (profil) => {
    set({ profil })

    if (get().liveBerechnung && get().distanzKm > 0 && get().angebotPreisEur > 0) {
      set({
        ergebnis: berechneRentabilitaet(get().angebotPreisEur, erstelleEingabe({ ...get(), profil })),
        berechnet: true,
      })
    }
  },

  landHinzufuegen: (land) => {
    const laender = [...get().laender]
    if (!laender.includes(land)) {
      laender.push(land)
      // Distanz gleichmäßig verteilen
      const distanzProLand = { ...get().distanzProLand }
      const distanzKm = get().distanzKm
      const distanzProLandNeu = Math.round(distanzKm / laender.length)
      for (const l of laender) {
        distanzProLand[l] = distanzProLandNeu
      }
      set({ laender, distanzProLand })
    }
  },

  landEntfernen: (land) => {
    const laender = get().laender.filter((l) => l !== land)
    const distanzProLand = { ...get().distanzProLand }
    delete distanzProLand[land]
    // Rest-Distanz umverteilen
    if (laender.length > 0) {
      const distanzKm = get().distanzKm
      const distanzProLandNeu = Math.round(distanzKm / laender.length)
      for (const l of laender) {
        distanzProLand[l] = distanzProLandNeu
      }
    }
    set({ laender, distanzProLand })
  },

  distanzProLandSetzen: (land, km) => {
    set({
      distanzProLand: {
        ...get().distanzProLand,
        [land]: km,
      },
    })
  },

  berechnen: () => {
    const zustand = get()
    if (zustand.distanzKm <= 0 || zustand.angebotPreisEur <= 0) return

    set({
      ergebnis: berechneRentabilitaet(zustand.angebotPreisEur, erstelleEingabe(zustand)),
      berechnet: true,
    })
  },

  zuruecksetzen: () => {
    set({
      ladeort: '',
      entladeort: '',
      distanzKm: 0,
      angebotPreisEur: 0,
      fahrzeugtyp: 'sattelzug',
      leerkilometerAnteil: 0,
      fahrzeitStunden: 0,
      uebernachtungen: 0,
      verdraengungskostenEur: 0,
      laender: [...STANDARD_LÄNDER],
      distanzProLand: {},
      ergebnis: null,
      berechnet: false,
    })
  },

  liveBerechnungUmschalten: () => {
    const neu = !get().liveBerechnung
    set({ liveBerechnung: neu })

    // Sofort berechnen wenn aktiviert und Daten vorhanden
    if (neu) {
      const zustand = get()
      if (zustand.distanzKm > 0 && zustand.angebotPreisEur > 0) {
        set({
          ergebnis: berechneRentabilitaet(zustand.angebotPreisEur, erstelleEingabe(zustand)),
          berechnet: true,
        })
      }
    }
  },
}))

export { DEMO_PROFIL }
