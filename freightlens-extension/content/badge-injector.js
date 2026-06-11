/**
 * Badge-Injector für FreightLens.
 *
 * Injiziert ein Ampel-Badge auf jeder TIMOCOM-Angebotskarte:
 * - Grün: profitabel (> 5 % Marge)
 * - Gelb: grenzwertig (0–5 % Marge)
 * - Rot: Verlust (< 0 % Marge)
 *
 * Badge zeigt: Ampelfarbe + Marge in % + absoluter DB in €
 * Klick auf Badge öffnet das Side Panel.
 */

// ==================
// Konfiguration
// ==================

const BADGE_STILE = {
  profitabel: {
    hintergrund: '#059669', // Grün
    text: '#FFFFFF',
    rahmen: '#047857',
    label: '✓ Profitabel',
  },
  grenzwertig: {
    hintergrund: '#D97706', // Gelb/Orange
    text: '#FFFFFF',
    rahmen: '#B45309',
    label: '⚠ Grenzwertig',
  },
  verlust: {
    hintergrund: '#DC2626', // Rot
    text: '#FFFFFF',
    rahmen: '#B91C1C',
    label: '✗ Verlust',
  },
}

// ==================
// Badge erstellen
// ==================

/**
 * Ein Badge-DOM-Element für ein Bewertungsergebnis erstellen.
 *
 * @param {object} ergebnis - Berechnungsergebnis vom Kalkulator
 * @param {string} angebotId - Eindeutige Angebots-ID
 * @returns {HTMLElement} Badge-Element
 */
function badgeErstellen(ergebnis, angebotId) {
  const stil = BADGE_STILE[ergebnis.bewertung] || BADGE_STILE.grenzwertig

  const badge = document.createElement('div')
  badge.className = 'freightlens-badge'
  badge.setAttribute('data-fl-angebot-id', angebotId)
  badge.setAttribute('role', 'status')
  badge.setAttribute('aria-label', `FreightLens: ${stil.label}, Marge ${ergebnis.margeProzent.toFixed(1)} %`)

  // Inline-Styles mit Namespace-Präfix — kein Konflikt mit TIMOCOM-Styles
  Object.assign(badge.style, {
    all: 'initial', // Reset aller geerbten Styles
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: stil.hintergrund,
    color: stil.text,
    border: `2px solid ${stil.rahmen}`,
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontSize: '12px',
    fontWeight: '700',
    lineHeight: '1.2',
    cursor: 'pointer',
    zIndex: '9999',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    pointerEvents: 'auto',
    userSelect: 'none',
    minWidth: '70px',
    textAlign: 'center',
  })

  // Marge-Prozent
  const margeZeile = document.createElement('span')
  margeZeile.style.cssText = 'font-size:14px; font-weight:700;'
  margeZeile.textContent = `${ergebnis.margeProzent >= 0 ? '+' : ''}${ergebnis.margeProzent.toFixed(1)} %`
  badge.appendChild(margeZeile)

  // Marge in Euro
  const margeEur = document.createElement('span')
  margeEur.style.cssText = 'font-size:10px; font-weight:500; opacity:0.9;'
  margeEur.textContent = `${ergebnis.margeEur >= 0 ? '+' : ''}${formatiereWaehrung(ergebnis.margeEur)}`
  badge.appendChild(margeEur)

  // Hover-Effekt
  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'scale(1.05)'
    badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
  })
  badge.addEventListener('mouseleave', () => {
    badge.style.transform = 'scale(1)'
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
  })

  // Klick → Side Panel öffnen + Angebot in Sidebar anzeigen
  badge.addEventListener('click', (e) => {
    e.stopPropagation()
    e.preventDefault()

    // Nachricht an Background: Angebot + Ergebnis für Sidebar
    chrome.runtime.sendMessage({
      type: MSG.ANGEBOT_ANGEKLICKT,
      daten: { angebotId, ergebnis },
    })

    // Side Panel öffnen (via Background, da content script keinen Zugriff hat)
    chrome.runtime.sendMessage({
      type: MSG.SEITENPANEL_OEFFNEN,
    })
  })

  return badge
}

// ==================
// Badge injizieren
// ==================

/**
 * Badge in eine Angebotskarte injizieren.
 * Falls bereits ein Badge existiert, wird es aktualisiert.
 *
 * @param {Element} karte - DOM-Element der Angebotskarte
 * @param {object} ergebnis - Berechnungsergebnis
 * @param {string} angebotId - Eindeutige Angebots-ID
 */
function badgeInjizieren(karte, ergebnis, angebotId) {
  // Karte muss position:relative haben für absolute Badge-Positionierung
  const aktuellePosition = getComputedStyle(karte).position
  if (aktuellePosition === 'static') {
    karte.style.position = 'relative'
  }

  // Bestehendes Badge entfernen falls vorhanden
  const bestehend = karte.querySelector(`.freightlens-badge[data-fl-angebot-id="${angebotId}"]`)
  if (bestehend) {
    bestehend.remove()
  }

  // Neues Badge erstellen und einfügen
  const badge = badgeErstellen(ergebnis, angebotId)
  karte.appendChild(badge)
}

/**
 * Alle Badges auf der Seite entfernen.
 */
function badgesEntfernen() {
  document.querySelectorAll('.freightlens-badge').forEach((badge) => badge.remove())
}

/**
 * Lade-Indikator anzeigen (während Berechnung läuft).
 *
 * @param {Element} karte - Angebotskarte
 * @param {string} angebotId - Eindeutige ID
 */
function ladeIndikatorAnzeigen(karte, angebotId) {
  const aktuellePosition = getComputedStyle(karte).position
  if (aktuellePosition === 'static') {
    karte.style.position = 'relative'
  }

  // Bestehendes Badge/Ladeanzeige entfernen
  const bestehend = karte.querySelector(`.freightlens-badge[data-fl-angebot-id="${angebotId}"]`)
  if (bestehend) bestehend.remove()

  const loader = document.createElement('div')
  loader.className = 'freightlens-badge freightlens-loading'
  loader.setAttribute('data-fl-angebot-id', angebotId)

  Object.assign(loader.style, {
    all: 'initial',
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    fontWeight: '600',
    zIndex: '9999',
    cursor: 'wait',
    textAlign: 'center',
  })

  loader.textContent = '⏳ Berechne...'
  karte.appendChild(loader)
}
