/**
 * Background Service Worker für FreightLens.
 *
 * Zentrale Nachrichtenkoordination zwischen:
 * - Content Script (Scraper + Badge)
 * - Sidebar (Kostenaufschlüsselung)
 * - Popup (Status + Statistik)
 *
 * Zustandslos: Alle persistenten Daten in chrome.storage.local.
 * Der Service Worker kann jederzeit einschlafen — beim Aufwecken
 * wird der Zustand aus Storage neu geladen.
 */

// Skripte laden (importScripts für Service Worker)
importScripts(
  '../shared/formatierung.js',
  '../shared/nachrichten.js',
  '../calculator/profilkonstanten.js',
  '../calculator/tariffdaten.js',
  '../calculator/kosten.js',
  './osrm-client.js',
  './storage.js'
)

// ==================
// Nachrichten-Handler
// ==================

chrome.runtime.onMessage.addListener((nachricht, sender, sendResponse) => {
  // Async-Handler: true zurückgeben um sendResponse asynchron zu nutzen
  handleMessage(nachricht, sender, sendResponse)
  return true // Keep message channel open for async response
})

/**
 * Zentrale Nachrichtenverarbeitung.
 *
 * @param {object} nachricht - Nachricht mit { type, daten }
 * @param {chrome.runtime.MessageSender} sender
 * @param {function} sendResponse
 */
async function handleMessage(nachricht, sender, sendResponse) {
  try {
    switch (nachricht.type) {
      // === Angebot aus Content Script ===
      case MSG.ANGEBOT_GESCRAPT: {
        const ergebnis = await angebotBewerten(nachricht.daten)
        // Ergebnis zurück ans Content Script für Badge-Injection
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: MSG.BERECHNUNG_ERGEBNIS,
            daten: { angebotId: nachricht.daten.angebotId, ergebnis },
          })
        }
        // Ergebnis in Historie speichern
        await historieSpeichern({
          angebot: nachricht.daten,
          ergebnis,
        })
        sendResponse({ erfolg: true, ergebnis })
        break
      }

      // === Angebot angeklickt (für Sidebar) ===
      case MSG.ANGEBOT_ANGEKLICKT: {
        await letztesAngebotSpeichern(nachricht.daten)
        sendResponse({ erfolg: true })
        break
      }

      // === Kostenprofil ===
      case MSG.PROFIL_LADEN: {
        const profil = await profilLaden()
        sendResponse({ erfolg: true, profil })
        break
      }

      case MSG.PROFIL_SPEICHERN: {
        await profilSpeichern(nachricht.daten.profil)
        sendResponse({ erfolg: true })
        break
      }

      case MSG.PROFIL_ZURUECKSETZEN: {
        const profil = await profilZuruecksetzen()
        sendResponse({ erfolg: true, profil })
        break
      }

      // === Historie ===
      case MSG.HISTORIE_LADEN: {
        const historie = await historieLaden(
          nachricht.daten?.limit ?? 50,
          nachricht.daten?.offset ?? 0
        )
        sendResponse({ erfolg: true, historie })
        break
      }

      case MSG.HISTORIE_LEEREN: {
        await historieLeeren()
        sendResponse({ erfolg: true })
        break
      }

      // === Statistik ===
      case MSG.STATS_ANFRAGE: {
        const stats = await heutigeStatistikBerechnen()
        sendResponse({ erfolg: true, stats })
        break
      }

      // === Demo-Modus ===
      case MSG.DEMO_MODUS_TOGGLE: {
        const aktuellerStatus = await demoModusLesen()
        await demoModusSetzen(!aktuellerStatus)
        sendResponse({ erfolg: true, demoModus: !aktuellerStatus })
        break
      }

      case MSG.DEMO_MODUS_STATUS: {
        const demoModus = await demoModusLesen()
        sendResponse({ erfolg: true, demoModus })
        break
      }

      // === Erweiterung aktiv/inaktiv ===
      case MSG.ERWEITERUNG_TOGGLE: {
        const aktuellerStatus = await erweiterungAktivLesen()
        await erweiterungAktivSetzen(!aktuellerStatus)
        sendResponse({ erfolg: true, aktiv: !aktuellerStatus })
        break
      }

      case MSG.ERWEITERUNG_STATUS: {
        const aktiv = await erweiterungAktivLesen()
        const demoModus = await demoModusLesen()
        sendResponse({ erfolg: true, aktiv, demoModus })
        break
      }

      // === OSRM Route (Fallback für fehlende Distanz) ===
      case MSG.OSRM_ROUTE_ANFRAGE: {
        try {
          const route = await berechneRoute(
            nachricht.daten.von,
            nachricht.daten.nach,
            nachricht.daten.istPlz ?? true
          )
          sendResponse({ erfolg: true, route })
        } catch (fehler) {
          sendResponse({ erfolg: false, fehler: fehler.message })
        }
        break
      }

      // === Side Panel öffnen ===
      case MSG.SEITENPANEL_OEFFNEN: {
        if (sender.tab?.id && chrome.sidePanel) {
          chrome.sidePanel.open({ tabId: sender.tab.id })
        }
        sendResponse({ erfolg: true })
        break
      }

      default:
        console.warn(`[FreightLens SW] Unbekannter Nachrichtentyp: ${nachricht.type}`)
        sendResponse({ erfolg: false, fehler: 'Unbekannter Nachrichtentyp' })
    }
  } catch (fehler) {
    console.error(`[FreightLens SW] Fehler bei ${nachricht.type}:`, fehler)
    sendResponse({ erfolg: false, fehler: fehler.message })
  }
}

