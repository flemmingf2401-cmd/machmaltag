/**
 * Historie-Store — Zustand für bewertete Angebote und Statistik.
 *
 * Verwaltet:
 * - Historie der bewerteten Frachtangebote
 * - Tages-/Wochenstatistik
 * - Filter und Sortierung
 * - CSV-Export
 */

import { create } from 'zustand'
import { supabase } from '@/geteilt/datenbank/supabase-client'
import { TABELLEN } from '@/geteilt/datenbank/tabellen'
import type { BewertetesAngebotZeile, Entscheidung } from '@/geteilt/datenbank/typen'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// ==================
// Typen
// ==================

export interface HistorieFilter {
  datumVon: Date | null
  datumBis: Date | null
  bewertung: 'alle' | 'profitabel' | 'grenzwertig' | 'verlust'
  fahrzeugtyp: string
  suche: string
}

export interface TagesstatistikDaten {
  bewertetHeute: number
  angenommenHeute: number
  abgelehntHeute: number
  margeDurchschnitt: number
  margeGesamt: number
  distanzGesamt: number
  topRoute: string | null
  bewertetWoche: number
  angenommenWoche: number
}

export interface BewertetesAngebotAnzeige {
  id: string
  ladeort: string
  entladeort: string
  distanzKm: number | null
  preisEur: number
  kostenGesamtEur: number
  margeEur: number
  margeProzent: number
  bewertung: 'profitabel' | 'grenzwertig' | 'verlust'
  entscheidung: Entscheidung | null
  bewertetAm: Date
  fahrzeugtyp: string
}

// ==================
// Store
// ==================

interface HistorieZustand {
  bewertungen: BewertetesAngebotAnzeige[]
  filter: HistorieFilter
  statistik: TagesstatistikDaten | null
  laedt: boolean
  fehler: string | null

  // Aktionen
  historieLaden: (benutzerId: string) => Promise<void>
  filterSetzen: (filter: Partial<HistorieFilter>) => void
  filterZuruecksetzen: () => void
  statistikBerechnen: (benutzerId: string) => Promise<void>
  bewertungSpeichern: (benutzerId: string, organisationId: string, kostenvorlageId: string, daten: BewertetesAngebotZeile) => Promise<void>
  entscheidungSetzen: (angebotId: string, entscheidung: Entscheidung, grund?: string) => Promise<void>
  csvExportieren: () => string
}

const STANDARD_FILTER: HistorieFilter = {
  datumVon: null,
  datumBis: null,
  bewertung: 'alle',
  fahrzeugtyp: '',
  suche: '',
}

function zeileZuAnzeige(zeile: BewertetesAngebotZeile): BewertetesAngebotAnzeige {
  return {
    id: zeile.id,
    ladeort: zeile.ladeort,
    entladeort: zeile.entladeort,
    distanzKm: zeile.distanz_km,
    preisEur: zeile.preis_eur,
    kostenGesamtEur: zeile.kosten_gesamt_eur,
    margeEur: zeile.marge_eur,
    margeProzent: zeile.marge_prozent,
    bewertung: zeile.marge_prozent > 5 ? 'profitabel' : zeile.marge_prozent >= 0 ? 'grenzwertig' : 'verlust',
    entscheidung: zeile.entscheidung,
    bewertetAm: new Date(zeile.bewertet_am),
    fahrzeugtyp: zeile.fahrzeugtyp,
  }
}

