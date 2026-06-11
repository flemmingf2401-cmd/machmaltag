/**
 * Kostenprofil-Store — Zustand für die Kostenkennzahlen.
 *
 * Verwaltet:
 * - Basis-Kostenvorlagen (vom Admin)
 * - Persönliche Anpassungen (vom Disponenten)
 * - Zusammengeführtes aktives Profil
 */

import { create } from 'zustand'
import type { KostenvorlageWerte } from '@/geteilt/rechner/typen'
import { supabase } from '@/geteilt/datenbank/supabase-client'
import { TABELLEN } from '@/geteilt/datenbank/tabellen'
import type { KostenvorlageZeile, PersoenlicheAnpassungZeile } from '@/geteilt/datenbank/typen'

interface KostenprofilZustand {
  // Zustand
  vorlagen: KostenvorlageZeile[]
  anpassungen: PersoenlicheAnpassungZeile[]
  aktiveVorlageId: string | null
  aktivesProfil: KostenvorlageWerte | null
  laedt: boolean
  fehler: string | null

  // Aktionen
  vorlagenLaden: (organisationId: string) => Promise<void>
  anpassungenLaden: (benutzerId: string, vorlageId: string) => Promise<void>
  vorlageWaehlen: (vorlageId: string) => void
  anpassungSetzen: (feld: string, wert: number) => void
  anpassungSpeichern: (benutzerId: string, vorlageId: string) => Promise<void>
  profilZusammenfuehren: () => KostenvorlageWerte | null
}

/** KostenvorlageZeile → KostenvorlageWerte mappen */
function vorlageZuWerten(vorlage: KostenvorlageZeile): KostenvorlageWerte {
  return {
    verbrauchLPro100Km: vorlage.verbrauch_l_pro_100km,
    dieselPreisEurL: vorlage.diesel_preis_eur_l,
    leerkilometerAufschlag: vorlage.leerkilometer_aufschlag,
    stundenlohnEur: vorlage.stundenlohn_eur,
    lenkzeitKorrekturfaktor: vorlage.lenkzeit_korrekturfaktor,
    spesenProTagEur: vorlage.spesen_pro_tag_eur,
    uebernachtungEur: vorlage.uebernachtung_eur,
    mautDeutschlandEurProKm: vorlage.maut_deutschland_eur_pro_km,
    eurovignetteBetragEur: vorlage.eurovignette_betrag_eur,
    mautAuslandPauschalEurProKm: vorlage.maut_ausland_pauschal_eur_pro_km,
    kfzSteuerMonatlichEur: vorlage.kfz_steuer_monatlich_eur,
    huAuMonatlichEur: vorlage.hu_au_monatlich_eur,
    versicherungMonatlichEur: vorlage.versicherung_monatlich_eur,
    leasingAbschreibungMonatlichEur: vorlage.leasing_abschreibung_monatlich_eur,
    wartungMonatlichEur: vorlage.wartung_monatlich_eur,
  }
}

