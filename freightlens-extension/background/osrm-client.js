/**
 * OSRM-Routing-Client für FreightLens Background Service Worker.
 *
 * Portiert aus: src/geteilt/osrm/routing.ts
 * Vereinfacht für Extension-Kontext:
 * - Kein TypeScript, kein ES-Module-Import
 * - fetch ist im Service Worker verfügbar
 * - Cache geht beim SW-Neustart verloren (akzeptabel für v1)
 *
 * Wichtige Hinweise:
 * - Nominatim: max 1 Request/Sekunde (Rate-Limit)
 * - OSRM: öffentliche Demo-Instanz, nicht für hohes Volumen
 */

// ==================
// Konfiguration
// ==================

const OSRM_BASE_URL = 'https://router.project-osrm.org'
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
const NOMINATIM_MIN_ABSTAND_MS = 1100 // 1,1 s Sicherheitsabstand

// ==================
// Rate-Limiting
// ==================

let letzterNominatimAufruf = 0

/**
 * Nominatim Rate-Limiting: min. 1,1 s zwischen Requests.
 * @returns {Promise<void>}
 */
async function nominatimRateLimit() {
  const jetzt = Date.now()
  const vergangen = jetzt - letzterNominatimAufruf
  if (vergangen < NOMINATIM_MIN_ABSTAND_MS) {
    await sleep(NOMINATIM_MIN_ABSTAND_MS - vergangen)
  }
  letzterNominatimAufruf = Date.now()
}

/**
 * Hilfsfunktion: sleep.
 * @param {number} ms - Millisekunden
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==================
// Geocoding
// ==================

/** In-Memory-Geocoding-Cache (geht bei SW-Neustart verloren) */
const geocodingCache = new Map()

/**
 * PLZ in Koordinaten umwandeln.
 * Sucht mit Land-Präfix für genauere Ergebnisse.
 *
 * @param {string} plz - Postleitzahl (5 Ziffern)
 * @param {string} [laenderCode='de'] - ISO 3166-1 alpha-2 (Kleinbuchstaben)
 * @returns {Promise<{laengengrad: number, breitengrad: number}>}
 */
async function geocodePlz(plz, laenderCode = 'de') {
  // Cache prüfen
  const cacheKey = `geocode_${laenderCode}_${plz}`
  const gecacht = geocodingCache.get(cacheKey)
  if (gecacht) return gecacht

  await nominatimRateLimit()

  const url = `${NOMINATIM_BASE_URL}/search?postalcode=${encodeURIComponent(plz)}&countrycodes=${laenderCode}&format=json&limit=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FreightLens-Extension/1.0',
      'Accept-Language': 'de',
    },
  })

  if (!response.ok) {
    throw new Error(`Geocoding-Fehler: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.length) {
    throw new Error(`PLZ ${plz} (Land: ${laenderCode}) nicht gefunden`)
  }

  const ergebnis = {
    laengengrad: parseFloat(data[0].lon),
    breitengrad: parseFloat(data[0].lat),
  }

  geocodingCache.set(cacheKey, ergebnis)
  return ergebnis
}

/**
 * Ortsnamen in Koordinaten umwandeln.
 * Fallback wenn keine PLZ verfügbar.
 *
 * @param {string} ort - Ortsname
 * @param {string} [laenderCode='de']
 * @returns {Promise<{laengengrad: number, breitengrad: number}>}
 */
async function geocodeOrt(ort, laenderCode = 'de') {
  const cacheKey = `geocode_ort_${laenderCode}_${ort}`
  const gecacht = geocodingCache.get(cacheKey)
  if (gecacht) return gecacht

  await nominatimRateLimit()

  const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(ort)}&countrycodes=${laenderCode}&format=json&limit=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FreightLens-Extension/1.0',
      'Accept-Language': 'de',
    },
  })

  if (!response.ok) {
    throw new Error(`Geocoding-Fehler: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.length) {
    throw new Error(`Ort "${ort}" nicht gefunden`)
  }

  const ergebnis = {
    laengengrad: parseFloat(data[0].lon),
    breitengrad: parseFloat(data[0].lat),
  }

  geocodingCache.set(cacheKey, ergebnis)
  return ergebnis
}

// ==================
// OSRM Routing
// ==================

/**
 * Route zwischen zwei Koordinaten berechnen.
 *
 * @param {object} von - Startkoordinaten { laengengrad, breitengrad }
 * @param {object} nach - Zielkoordinaten { laengengrad, breitengrad }
 * @returns {Promise<{distanzKm: number, fahrzeitSekunden: number}>}
 */
async function routeBerechnen(von, nach) {
  const url = `${OSRM_BASE_URL}/route/v1/driving/${von.laengengrad},${von.breitengrad};${nach.laengengrad},${nach.breitengrad}?overview=full&steps=true&annotations=true`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`OSRM-Fehler: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`Keine Route gefunden: ${data.message ?? 'Unbekannter Fehler'}`)
  }

  const route = data.routes[0]

  return {
    distanzKm: Math.round((route.distance / 1000) * 10) / 10,
    fahrzeitSekunden: route.duration,
  }
}

// ==================
// Länder-Erkennung (Heuristik)
// ==================

/**
 * Versucht die durchfahrenen Länder aus Koordinaten + Distanz zu ermitteln.
 * Fallback: Nur DE wenn keine weiteren Informationen verfügbar.
 *
 * @param {object} vonKoordinaten - Start { laengengrad, breitengrad }
 * @param {object} nachKoordinaten - Ziel { laengengrad, breitengrad }
 * @param {number} distanzKm - Gesamtdistanz
 * @returns {{ laender: string[], distanzProLand: object }}
 */
function laenderAusRouteExtrahieren(vonKoordinaten, nachKoordinaten, distanzKm) {
  const istInDeutschland = (k) =>
    k.breitengrad >= 47 && k.breitengrad <= 55 &&
    k.laengengrad >= 6 && k.laengengrad <= 15

  const vonInDE = istInDeutschland(vonKoordinaten)
  const nachInDE = istInDeutschland(nachKoordinaten)

  if (vonInDE && nachInDE) {
    // Beide in DE — könnte aber durch AT/CH/NL/BE gehen
    // Für > 600km südliche Routen nehmen wir AT an
    if (distanzKm > 600 && vonKoordinaten.breitengrad < 50 && nachKoordinaten.breitengrad < 48) {
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
// Hauptfunktion
// ==================

/**
 * Komplette Route zwischen zwei Orten/PLZ berechnen.
 *
 * @param {string} von - Startort (PLZ oder Ortsname)
 * @param {string} nach - Zielort (PLZ oder Ortsname)
 * @param {boolean} [istPlz=true] - Ob die Eingaben PLZ sind
 * @returns {Promise<object>} RouteErgebnis
 */
async function berechneRoute(von, nach, istPlz = true) {
  // Geocoding
  const vonKoord = istPlz ? await geocodePlz(von) : await geocodeOrt(von)
  const nachKoord = istPlz ? await geocodePlz(nach) : await geocodeOrt(nach)

  // Routing
  const route = await routeBerechnen(vonKoord, nachKoord)

  // Länder-Erkennung
  const { laender, distanzProLand } = laenderAusRouteExtrahieren(
    vonKoord, nachKoord, route.distanzKm
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

/**
 * Prüfen ob ein String wie eine PLZ aussieht (5 Ziffern).
 *
 * @param {string} wert
 * @returns {boolean}
 */
function istPlzFormat(wert) {
  return /^\d{5}$/.test(wert.trim())
}