export const useHistorieStore = create<HistorieZustand>((set, get) => ({
  bewertungen: [],
  filter: { ...STANDARD_FILTER },
  statistik: null,
  laedt: false,
  fehler: null,

  historieLaden: async (benutzerId: string) => {
    set({ laedt: true, fehler: null })

    let abfrage = supabase
      .from(TABELLEN.BEWERTETE_ANGEBOTE)
      .select('*')
      .eq('benutzer_id', benutzerId)
      .order('bewertet_am', { ascending: false })

    const { filter } = get()

    if (filter.datumVon) {
      abfrage = abfrage.gte('bewertet_am', filter.datumVon.toISOString())
    }
    if (filter.datumBis) {
      abfrage = abfrage.lte('bewertet_am', filter.datumBis.toISOString())
    }

    const { data, error } = await abfrage

    if (error) {
      set({ laedt: false, fehler: error.message })
      return
    }

    let bewertungen = (data ?? []).map(zeileZuAnzeige)

    // Client-seitige Filter
    if (filter.bewertung !== 'alle') {
      bewertungen = bewertungen.filter((b) => b.bewertung === filter.bewertung)
    }
    if (filter.suche) {
      const suche = filter.suche.toLowerCase()
      bewertungen = bewertungen.filter(
        (b) =>
          b.ladeort.toLowerCase().includes(suche) ||
          b.entladeort.toLowerCase().includes(suche)
      )
    }

    set({ bewertungen, laedt: false })
  },

  filterSetzen: (aenderung) => {
    set((prev) => ({
      filter: { ...prev.filter, ...aenderung },
    }))
  },

  filterZuruecksetzen: () => {
    set({ filter: { ...STANDARD_FILTER } })
  },

  statistikBerechnen: async (benutzerId: string) => {
    const heute = new Date()
    heute.setHours(0, 0, 0, 0)

    const vor7Tagen = new Date(heute)
    vor7Tagen.setDate(vor7Tagen.getDate() - 7)

    // Heutige Bewertungen
    const { data: heuteData } = await supabase
      .from(TABELLEN.BEWERTETE_ANGEBOTE)
      .select('*')
      .eq('benutzer_id', benutzerId)
      .gte('bewertet_am', heute.toISOString())

    // Wochen-Bewertungen
    const { data: wocheData } = await supabase
      .from(TABELLEN.BEWERTETE_ANGEBOTE)
      .select('*')
      .eq('benutzer_id', benutzerId)
      .gte('bewertet_am', vor7Tagen.toISOString())

    const heuteBewertungen = (heuteData ?? []).map(zeileZuAnzeige)
    const wocheBewertungen = (wocheData ?? []).map(zeileZuAnzeige)

    const angenommenHeute = heuteBewertungen.filter(
      (b) => b.entscheidung === 'angenommen'
    ).length
    const abgelehntHeute = heuteBewertungen.filter(
      (b) => b.entscheidung === 'abgelehnt'
    ).length

    const margeWerte = heuteBewertungen.map((b) => b.margeEur)
    const margeDurchschnitt = margeWerte.length > 0
      ? margeWerte.reduce((sum, m) => sum + m, 0) / margeWerte.length
      : 0

    const distanzGesamt = heuteBewertungen.reduce(
      (sum, b) => sum + (b.distanzKm ?? 0), 0
    )

    // Top-Route finden
    const routenHaeufigkeit: Record<string, number> = {}
    for (const b of heuteBewertungen) {
      const route = `${b.ladeort} → ${b.entladeort}`
      routenHaeufigkeit[route] = (routenHaeufigkeit[route] ?? 0) + 1
    }
    const topRoute = Object.entries(routenHaeufigkeit).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] ?? null

    set({
      statistik: {
        bewertetHeute: heuteBewertungen.length,
        angenommenHeute,
        abgelehntHeute,
        margeDurchschnitt: Math.round(margeDurchschnitt * 100) / 100,
        margeGesamt: margeWerte.reduce((sum, m) => sum + m, 0),
        distanzGesamt,
        topRoute,
        bewertetWoche: wocheBewertungen.length,
        angenommenWoche: wocheBewertungen.filter(
          (b) => b.entscheidung === 'angenommen'
        ).length,
      },
    })
  },

  bewertungSpeichern: async (benutzerId, organisationId, kostenvorlageId, daten) => {
    const { error } = await supabase
      .from(TABELLEN.BEWERTETE_ANGEBOTE)
      .insert({
        ...daten,
        benutzer_id: benutzerId,
        organisation_id: organisationId,
        kostenvorlage_id: kostenvorlageId,
      } as never)

    if (error) {
      set({ fehler: error.message })
      throw error
    }
  },

  entscheidungSetzen: async (angebotId, entscheidung, grund) => {
    const updateDaten: Record<string, unknown> = { entscheidung }
    if (grund !== undefined) {
      updateDaten.entscheidung_grund = grund
    }

    const { error } = await supabase
      .from(TABELLEN.BEWERTETE_ANGEBOTE)
      .update(updateDaten as never)
      .eq('id', angebotId)

    if (error) {
      set({ fehler: error.message })
      return
    }

    // Lokale Liste aktualisieren
    set((prev) => ({
      bewertungen: prev.bewertungen.map((b) =>
        b.id === angebotId ? { ...b, entscheidung } : b
      ),
    }))
  },

  csvExportieren: () => {
    const { bewertungen } = get()

    const kopfzeile = 'Datum,Ladeort,Entladeort,Distanz (km),Preis (€),Kosten (€),Marge (€),Marge (%),Bewertung,Entscheidung,Fahrzeugtyp'
    const zeilen = bewertungen.map((b) => {
      const datum = format(b.bewertetAm, 'dd.MM.yyyy HH:mm', { locale: de })
      return [
        datum,
        b.ladeort,
        b.entladeort,
        b.distanzKm ?? '',
        b.preisEur.toFixed(2),
        b.kostenGesamtEur.toFixed(2),
        b.margeEur.toFixed(2),
        b.margeProzent.toFixed(1),
        b.bewertung,
        b.entscheidung ?? 'offen',
        b.fahrzeugtyp,
      ].join(',')
    })

    return [kopfzeile, ...zeilen].join('\n')
  },
}))