// ==================
// Bewertungslogik
// ==================

/**
 * Ein Frachtangebot bewerten: Kosten berechnen und Bewertung ermitteln.
 *
 * @param {object} angebot - Gescrapte Angebotsdaten
 * @returns {Promise<object>} Berechnungsergebnis
 */
async function angebotBewerten(angebot) {
  // Kostenprofil laden
  const profil = await profilLaden()

  // Distanz ermitteln: bevorzugt aus Scraping, sonst OSRM
  let distanzKm = angebot.distanzKm ?? 0
  let fahrzeitStunden = angebot.fahrzeitStunden ?? 0
  let laender = ['DE']
  let distanzProLand = { DE: distanzKm }

  if (distanzKm === 0 && angebot.ladeort && angebot.entladeort) {
    // OSRM-Fallback versuchen
    try {
      const route = await berechneRoute(angebot.ladeort, angebot.entladeort)
      distanzKm = route.distanzKm
      fahrzeitStunden = route.fahrzeitStunden
      laender = route.laender
      distanzProLand = route.distanzProLand
    } catch (fehler) {
      console.warn('[FreightLens SW] OSRM-Fallback fehlgeschlagen:', fehler.message)
    }
  }

  // Fahrzeit schätzen falls nicht verfügbar: Ø 60 km/h
  if (fahrzeitStunden === 0 && distanzKm > 0) {
    fahrzeitStunden = runde2(distanzKm / 60)
  }

  // Übernachtungen schätzen: 1 Nacht pro 500 km
  const uebernachtungen = distanzKm > 0 ? Math.ceil(distanzKm / 500) - 1 : 0

  // Berechnungseingabe zusammenstellen
  const eingabe = {
    distanzKm,
    leerkilometerAnteil: 0.1, // Standard: 10 % Leerkilometer
    fahrzeitStunden,
    uebernachtungen: Math.max(0, uebernachtungen),
    laender,
    distanzProLand,
    profil,
    verdraengungskostenEur: 0, // v1: keine Verdrängungskosten
  }

  // Rentabilität berechnen
  const ergebnis = berechneRentabilitaet(angebot.preisEur, eingabe)

  // Angebot-Infos an Ergebnis anhängen
  ergebnis.angebot = {
    ladeort: angebot.ladeort,
    entladeort: angebot.entladeort,
    distanzKm,
    preisEur: angebot.preisEur,
    ladung: angebot.ladung ?? '',
    gewicht: angebot.gewicht ?? null,
  }

  return ergebnis
}

// ==================
// Initialisierung
// ==================

// Standardprofil sicherstellen beim ersten Start
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.PROFIL)
  if (!result[STORAGE_SCHLUESSEL.PROFIL]) {
    await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.PROFIL]: STANDARD_PROFIL })
    console.log('[FreightLens SW] Standardprofil angelegt')
  }

  // Demo-Modus standardmäßig aktiv
  const demoResult = await chrome.storage.local.get(STORAGE_SCHLUESSEL.DEMO_MODUS)
  if (demoResult[STORAGE_SCHLUESSEL.DEMO_MODUS] === undefined) {
    await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.DEMO_MODUS]: true })
  }

  console.log('[FreightLens SW] Initialisiert')
})
