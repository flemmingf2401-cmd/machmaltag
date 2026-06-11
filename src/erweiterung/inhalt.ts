/**
 * Content Script für die MachMalTag Chrome Extension.
 *
 * Wird auf TimoCom-Seiten injiziert.
 * Verantwortlichkeiten:
 * - Overlay in Shadow DOM einhängen
 * - TimoCom-Angebotsdaten extrahieren (DOM-Parsing)
 * - Badge in jede Angebotszeile injizieren
 * - MutationObserver für dynamisch geladene Inhalte
 */

// ==================
// Overlay einhängen
// ==================

function overlayEinhaengen() {
  // Verhindern dass es mehrfach eingehängt wird
  if (document.getElementById('machmaltag-overlay-wurzel')) return

  const container = document.createElement('div')
  container.id = 'machmaltag-overlay-wurzel'
  container.style.cssText = 'position:fixed;right:0;top:0;z-index:2147483647;width:360px;height:100vh;'

  const shadowRoot = container.attachShadow({ mode: 'open' })

  // CSS im Shadow DOM (isoliert von TimoCom)
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    :host {
      all: initial;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .overlay {
      background: #ffffff;
      border-left: 3px solid #FF6600;
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .overlay-header {
      background: #003B6F;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .overlay-header h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }

    .overlay-header .toggle-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
    }

    .overlay-body {
      padding: 16px;
      flex: 1;
    }

    .badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E0E0E0;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-profitabel { background: #E8F5E9; color: #28A745; }
    .badge-grenzwertig { background: #FFF3E6; color: #E65C00; }
    .badge-verlust { background: #FFEBEE; color: #DC3545; }

    .kosten-block {
      margin-top: 16px;
    }

    .kosten-block h3 {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .kosten-zeile {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      padding: 4px 0;
    }

    .kosten-zeile .wert {
      font-weight: 500;
      color: #333;
    }

    .marge-anzeige {
      text-align: center;
      padding: 24px 0;
    }

    .marge-anzeige .betrag {
      font-size: 28px;
      font-weight: 700;
    }

    .marge-anzeige .prozent {
      font-size: 16px;
      color: #666;
    }

    .schnell-aktionen {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .schnell-aktionen button {
      flex: 1;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn-annehmen { background: #E8F5E9; color: #28A745; }
    .btn-ablehnen { background: #FFEBEE; color: #DC3545; }
    .btn-speichern { background: #E8F0F8; color: #003B6F; }

    .status-hinweis {
      text-align: center;
      padding: 32px 16px;
      color: #666;
      font-size: 13px;
    }

    .login-hinweis {
      background: #FFF3E6;
      border: 1px solid #FF6600;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #E65C00;
    }

    .login-hinweis a {
      color: #003B6F;
      font-weight: 600;
    }
  `
  shadowRoot.appendChild(styleSheet)

  // React-Root im Shadow DOM
  const appRoot = document.createElement('div')
  appRoot.id = 'machmaltag-app'
  shadowRoot.appendChild(appRoot)

  // Overlay-HTML (fürs MVP ohne React-Bundling im Content Script)
  const overlayHtml = document.createElement('div')
  overlayHtml.className = 'overlay'
  overlayHtml.innerHTML = `
    <div class="overlay-header">
      <h2>🧮 MachMalTag</h2>
      <button class="toggle-btn" id="mm-toggle" title="Overlay einklappen">◀</button>
    </div>
    <div class="overlay-body" id="mm-body">
      <div class="login-hinweis">
        Melde dich an, um deine Kostenkennzahlen zu nutzen.
        <a href="https://machmaltag.vercel.app/login" target="_blank">Jetzt anmelden →</a>
      </div>
      <div class="status-hinweis">
        Klicke auf ein Frachtangebot in TimoCom, um die Rentabilität zu prüfen.
      </div>
    </div>
  `
  appRoot.appendChild(overlayHtml)

  document.body.appendChild(container)

  // Toggle-Button
  const toggleBtn = shadowRoot.getElementById('mm-toggle')
  const body = shadowRoot.getElementById('mm-body')
  let eingeklappt = false

  toggleBtn?.addEventListener('click', () => {
    eingeklappt = !eingeklappt
    if (body) body.style.display = eingeklappt ? 'none' : 'block'
    if (toggleBtn) toggleBtn.textContent = eingeklappt ? '▶' : '◀'
    container.style.width = eingeklappt ? '48px' : '360px'
  })
}

// ==================
// Badge in Angebotszeilen injizieren
// ==================

function badgesInjizieren() {
  // TimoCom-Angebotszeilen finden
  // Hinweis: Selektoren müssen an die tatsächliche TimoCom-Seite angepasst werden
  const angebotZeilen = document.querySelectorAll(
    '[data-testid="freight-list"] .freight-item, .offer-list .offer-item, .freight-list-item'
  )

  angebotZeilen.forEach((zeile) => {
    // Verhindern dass Badge doppelt eingefügt wird
    if (zeile.querySelector('.machmaltag-badge')) return

    const badge = document.createElement('span')
    badge.className = 'machmaltag-badge'
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
      cursor: pointer;
      background: #E8F0F8;
      color: #003B6F;
    `
    badge.textContent = '🧮 Prüfen'
    badge.title = 'Rentabilität mit MachMalTag prüfen'

    zeile.appendChild(badge)

    badge.addEventListener('click', (e) => {
      e.stopPropagation()
      // Angebot-Daten extrahieren und an Overlay senden
      const daten = angebotExtrahieren(zeile)
      if (daten) {
        badgeErgebnisAnzeigen(badge, daten)
      }
    })
  })
}

// ==================
// Angebotsdaten aus DOM extrahieren
// ==================

interface AngebotExtrakt {
  ladeort: string
  entladeort: string
  preisEur: number | null
  distanzKm: number | null
  ladung: string
}

function angebotExtrahieren(zeile: Element): AngebotExtrakt | null {
  try {
    // Strategy 1: Datenattribute
    const ladeort = zeile.querySelector('[data-field="from"]')?.textContent?.trim() ?? ''
    const entladeort = zeile.querySelector('[data-field="to"]')?.textContent?.trim() ?? ''
    const _preisText = zeile.querySelector('[data-field="price"]')?.textContent?.trim() ?? ''
    const ladung = zeile.querySelector('[data-field="cargo"]')?.textContent?.trim() ?? ''

    // Strategy 2: Text-Muster-Fallback
    const plzMuster = /\b\d{5}\b/g
    const preisMuster = /(\d+[.,]\d{2})\s*€/

    const textContent = zeile.textContent ?? ''
    const plzMatches = textContent.match(plzMuster) ?? []
    const preisMatch = textContent.match(preisMuster)

    return {
      ladeort: ladeort || (plzMatches[0] ?? ''),
      entladeort: entladeort || (plzMatches[1] ?? ''),
      preisEur: preisMatch ? parseFloat(preisMatch[1].replace(',', '.')) : null,
      distanzKm: null,
      ladung: ladung || '',
    }
  } catch (error) {
    console.error('[MachMalTag] Fehler beim Extrahieren:', error)
    return null
  }
}

// ==================
// Badge-Ergebnis anzeigen
// ==================

function badgeErgebnisAnzeigen(badge: HTMLSpanElement, daten: AngebotExtrakt) {
  if (!daten.preisEur || !daten.ladeort || !daten.entladeort) {
    badge.style.background = '#FFF3E6'
    badge.style.color = '#E65C00'
    badge.textContent = '⚠️ Daten unvollständig'
    return
  }

  // Route über Background Service Worker berechnen
  chrome.runtime.sendMessage(
    { typ: 'route_berechnen', von: daten.ladeort, nach: daten.entladeort },
    (antwort) => {
      if (antwort?.daten) {
        badge.style.background = '#E8F5E9'
        badge.style.color = '#28A745'
        badge.textContent = `✅ ${antwort.daten.distanzKm} km`
      } else {
        badge.style.background = '#FFEBEE'
        badge.style.color = '#DC3545'
        badge.textContent = '❌ Fehler'
      }
    }
  )
}

// ==================
// MutationObserver für dynamische Inhalte
// ==================

function aenderungenBeobachten() {
  const observer = new MutationObserver((mutations) => {
    const relevanteAenderung = mutations.some(
      (m) =>
        m.target instanceof Element &&
        (m.target as Element).closest?.(
          '[data-testid="freight-list"], .offer-list, .freight-list, main'
        )
    )

    if (relevanteAenderung) {
      // Leicht verzögert, damit DOM-Updates abschließen
      setTimeout(badgesInjizieren, 500)
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// ==================
// Initialisierung
// ==================

// Auf DOM ready warten
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    overlayEinhaengen()
    badgesInjizieren()
    aenderungenBeobachten()
  })
} else {
  overlayEinhaengen()
  badgesInjizieren()
  aenderungenBeobachten()
}