export const useKostenprofilStore = create<KostenprofilZustand>((set, get) => ({
  vorlagen: [],
  anpassungen: [],
  aktiveVorlageId: null,
  aktivesProfil: null,
  laedt: false,
  fehler: null,

  vorlagenLaden: async (organisationId: string) => {
    set({ laedt: true, fehler: null })
    const { data, error } = await supabase
      .from(TABELLEN.KOSTENVORLAGEN)
      .select('*')
      .eq('organisation_id', organisationId)
      .eq('ist_aktiv', true)
      .order('bezeichnung')

    if (error) {
      set({ laedt: false, fehler: error.message })
      return
    }

    set({ vorlagen: data ?? [], laedt: false })

    // Erste Vorlage automatisch aktivieren
    if (data && data.length > 0 && !get().aktiveVorlageId) {
      get().vorlageWaehlen((data[0] as Record<string, unknown>).id as string)
    }
  },

  anpassungenLaden: async (benutzerId: string, vorlageId: string) => {
    const { data, error } = await supabase
      .from(TABELLEN.PERSOENLICHE_ANPASSUNGEN)
      .select('*')
      .eq('benutzer_id', benutzerId)
      .eq('kostenvorlage_id', vorlageId)

    if (error) {
      console.error('[KostenprofilStore] Anpassungen laden fehlgeschlagen:', error.message)
      return
    }

    set({ anpassungen: data ?? [] })
    get().profilZusammenfuehren()
  },

  vorlageWaehlen: (vorlageId: string) => {
    set({ aktiveVorlageId: vorlageId })
    get().profilZusammenfuehren()
  },

  anpassungSetzen: (feld: string, wert: number) => {
    const { anpassungen, aktiveVorlageId } = get()
    if (!aktiveVorlageId) return

    const vorhanden = anpassungen.findIndex((a) => a.feld === feld)
    if (vorhanden >= 0) {
      const aktualisiert = [...anpassungen]
      aktualisiert[vorhanden] = { ...aktualisiert[vorhanden], wert }
      set({ anpassungen: aktualisiert })
    } else {
      set({
        anpassungen: [
          ...anpassungen,
          {
            id: `temp-${feld}`,
            benutzer_id: '',
            kostenvorlage_id: aktiveVorlageId,
            feld,
            wert,
            erstellt_am: '',
            aktualisiert_am: '',
          },
        ],
      })
    }
    get().profilZusammenfuehren()
  },

  anpassungSpeichern: async (benutzerId: string, vorlageId: string) => {
    const { anpassungen } = get()

    for (const anpassung of anpassungen) {
      if (anpassung.id.startsWith('temp-')) {
        // Neue Anpassung einfügen
        await supabase.from(TABELLEN.PERSOENLICHE_ANPASSUNGEN).insert({
          benutzer_id: benutzerId,
          kostenvorlage_id: vorlageId,
          feld: anpassung.feld,
          wert: anpassung.wert,
        } as never)
      } else {
        // Bestehende aktualisieren
        await supabase
          .from(TABELLEN.PERSOENLICHE_ANPASSUNGEN)
          .update({ wert: anpassung.wert } as never)
          .eq('id', anpassung.id)
      }
    }

    // Anpassungen neu laden
    await get().anpassungenLaden(benutzerId, vorlageId)
  },

  profilZusammenfuehren: () => {
    const { vorlagen, anpassungen, aktiveVorlageId } = get()
    const vorlage = vorlagen.find((v) => v.id === aktiveVorlageId)
    if (!vorlage) return null

    const basis = vorlageZuWerten(vorlage)
    const zusammengefuehrt = { ...basis }

    for (const anpassung of anpassungen) {
      if (anpassung.feld in zusammengefuehrt) {
        // DB-Spaltenname → Profil-Feldname Mapping
        const mapping: Record<string, keyof KostenvorlageWerte> = {
          verbrauch_l_pro_100km: 'verbrauchLPro100Km',
          diesel_preis_eur_l: 'dieselPreisEurL',
          leerkilometer_aufschlag: 'leerkilometerAufschlag',
          stundenlohn_eur: 'stundenlohnEur',
          lenkzeit_korrekturfaktor: 'lenkzeitKorrekturfaktor',
          spesen_pro_tag_eur: 'spesenProTagEur',
          uebernachtung_eur: 'uebernachtungEur',
          maut_deutschland_eur_pro_km: 'mautDeutschlandEurProKm',
          eurovignette_betrag_eur: 'eurovignetteBetragEur',
          maut_ausland_pauschal_eur_pro_km: 'mautAuslandPauschalEurProKm',
          kfz_steuer_monatlich_eur: 'kfzSteuerMonatlichEur',
          hu_au_monatlich_eur: 'huAuMonatlichEur',
          versicherung_monatlich_eur: 'versicherungMonatlichEur',
          leasing_abschreibung_monatlich_eur: 'leasingAbschreibungMonatlichEur',
          wartung_monatlich_eur: 'wartungMonatlichEur',
        }
        const profilFeld = mapping[anpassung.feld]
        if (profilFeld) {
          zusammengefuehrt[profilFeld] = anpassung.wert as never
        }
      }
    }

    set({ aktivesProfil: zusammengefuehrt })
    return zusammengefuehrt
  },
}))
