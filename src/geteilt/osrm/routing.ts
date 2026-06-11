/**
 * OSRM-Routing — Distanz- und Fahrzeitberechnung via OpenStreetMap.
 *
 * Verwendet die öffentliche OSRM-Demo-Instanz für Routing.
 * PLZ-Geocoding über Nominatim (OpenStreetMap).
 *
 * Wichtige Hinweise:
 * - Nominatim: max 1 Request/Sekunde (Rate-Limit)
 * - OSRM: öffentliche Demo, nicht für Produktion mit hohem Volumen
 * - Alle Aufrufe werden gecacht um API-Calls zu minimieren
 * - Für die Chrome Extension gehen OSRM-Aufrufe durch den Background Service Worker
 */

// ==================
// Typen
// ==================

export interface Koordinaten {
  laengengrad: number  // longitude
  breitengrad: number  // latitude
}

export interface RouteErgebnis {
  distanzKm: number
  fahrzeitStunden: number
  laender: string[]
  distanzProLand: Record<string, number>
  vonKoordinaten: Koordinaten
  nachKoordinaten: Koordinaten
}

export class RoutingFehler extends Error {
  constructor(nachricht: string) {
    super(nachricht)
    this.name = 'RoutingFehler'
  }
}

export class GeocodingFehler extends Error {
  constructor(nachricht: string) {
    super(nachricht)
    this.name = 'GeocodingFehler'
  }
}

// ==================
// OSRM Routing
// ==================

const OSRM_BASE_URL = 'https://router.project-osrm.org'

/**
 * Route zwischen zwei Koordinaten berechnen.
 */
async function routeBerechnen(
  von: Koordinaten,
  nach: Koordinaten
): Promise<{ distanzKm: number; fahrzeitSekunden: number; routeDaten: unknown }> {
  const url = `${OSRM_BASE_URL}/route/v1/driving/${von.laengengrad},${von.breitengrad};${nach.laengengrad},${nach.breitengrad}?overview=full&steps=true&annotations=true`

  const response = await fetch(url)
  if (!response.ok) {
    throw new RoutingFehler(`OSRM-Fehler: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new RoutingFehler(`Keine Route gefunden: ${data.message ?? 'Unbekannter Fehler'}`)
  }

  const route = data.routes[0]

  return {
    distanzKm: Math.round((route.distance / 1000) * 10) / 10,
    fahrzeitSekunden: route.duration,
    routeDaten: route,
  }
}

// ==================
// Nominatim Geocoding
// ==================

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

/** Rate-Limit-Queue: max 1 Request/Sekunde für Nominatim */
let letzterNominatimAufruf = 0
const NOMINATIM_MIN_ABSTAND_MS = 1100 // 1,1s Sicherheitsabstand

async function nominatimRateLimit(): Promise<void> {
  const jetzt = Date.now()
  const vergangen = jetzt - letzterNominatimAufruf
  if (vergangen < NOMINATIM_MIN_ABSTAND_MS) {
    await sleep(NOMINATIM_MIN_ABSTAND_MS - vergangen)
  }
  letzterNominatimAufruf = Date.now()
}

/**
 * PLZ in Koordinaten umwandeln.
 * Sucht mit Land-Präfix für genauere Ergebnisse.
 */
export async function geocodePlz(
  plz: string,
  laenderCode: string = 'de'
): Promise<Koordinaten> {
  // Cache prüfen
  const cacheKey = `geocode_${laenderCode}_${plz}`
  const gecacht = geocodingCache.get(cacheKey)
  if (gecacht) return gecacht

  await nominatimRateLimit()

  const url = `${NOMINATIM_BASE_URL}/search?postalcode=${encodeURIComponent(plz)}&countrycodes=${laenderCode}&format=json&limit=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MachMalTag-RentabilitaetsRechner/1.0',
      'Accept-Language': 'de',
    },
  })

  if (!response.ok) {
    throw new GeocodingFehler(`Geocoding-Fehler: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.length) {
    throw new GeocodingFehler(`PLZ ${plz} (Land: ${laenderCode}) nicht gefunden`)
  }

  const ergebnis: Koordinaten = {
    laengengrad: parseFloat(data[0].lon),
    breitengrad: parseFloat(data[0].lat),
  }

  // Im Cache speichern
  geocodingCache.set(cacheKey, ergebnis)

  return ergebnis
}

/**
 * Ortsnamen in Koordinaten umwandeln.
 * Fallback wenn keine PLZ verfügbar.
 */
export async function geocodeOrt(
  ort: string,
  laenderCode: string = 'de'
): Promise<Koordinaten> {
  const cacheKey = `geocode_ort_${laenderCode}_${ort}`
  const gecacht = geocodingCache.get(cacheKey)
  if (gecacht) return gecacht

  await nominatimRateLimit()

  const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(ort)}&countrycodes=${laenderCode}&format=json&limit=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MachMalTag-RentabilitaetsRechner/1.0',
      'Accept-Language': 'de',
    },
  })

  if (!response.ok) {
    throw new GeocodingFehler(`Geocoding-Fehler: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.length) {
    throw new GeocodingFehler(`Ort "${ort}" nicht gefunden`)
  }

  const ergebnis: Koordinaten = {
    laengengrad: parseFloat(data[0].lon),
    breitengrad: parseFloat(data[0].lat),
  }

  geocodingCache.set(cacheKey, ergebnis)

  return ergebnis
}

