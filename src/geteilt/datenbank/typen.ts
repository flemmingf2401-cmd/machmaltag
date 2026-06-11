/**
 * Datenbank-Typen — Abbild der Supabase-Tabellenstruktur.
 *
 * Wird für typisierte Supabase-Abfragen verwendet.
 * Muss manuell mit dem Schema synchron gehalten werden,
 * bis Supabase CLI auto-generation eingerichtet ist.
 */

// ==================
// Database-Interface (Supabase Client v2 Format)
// ==================

export interface Database {
  public: {
    Tables: {
      organisationen: {
        Row: OrganisationZeile
        Insert: OrganisationEinfuegen
        Update: OrganisationAktualisierung
        Relationships: []
      }
      benutzer: {
        Row: BenutzerZeile
        Insert: BenutzerEinfuegen
        Update: BenutzerAktualisierung
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          isOneToOne: boolean
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      fahrzeugtypen: {
        Row: FahrzeugtypZeile
        Insert: FahrzeugtypEinfuegen
        Update: FahrzeugtypAktualisierung
        Relationships: []
      }
      kostenvorlagen: {
        Row: KostenvorlageZeile
        Insert: KostenvorlageEinfuegen
        Update: KostenvorlageAktualisierung
        Relationships: []
      }
      persoenliche_anpassungen: {
        Row: PersoenlicheAnpassungZeile
        Insert: PersoenlicheAnpassungEinfuegen
        Update: PersoenlicheAnpassungAktualisierung
        Relationships: []
      }
      maut_tabelle: {
        Row: MautTabelleZeile
        Insert: MautTabelleEinfuegen
        Update: MautTabelleAktualisierung
        Relationships: []
      }
      bewertete_angebote: {
        Row: BewertetesAngebotZeile
        Insert: BewertetesAngebotEinfuegen
        Update: BewertetesAngebotAktualisierung
        Relationships: []
      }
      diesel_preise: {
        Row: DieselPreisZeile
        Insert: DieselPreisEinfuegen
        Update: DieselPreisAktualisierung
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ==================
// Organisation
// ==================

export interface OrganisationZeile {
  id: string
  name: string
  slug: string
  erstellt_am: string
  aktualisiert_am: string
}
export type OrganisationEinfuegen = Omit<OrganisationZeile, 'id' | 'erstellt_am' | 'aktualisiert_am'>
export type OrganisationAktualisierung = Partial<OrganisationEinfuegen>

// ==================
// Benutzer
// ==================

export type BenutzerRolle = 'admin' | 'disponent'

export interface BenutzerZeile {
  id: string
  organisation_id: string
  vorname: string
  nachname: string
  email: string
  rolle: BenutzerRolle
  aktiv: boolean
  erstellt_am: string
  aktualisiert_am: string
}
export type BenutzerEinfuegen = Omit<BenutzerZeile, 'erstellt_am' | 'aktualisiert_am'>
export type BenutzerAktualisierung = Partial<Omit<BenutzerEinfuegen, 'id'>>

// ==================
// Fahrzeugtyp
// ==================

export interface FahrzeugtypZeile {
  id: string
  organisation_id: string
  bezeichnung: string
  gewicht_kg: number
  euro_klasse: number
  achsen: number
  standardprofil_id: string | null
  erstellt_am: string
}
export type FahrzeugtypEinfuegen = Omit<FahrzeugtypZeile, 'id' | 'erstellt_am'>
export type FahrzeugtypAktualisierung = Partial<Omit<FahrzeugtypEinfuegen, 'organisation_id'>>

// ==================
// Kostenvorlage
// ==================

export interface KostenvorlageZeile {
  id: string
  organisation_id: string
  bezeichnung: string
  fahrzeugtyp_id: string | null
  version: number
  verbrauch_l_pro_100km: number
  diesel_preis_eur_l: number
  leerkilometer_aufschlag: number
  stundenlohn_eur: number
  lenkzeit_korrekturfaktor: number
  spesen_pro_tag_eur: number
  uebernachtung_eur: number
  maut_deutschland_eur_pro_km: number
  eurovignette_betrag_eur: number
  maut_ausland_pauschal_eur_pro_km: number
  kfz_steuer_monatlich_eur: number
  hu_au_monatlich_eur: number
  versicherung_monatlich_eur: number
  leasing_abschreibung_monatlich_eur: number
  wartung_monatlich_eur: number
  ist_aktiv: boolean
  erstellt_von: string | null
  erstellt_am: string
  aktualisiert_am: string
}
export type KostenvorlageEinfuegen = Omit<KostenvorlageZeile, 'id' | 'erstellt_am' | 'aktualisiert_am'>
export type KostenvorlageAktualisierung = Partial<Omit<KostenvorlageEinfuegen, 'organisation_id'>>

// ==================
// Persönliche Anpassung
// ==================

export interface PersoenlicheAnpassungZeile {
  id: string
  benutzer_id: string
  kostenvorlage_id: string
  feld: string
  wert: number
  erstellt_am: string
  aktualisiert_am: string
}
export type PersoenlicheAnpassungEinfuegen = Omit<PersoenlicheAnpassungZeile, 'id' | 'erstellt_am' | 'aktualisiert_am'>
export type PersoenlicheAnpassungAktualisierung = Partial<Omit<PersoenlicheAnpassungEinfuegen, 'benutzer_id' | 'kostenvorlage_id'>>

// ==================
// Maut-Tabelle
// ==================

export type Tariftyp = 'pro_km' | 'pauschal_pro_trip' | 'pro_tag'

export interface MautTabelleZeile {
  id: string
  organisation_id: string
  land_code: string
  fahrzeugtyp_id: string | null
  tariftyp: Tariftyp
  betrag_eur: number
  gueltig_ab: string
  gueltig_bis: string | null
  erstellt_am: string
}
export type MautTabelleEinfuegen = Omit<MautTabelleZeile, 'id' | 'erstellt_am'>
export type MautTabelleAktualisierung = Partial<Omit<MautTabelleEinfuegen, 'organisation_id'>>

// ==================
// Bewertetes Angebot
// ==================

export type Entscheidung = 'angenommen' | 'abgelehnt' | 'offen'

export interface BewertetesAngebotZeile {
  id: string
  benutzer_id: string
  organisation_id: string
  kostenvorlage_id: string
  timocom_angebot_id: string | null
  ladung: string | null
  ladeort: string
  entladeort: string
  ladeort_plz: string | null
  entladeort_plz: string | null
  distanz_km: number | null
  preis_eur: number
  fahrzeugtyp: string
  ist_leerfahrt: boolean
  verdraengungskosten_eur: number
  kosten_diesel_eur: number | null
  kosten_fahrer_eur: number | null
  kosten_maut_eur: number | null
  kosten_fixkosten_eur: number | null
  kosten_gesamt_eur: number
  marge_eur: number
  marge_prozent: number
  entscheidung: Entscheidung | null
  entscheidung_grund: string | null
  bewertet_am: string
}
export type BewertetesAngebotEinfuegen = Omit<BewertetesAngebotZeile, 'id' | 'bewertet_am'>
export type BewertetesAngebotAktualisierung = Partial<Omit<BewertetesAngebotEinfuegen, 'benutzer_id' | 'organisation_id'>>

// ==================
// Diesel-Preis
// ==================

export interface DieselPreisZeile {
  id: string
  land_code: string
  preis_eur_l: number
  quelle: string
  gueltig_am: string
  erstellt_am: string
}
export type DieselPreisEinfuegen = Omit<DieselPreisZeile, 'id' | 'erstellt_am'>
export type DieselPreisAktualisierung = Partial<Omit<DieselPreisEinfuegen, 'land_code'>>
