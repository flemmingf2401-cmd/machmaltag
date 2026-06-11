/**
 * TIMOCOM DOM-Scraper für FreightLens.
 *
 * Extrahiert Angebotsdaten aus dem TIMOCOM-Freight-Exchange-DOM.
 * Unterstützt zwei Selektor-Sets:
 * 1. Demo-Seite (demo.html) — via data-*-Attribute
 * 2. TIMOCOM Produktion — via CSS-Klassen (muss bei DOM-Änderungen aktualisiert werden)
 *
 * Robustes Scraping: Fehlende Selektoren → graceful fallback, kein Crash.
 */

// ==================
// Selektor-Konfiguration
// ==================

/**
 * Selektoren für die Demo-Seite (stabil, via data-Attribute).
 */
const DEMO_SELEKTOREN = {
  angebotKarte: '.tc-angebot',
  ladeort: '[data-fl-ladeort]',
  ladeortPlz: '[data-fl-ladeort-plz]',
  entladeort: '[data-fl-entladeort]',
  entladeortPlz: '[data-fl-entladeort-plz]',
  distanz: '[data-fl-distanz]',
  preis: '[data-fl-preis]',
  gewicht: '[data-fl-gewicht]',
  ladung: '[data-fl-ladung]',
}

/**
 * Selektoren für TIMOCOM Produktion.
 * WARNUNG: Diese Selektoren können sich bei TIMOCOM-Updates ändern.
 * Bei Breakage: nur diese Konfiguration anpassen, nicht den Scraper-Code.
 */
const TIMOCOM_SELEKTOREN = {
  angebotKarte: '.freight-item, [data-testid="freight-card"], .offer-card',
  ladeort: '.loading-place, [data-testid="loading-city"]',
  ladeortPlz: '.loading-zip, [data-testid="loading-zip"]',
  entladeort: '.unloading-place, [data-testid="unloading-city"]',
  entladeortPlz: '.unloading-zip, [data-testid="unloading-zip"]',
  distanz: '.distance, [data-testid="distance"]',
  preis: '.price, [data-testid="price"]',
  gewicht: '.weight, [data-testid="weight"]',
  ladung: '.load-type, [data-testid="load-type"]',
}

// ==================
// Hilfsfunktionen
// ==================

/**
 * Prüft ob wir uns auf der Demo-Seite befinden.
 * @returns {boolean}
 */
function istDemoSeite() {
  return document.getElementById('freightlens-demo-flag') !== null
}

/**
 * Text aus einem Element sicher extrahieren.
 * Versucht mehrere Selektoren (komma-separiert).
 *
 * @param {Element} karte - Die Angebotskarte
 * @param {string} selektor - Komma-separierte Selektorliste
 * @param {string} [attribut] - Falls angegeben, Attribut statt textContent lesen
 * @returns {string} Extrahierter Text oder leerer String
 */
function textExtrahieren(karte, selektor, attribut = null) {
  if (!selektor) return ''

  const selektoren = selektor.split(',').map((s) => s.trim())

  for (const sel of selektoren) {
    try {
      const element = karte.querySelector(sel)
      if (element) {
        if (attribut) {
          return (element.getAttribute(attribut) || '').trim()
        }
        return (element.textContent || '').trim()
      }
    } catch (e) {
      // Ungültiger Selektor — weiter versuchen
      continue
    }
  }

  return ''
}

/**
 * Preis-String in Zahl umwandeln.
 * "1.450,00 €" → 1450.00
 *
 * @param {string} text
 * @returns {number}
 */
function preisParsen(text) {
  if (!text) return 0
  // "1.450,00 €" → "1450.00"
  const bereinigt = text
    .replace(/[^\d.,\-]/g, '') // Alles außer Zahlen, Komma, Punkt, Minus entfernen
    .replace(/\./g, '') // Tausendertrennpunkte entfernen
    .replace(',', '.') // Komma → Punkt
  const wert = parseFloat(bereinigt)
  return isNaN(wert) ? 0 : wert
}

/**
 * Distanz-String in Zahl umwandeln.
 * "790 km" → 790
 *
 * @param {string} text
 * @returns {number}
 */
function distanzParsen(text) {
  if (!text) return 0
  const wert = parseInt(text.replace(/[^\d]/g, ''), 10)
  return isNaN(wert) ? 0 : wert
}