// ==================
// Länder-Erkennung aus Route
// ==================

/**
 * Versucht die durchfahrenen Länder aus den OSRM-Route-Steps zu ermitteln.
 * Fallback: Nur DE wenn keine weiteren Informationen verfügbar.
 *
 * Die OSRM-Antwort enthält in den Steps teilweise Ländercodes.
 * Da die öffentliche OSRM-Instanz diese nicht immer liefert,
 * nutzen wir eine Heuristik basierend auf der Distanz.
 */
function laenderAusRouteExtrahieren(
  _routeDaten: unknown,
  vonKoordinaten: Koordinaten,
  nachKoordinaten: Koordinaten,
  distanzKm: number
): { laender: string[]; distanzProLand: Record<string, number> } {
  // Heuristik: Wenn Start und Ziel beide in Deutschland liegen (Grobbereich)
  // und die Distanz < 1000km, nehmen wir DE an.
  const istInDeutschland = (k: Koordinaten) =>
    k.breitengrad >= 47 && k.breitengrad <= 55 &&
    k.laengengrad >= 6 && k.laengengrad <= 15

  const vonInDE = istInDeutschland(vonKoordinaten)
  const nachInDE = istInDeutschland(nachKoordinaten)

  // Einfache Heuristik für häufige Transitländer
  if (vonInDE && nachInDE) {
    // Beide in DE — könnte aber durch AT/CH/NL/BE gehen
    // Für > 600km südliche Routen nehmen wir AT an
    if (distanzKm > 600 && vonKoordinaten.breitengrad < 50 && nachKoordinaten.breitengrad < 48) {
      // Südliche Route durch Österreich
      const deAnteil = Math.round(distanzKm * 0.75)
      const atAnteil = distanzKm - deAnteil
      return {
        laender: ['DE', 'AT'],
        distanzProLand: { DE: deAnteil, AT: atAnteil },
      }
    }

    return {
      laender: ['DE'],
      distanzProLand: { DE: distanzKm },
    }
  }

  // Fallback: Nur DE
  return {
    laender: ['DE'],
    distanzProLand: { DE: distanzKm },
  }
}

// ==================
// Hauptfunktion: Route berechnen
// ==================

/**
 * Komplette Route zwischen zwei Orten/PLZ berechnen.
 *
 * @param von - Startort (PLZ oder Ortsname)
 * @param nach - Zielort (PLZ oder Ortsname)
 * @param istPlz - Ob die Eingaben PLZ sind (Standard: true)
 * @returns RouteErgebnis mit Distanz, Fahrzeit und Länder-Info
 */
export async function berechneRoute(
  von: string,
  nach: string,
  istPlz: boolean = true
): Promise<RouteErgebnis> {
  // Geocoding
  const vonKoord = istPlz
    ? await geocodePlz(von)
    : await geocodeOrt(von)

  const nachKoord = istPlz
    ? await geocodePlz(nach)
    : await geocodeOrt(nach)

  // Routing
  const route = await routeBerechnen(vonKoord, nachKoord)

  // Länder-Erkennung
  const { laender, distanzProLand } = laenderAusRouteExtrahieren(
    route.routeDaten,
    vonKoord,
    nachKoord,
    route.distanzKm
  )

  return {
    distanzKm: route.distanzKm,
    fahrzeitStunden: Math.round((route.fahrzeitSekunden / 3600) * 100) / 100,
    laender,
    distanzProLand,
    vonKoordinaten: vonKoord,
    nachKoordinaten: nachKoord,
  }
}

// ==================
// Caching
// ==================

const geocodingCache = new Map<string, Koordinaten>()
const routeCache = new Map<string, { ergebnis: RouteErgebnis; zeitstempel: number }>()
const ROUTE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 Tage

/**
 * Route mit Cache berechnen.
 * Gleiches Start/Ziel liefert das gecachte Ergebnis ohne API-Aufruf.
 */
export async function berechneRouteGecacht(
  von: string,
  nach: string,
  istPlz: boolean = true
): Promise<RouteErgebnis> {
  const cacheKey = `${von}_${nach}_${istPlz ? 'plz' : 'ort'}`
  const gecacht = routeCache.get(cacheKey)

  if (gecacht && Date.now() - gecacht.zeitstempel < ROUTE_CACHE_TTL_MS) {
    return gecacht.ergebnis
  }

  const ergebnis = await berechneRoute(von, nach, istPlz)
  routeCache.set(cacheKey, { ergebnis, zeitstempel: Date.now() })

  return ergebnis
}

/**
 * Cache leeren (z.B. bei Änderungen).
 */
export function cacheLeeren(): void {
  geocodingCache.clear()
  routeCache.clear()
}

// ==================
// Hilfsfunktionen
// ==================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Prüfen ob ein String wie eine PLZ aussieht (5 Ziffern).
 */
export function istPlzFormat(wert: string): boolean {
  return /^\d{5}$/.test(wert.trim())
}
