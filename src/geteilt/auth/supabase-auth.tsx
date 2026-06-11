/**
 * Auth-Provider für die MachMalTag Web-App.
 *
 * Bietet:
 * - useAuth() Hook für Komponenten
 * - Login/Logout/Registrierung
 * - Session-Management via Supabase Auth
 * - Benutzerprofil aus der benutzer-Tabelle
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/geteilt/datenbank/supabase-client'
import type { BenutzerZeile } from '@/geteilt/datenbank/typen'

// ==================
// Auth-Kontext
// ==================

interface AuthZustand {
  benutzer: User | null
  profil: BenutzerZeile | null
  sitzung: Session | null
  laedt: boolean
  fehler: string | null
}

interface AuthAktionen {
  anmelden: (email: string, passwort: string) => Promise<void>
  registrieren: (email: string, passwort: string, vorname: string, nachname: string) => Promise<void>
  abmelden: () => Promise<void>
  fehlerLoeschen: () => void
}

type AuthKontextWert = AuthZustand & AuthAktionen

const AuthKontext = createContext<AuthKontextWert | null>(null)

// ==================
// Provider
// ==================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [zustand, setZustand] = useState<AuthZustand>({
    benutzer: null,
    profil: null,
    sitzung: null,
    laedt: true,
    fehler: null,
  })

  // Profil aus benutzer-Tabelle laden
  const profilLaden = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('benutzer')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[Auth] Profil konnte nicht geladen werden:', error.message)
      return null
    }
    return data
  }, [])

  // Initial: bestehende Session prüfen
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profil = await profilLaden(session.user.id)
        setZustand({
          benutzer: session.user,
          profil,
          sitzung: session,
          laedt: false,
          fehler: null,
        })
      } else {
        setZustand((prev) => ({ ...prev, laedt: false }))
      }
    })

    // Auf Auth-Änderungen hören
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profil = await profilLaden(session.user.id)
          setZustand({
            benutzer: session.user,
            profil,
            sitzung: session,
            laedt: false,
            fehler: null,
          })
        } else {
          setZustand({
            benutzer: null,
            profil: null,
            sitzung: null,
            laedt: false,
            fehler: null,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [profilLaden])

  // ==================
  // Aktionen
  // ==================

  const anmelden = async (email: string, passwort: string) => {
    setZustand((prev) => ({ ...prev, laedt: true, fehler: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort })
    if (error) {
      setZustand((prev) => ({ ...prev, laedt: false, fehler: fehlerUebersetzen(error.message) }))
      throw error
    }
  }

  const registrieren = async (email: string, passwort: string, vorname: string, nachname: string) => {
    setZustand((prev) => ({ ...prev, laedt: true, fehler: null }))
    const { data, error } = await supabase.auth.signUp({ email, password: passwort })
    if (error) {
      setZustand((prev) => ({ ...prev, laedt: false, fehler: fehlerUebersetzen(error.message) }))
      throw error
    }

    // Benutzer-Profil in der benutzer-Tabelle anlegen
    if (data.user) {
      // Hinweis: organisation_id muss vorab existieren.
      // In der MVP-Phase erstellen wir eine Demo-Organisation beim ersten Benutzer.
      const { error: profilFehler } = await supabase.from('benutzer').insert({
        id: data.user.id,
        organisation_id: (await demoOrganisationErhalten()).id,
        vorname,
        nachname,
        email,
        rolle: 'admin',
      })
      if (profilFehler) {
        console.error('[Auth] Profil-Erstellung fehlgeschlagen:', profilFehler.message)
      }
    }
  }

  const abmelden = async () => {
    await supabase.auth.signOut()
    setZustand({ benutzer: null, profil: null, sitzung: null, laedt: false, fehler: null })
  }

  const fehlerLoeschen = () => {
    setZustand((prev) => ({ ...prev, fehler: null }))
  }

  return (
    <AuthKontext.Provider
      value={{ ...zustand, anmelden, registrieren, abmelden, fehlerLoeschen }}
    >
      {children}
    </AuthKontext.Provider>
  )
}

// ==================
// Hook
// ==================

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthKontextWert {
  const kontext = useContext(AuthKontext)
  if (!kontext) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden')
  }
  return kontext
}

// ==================
// Hilfsfunktionen
// ==================

/** Demo-Organisation für MVP-Zwecke */
async function demoOrganisationErhalten(): Promise<{ id: string }> {
  // Prüfen ob eine Demo-Organisation existiert
  const { data } = await supabase
    .from('organisationen')
    .select('id')
    .eq('slug', 'demo')
    .single()

  if (data) return data

  // Demo-Organisation erstellen
  const { data: neueOrg, error } = await supabase
    .from('organisationen')
    .insert({ name: 'Demo Organisation', slug: 'demo' })
    .select('id')
    .single()

  if (error || !neueOrg) {
    throw new Error('Demo-Organisation konnte nicht erstellt werden')
  }
  return neueOrg
}

/** Supabase-Fehlermeldungen auf Deutsch übersetzen */
function fehlerUebersetzen(nachricht: string): string {
  const uebersetzungen: Record<string, string> = {
    'Invalid login credentials': 'E-Mail oder Passwort sind falsch',
    'User already registered': 'Diese E-Mail ist bereits registriert',
    'Password should be at least 6 characters': 'Das Passwort muss mindestens 6 Zeichen lang sein',
    'Email not confirmed': 'Bitte bestätige deine E-Mail-Adresse',
    'Invalid email': 'Ungültige E-Mail-Adresse',
  }
  return uebersetzungen[nachricht] ?? `Anmeldung fehlgeschlagen: ${nachricht}`
}
