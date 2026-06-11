/**
 * Content Script Entry Point für FreightLens.
 *
 * Verdrahtet Scraper + Badge-Injector + Nachrichten mit dem Background Service Worker.
 * Startet MutationObserver für dynamisch nachgeladene Angebote.
 */

// ==================
// Zustand
// ==================

/** Map: angebotId → { karte, daten } */
const angebotMap = new Map()

/** Ob die Erweiterung aktiv ist */
let erweiterungAktiv = true

// ==================
// Initialisierung
// ==================

/**
 * Main Entry: Alle sichtbaren Angebote scrapen und bewerten.
 */
async function initialisieren() {
  // Status der Erweiterung abfragen
  try {
    const antwort = await chrome.runtime.sendMessage({ type: MSG.ERWEITERUNG_STATUS })
    erweiterungAktiv = antwort.aktiv ?? true
  } catch (e) {
    // Fallback: aktiv
    erweiterungAktiv = true
  }

  if (!erweiterungAktiv) {
    console.log('[FreightLens] Erweiterung ist deaktiviert')
    return
  }

  console.log('[FreightLens] Content Script initialisiert')

  // Alle Angebote scrapen
  const angebote = alleAngeboteScrapen()

  // Jedes Angebot an Background senden und Badge-Ladeanzeige zeigen
  for (const { angebotId, karte, daten } of angebote) {
    angebotMap.set(angebotId, { karte, daten })
    ladeIndikatorAnzeigen(karte, angebotId)

    // Bewertung anfordern
    chrome.runtime.sendMessage({
      type: MSG.ANGEBOT_GESCRAPT,
      daten: { angebotId, ...daten },
    })
  }

  // MutationObserver starten für dynamisch geladene Angebote
  mutationObserverStarten()
}

// ==================
// Nachrichten-Handler (vom Background Service Worker)
// ==================

chrome.runtime.onMessage.addListener((nachricht, _sender, sendResponse) => {
  if (nachricht.type === MSG.BERECHNUNG_ERGEBNIS) {
    const { angebotId, ergebnis } = nachricht.daten
    const eintrag = angebotMap.get(angebotId)

    if (eintrag) {
      // Ladeanzeige entfernen und echtes Badge injizieren
      badgeInjizieren(eintrag.karte, ergebnis, angebotId)
    }
  }

  // Erweiterung aktiviert/deaktiviert
  if (nachricht.type === 'freightlens_status_geaendert') {
    if (!nachricht.aktiv) {
      badgesEntfernen()
      erweiterungAktiv = false
    } else {
      erweiterungAktiv = true
      initialisieren()
    }
  }

  sendResponse({ erfolg: true })
})

// ==================
// MutationObserver
// ==================

/**
 * MutationObserver auf dem Angebotscontainer starten.
 * Erkennt neue oder geänderte Angebotskarten.
 */
function mutationObserverStarten() {
  const demo = istDemoSeite()
  const containerSelector = demo ? '.tc-angebote' : 'body'

  const container = document.querySelector(containerSelector)
  if (!container) {
    console.warn('[FreightLens] Angebotscontainer nicht gefunden')
    return
  }

  const observer = new MutationObserver((mutationen) => {
    if (!erweiterungAktiv) return

    for (const mutation of mutationen) {
      for (const knoten of mutation.addedNodes) {
        // Nur Element-Knoten beachten
        if (knoten.nodeType !== Node.ELEMENT_NODE) continue

        // Prüfen ob der hinzugefügte Knoten eine Angebotskarte ist oder eine enthält
        const karteSelector = demo ? '.tc-angebot' : '.freight-item, .offer-card'
        const karten = knoten.matches?.(karteSelector)
          ? [knoten]
          : [...knoten.querySelectorAll?.(karteSelector) || []]

        for (const karte of karten) {
          // Vermeide doppelte Verarbeitung
          if (karte.hasAttribute('data-fl-angebot-id')) continue

          try {
            const angebote = alleAngeboteScrapen()
            // Nur das neue Angebot verarbeiten
            for (const { angebotId, karte: k, daten } of angebote) {
              if (!angebotMap.has(angebotId)) {
                angebotMap.set(angebotId, { karte: k, daten })
                ladeIndikatorAnzeigen(k, angebotId)

                chrome.runtime.sendMessage({
                  type: MSG.ANGEBOT_GESCRAPT,
                  daten: { angebotId, ...daten },
                })
              }
            }
          } catch (e) {
            console.warn('[FreightLens] Fehler beim Verarbeiten neuer Angebote:', e)
          }
        }
      }
    }
  })

  observer.observe(container, {
    childList: true,
    subtree: true,
  })

  console.log('[FreightLens] MutationObserver gestartet')
}

// ==================
// Start
// ==================

// Warten bis DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialisieren)
} else {
  initialisieren()
}