/**
 * Gewichts-String in Zahl umwandeln.
 * "24.000 kg" → 24000
 *
 * @param {string} text
 * @returns {number}
 */
function gewichtParsen(text) {
  if (!text) return 0
  const bereinigt = text.replace(/\./g, '').replace(/[^\d]/g, '')
  const wert = parseInt(bereinigt, 10)
  return isNaN(wert) ? 0 : wert
}

// ==================
// Haupt-Scraping
// ==================

/**
 * Daten-Attribut-Wert aus einer Karte extrahieren (Demo-Modus).
 *
 * @param {Element} karte - Die Angebotskarte
 * @param {string} attribut - data-*-Attributname (ohne "data-fl-" Prefix)
 * @returns {string}
 */
function dataAttributLesen(karte, attribut) {
  return (karte.getAttribute(`data-fl-${attribut}`) || '').trim()
}

/**
 * Ein einzelnes Angebot aus einer Karte scrapen.
 *
 * @param {Element} karte - DOM-Element der Angebotskarte
 * @param {boolean} demo - Ob Demo-Modus aktiv
 * @returns {object} AngebotDaten
 */
function angebotScrapen(karte, demo) {
  // Eindeutige ID für die Karte generieren
  const angebotId =
    karte.getAttribute('data-fl-angebot-id') ||
    `fl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  if (demo) {
    // Demo-Modus: data-Attribute lesen (zuverlässig)
    return {
      angebotId,
      ladeort: dataAttributLesen(karte, 'ladeort'),
      ladeortPlz: dataAttributLesen(karte, 'ladeort-plz'),
      entladeort: dataAttributLesen(karte, 'entladeort'),
      entladeortPlz: dataAttributLesen(karte, 'entladeort-plz'),
      distanzKm: parseInt(dataAttributLesen(karte, 'distanz'), 10) || 0,
      preisEur: parseFloat(dataAttributLesen(karte, 'preis')) || 0,
      gewicht: gewichtParsen(dataAttributLesen(karte, 'gewicht')),
      ladung: dataAttributLesen(karte, 'ladung'),
    }
  }

  // TIMOCOM Produktion: CSS-Selektoren
  return {
    angebotId,
    ladeort: textExtrahieren(karte, TIMOCOM_SELEKTOREN.ladeort),
    ladeortPlz: textExtrahieren(karte, TIMOCOM_SELEKTOREN.ladeortPlz),
    entladeort: textExtrahieren(karte, TIMOCOM_SELEKTOREN.entladeort),
    entladeortPlz: textExtrahieren(karte, TIMOCOM_SELEKTOREN.entladeortPlz),
    distanzKm: distanzParsen(textExtrahieren(karte, TIMOCOM_SELEKTOREN.distanz)),
    preisEur: preisParsen(textExtrahieren(karte, TIMOCOM_SELEKTOREN.preis)),
    gewicht: gewichtParsen(textExtrahieren(karte, TIMOCOM_SELEKTOREN.gewicht)),
    ladung: textExtrahieren(karte, TIMOCOM_SELEKTOREN.ladung),
  }
}

/**
 * Alle sichtbaren Angebote auf der Seite scrapen.
 *
 * @returns {Array<{angebotId: string, karte: Element, daten: object}>}
 */
function alleAngeboteScrapen() {
  const demo = istDemoSeite()
  const selektoren = demo ? DEMO_SELEKTOREN : TIMOCOM_SELEKTOREN

  const karten = document.querySelectorAll(selektoren.angebotKarte)
  const ergebnisse = []

  karten.forEach((karte) => {
    try {
      const daten = angebotScrapen(karte, demo)

      // ID auf Karte setzen für späteren Badge-Zugriff
      karte.setAttribute('data-fl-angebot-id', daten.angebotId)

      ergebnisse.push({ angebotId: daten.angebotId, karte, daten })
    } catch (e) {
      console.warn('[FreightLens Scraper] Fehler beim Scraping einer Karte:', e)
    }
  })

  console.log(`[FreightLens Scraper] ${ergebnisse.length} Angebote gescrapt (${demo ? 'Demo' : 'TIMOCOM'}-Modus)`)
  return ergebnisse
}
