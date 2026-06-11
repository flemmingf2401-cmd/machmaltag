/**
 * Background Service Worker für die MachMalTag Chrome Extension.
 *
 * Verantwortlichkeiten:
 * - OSRM-Routing-Aufrufe proxyen (CORS-Probleme im Content Script vermeiden)
 * - Supabase Auth-Token-Refresh
 * - Kostenprofile in chrome.storage.local cachen
 * - Nachrichten zwischen Content Script und Popup verarbeiten
 */

// ==================
// Nachrichtentypen
// ==================

type HintergrundNachricht =
  | { typ: 'route_berechnen'; von: string; nach: string }
  | { typ: 'kostenprofil_aktualisieren'; profil: Record<string, unknown> }
  | { typ: 'auth_session'; session: Record<string, unknown> }
  | { typ: 'auth_status_abfragen' }

type HintergrundAntwort =
  | { typ: 'route_ergebnis'; daten: RouteDaten | null; fehler: string | null }
  | { typ: 'kostenprofil_gepeichert'; erfolg: boolean }
  | { typ: 'auth_bestaetigt'; angemeldet: boolean }
  | { typ: 'auth_abgelaufen' }

interface RouteDaten {
  distanzKm: number
  fahrzeitStunden: number
  laender: string[]
  distanzProLand: Record<string, number>
}

// ==================
// OSRM Routing Proxy
// ==================

async function routeBerechnen(von: string, nach: string): Promise<{ daten: RouteDaten | null; fehler: string | null }> {
  try {
    // Nominatim Geocoding
    const vonKoord = await geocode(von)
    const nachKoord = await geocode(nach)

    if (!vonKoord || !nachKoord) {
      return { daten: null, fehler: 'Ort konnte nicht gefunden werden' }
    }

    // OSRM Routing
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${vonKoord[0]},${vonKoord[1]};${nachKoord[0]},${nachKoord[1]}?overview=false`

    const response = await fetch(osrmUrl)
    if (!response.ok) {
      return { daten: null, fehler: `Routing-Fehler: HTTP ${response.status}` }
    }

    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes?.length) {
      return { daten: null, fehler: 'Keine Route gefunden' }
    }

    const route = data.routes[0]
    const distanzKm = Math.round((route.distance / 1000) * 10) / 10
    const fahrzeitStunden = Math.round((route.duration / 3600) * 100) / 100

    return {
      daten: {
        distanzKm,
        fahrzeitStunden,
        laender: ['DE'], // Heuristik, wie in routing.ts
        distanzProLand: { DE: distanzKm },
      },
      fehler: null,
    }
  } catch (error) {
    return { daten: null, fehler: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}

async function geocode(suche: string): Promise<[number, number] | null> {
  // Prüfen ob PLZ (5 Ziffern)
  const istPlz = /^\d{5}$/.test(suche.trim())
  const url = istPlz
    ? `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(suche)}&countrycodes=de&format=json&limit=1`
    : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(suche)}&countrycodes=de&format=json&limit=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MachMalTag-RentabilitaetsRechner/1.0',
    },
  })

  if (!response.ok) return null

  const data = await response.json()
  if (!data.length) return null

  return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
}

// ==================
// Message Handler
// ==================

chrome.runtime.onMessage.addListener((nachricht, _absender, sendResponse) => {
  const msg = nachricht as HintergrundNachricht

  switch (msg.typ) {
    case 'route_berechnen': {
      routeBerechnen(msg.von, msg.nach).then((ergebnis) => {
        const antwort: HintergrundAntwort = { typ: 'route_ergebnis', ...ergebnis }
        sendResponse(antwort)
      })
      return true // asynchrone Antwort
    }

    case 'kostenprofil_aktualisieren': {
      chrome.storage.local.set({ kostenprofil: msg.profil }, () => {
        const antwort: HintergrundAntwort = { typ: 'kostenprofil_gepeichert', erfolg: true }
        sendResponse(antwort)
      })
      return true
    }

    case 'auth_session': {
      chrome.storage.local.set({ supabaseSession: msg.session }, () => {
        const antwort: HintergrundAntwort = { typ: 'auth_bestaetigt', angemeldet: true }
        sendResponse(antwort)
      })
      return true
    }

    case 'auth_status_abfragen': {
      chrome.storage.local.get('supabaseSession', (result) => {
        const antwort: HintergrundAntwort = {
          typ: 'auth_bestaetigt',
          angemeldet: !!result.supabaseSession,
        }
        sendResponse(antwort)
      })
      return true
    }
  }

  return false
})

// ==================
// Extension Install / Update
// ==================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[MachMalTag] Extension installiert')
    // Standard-Werte setzen
    chrome.storage.local.set({
      kostenprofil: null,
      supabaseSession: null,
    })
  } else if (details.reason === 'update') {
    console.log('[MachMalTag] Extension aktualisiert')
  }
})

// ==================
// Token Refresh (alle 5 Minuten)
// ==================

setInterval(async () => {
  const { supabaseSession } = await chrome.storage.local.get('supabaseSession')
  if (!supabaseSession) return

  // Session-Gültigkeit prüfen
  const ablauf = new Date((supabaseSession as Record<string, number>).expires_at * 1000)
  if (ablauf.getTime() < Date.now() + 5 * 60 * 1000) {
    // Token läuft in < 5 Min ab — nicht mehr gültig
    console.warn('[MachMalTag] Session abgelaufen')
    await chrome.storage.local.remove('supabaseSession')
  }
}, 5 * 60 * 1000)
