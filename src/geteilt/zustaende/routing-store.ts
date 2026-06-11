/**
 * Routing-Store — Zustand für die OSRM-Routenberechnung.
 *
 * Verwaltet:
 * - Aktuelle Route (Distanz, Fahrzeit, Länder)
 * - Ladezustand und Fehler
 * - Debouncing für Eingaben
 */

import { create } from 'zustand'
import type { RouteErgebnis } from '@/geteilt/osrm/routing'
import { berechneRouteGecacht, istPlzFormat } from '@/geteilt/osrm/routing'

interface RoutingZustand {
  // Zustand
  route: RouteErgebnis | null
  laedt: boolean
  fehler: string | null

  // Aktionen
  routeBerechnen: (von: string, nach: string) => Promise<RouteErgebnis | null>
  routeZuruecksetzen: () => void
  fehlerLoeschen: () => void
}

export const useRoutingStore = create<RoutingZustand>((set) => ({
  route: null,
  laedt: false,
  fehler: null,

  routeBerechnen: async (von: string, nach: string) => {
    // Eingabevalidierung
    const vonBereinigt = von.trim()
    const nachBereinigt = nach.trim()

    if (!vonBereinigt || !nachBereinigt) {
      set({ fehler: 'Bitte gib Start und Ziel ein.' })
      return null
    }

    set({ laedt: true, fehler: null })

    try {
      // Prüfen ob PLZ oder Ortsname
      const vonIstPlz = istPlzFormat(vonBereinigt)
      const nachIstPlz = istPlzFormat(nachBereinigt)

      const ergebnis = await berechneRouteGecacht(
        vonBereinigt,
        nachBereinigt,
        vonIstPlz && nachIstPlz
      )

      set({ route: ergebnis, laedt: false, fehler: null })
      return ergebnis
    } catch (error) {
      const nachricht = error instanceof Error ? error.message : 'Unbekannter Fehler'
      set({ fehler: nachricht, laedt: false, route: null })
      return null
    }
  },

  routeZuruecksetzen: () => {
    set({ route: null, fehler: null })
  },

  fehlerLoeschen: () => {
    set({ fehler: null })
  },
}))
