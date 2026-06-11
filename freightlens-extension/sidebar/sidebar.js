/**
 * FreightLens Sidebar Logic.
 *
 * Drei Tabs:
 * 1. Bewertung — Kostenaufschlüsselung des ausgewählten Angebots
 * 2. Einstellungen — Kostenprofil bearbeiten
 * 3. Vergleich — Geschätzter Marktwert (simuliert)
 */

// ==================
// Tab-Navigation
// ==================

document.querySelectorAll('.fl-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    // Tabs umschalten
    document.querySelectorAll('.fl-tab').forEach((t) => t.classList.remove('fl-tab--aktiv'))
    tab.classList.add('fl-tab--aktiv')

    // Panels umschalten
    document.querySelectorAll('.fl-tab-panel').forEach((p) => p.classList.remove('fl-tab-panel--aktiv'))
    const panelId = `tab-${tab.dataset.tab}`
    document.getElementById(panelId)?.classList.add('fl-tab-panel--aktiv')
  })
})

// ==================
// Bewertung anzeigen
// ==================

/**
 * Bewertungs-Panel mit den Ergebnisdaten befüllen.
 *
 * @param {object} daten - { angebot, ergebnis }
 */
function bewertungAnzeigen(daten) {
  if (!daten?.ergebnis) return

  const { ergebnis } = daten

  // Leeren-Zustand ausblenden, Inhalt einblenden
  document.getElementById('bewertung-leer').style.display = 'none'
  document.getElementById('bewertung-inhalt').style.display = 'block'

  // Angebotsinfo
  const route = ergebnis.angebot
    ? `${ergebnis.angebot.ladeort} → ${ergebnis.angebot.entladeort}`
    : 'Unbekannte Route'
  document.getElementById('angebot-route').textContent = route
  document.getElementById('angebot-preis').textContent = ergebnis.angebot
    ? formatiereWaehrung(ergebnis.angebot.preisEur)
    : ''

  // Bewertungs-Badge
  const badge = document.getElementById('bewertungs-badge')
  badge.className = `fl-bewertungs-badge fl-bewertungs-badge--${ergebnis.bewertung}`
  const bewertungsLabels = {
    profitabel: '✓ Profitabel',
    grenzwertig: '⚠ Grenzwertig',
    verlust: '✗ Verlust',
  }
  badge.innerHTML = `<span>${bewertungsLabels[ergebnis.bewertung]}</span><span>${ergebnis.margeProzent >= 0 ? '+' : ''}${ergebnis.margeProzent.toFixed(1)} %</span>`

  // Kostentreiber
  const treiberContainer = document.getElementById('kostentreiber-liste')
  treiberContainer.innerHTML = ''

  const treiber = ergebnis.kostentreiber
  for (const [key, treiberDaten] of Object.entries(treiber)) {
    const karte = document.createElement('div')
    karte.className = 'fl-kostentreiber__karte'

    let positionenHtml = ''
    for (const pos of treiberDaten.positionen) {
      positionenHtml += `
        <div class="fl-kostentreiber__position">
          <span>${pos.bezeichnung} ${pos.detail ? `<span class="fl-kostentreiber__detail">(${pos.detail})</span>` : ''}</span>
          <span>${formatiereWaehrung(pos.betragEur)}</span>
        </div>`
    }

    karte.innerHTML = `
      <div class="fl-kostentreiber__header">
        <span class="fl-kostentreiber__name">${treiberDaten.bezeichnung}</span>
        <span class="fl-kostentreiber__betrag">${formatiereWaehrung(treiberDaten.betragEur)}</span>
      </div>
      ${positionenHtml}
    `
    treiberContainer.appendChild(karte)
  }

  // Ergebnis-Zusammenfassung
  const zusammenfassung = document.getElementById('ergebnis-zusammenfassung')
  zusammenfassung.innerHTML = `
    <div class="fl-ergebnis__zeile">
      <span class="fl-ergebnis__label">Gesamtkosten</span>
      <span class="fl-ergebnis__wert">${formatiereWaehrung(ergebnis.kostenGesamtEur)}</span>
    </div>
    <div class="fl-ergebnis__zeile fl-ergebnis__zeile--fett">
      <span class="fl-ergebnis__label">Marge</span>
      <span class="fl-ergebnis__wert">${formatiereWaehrung(ergebnis.margeEur)} (${ergebnis.margeProzent.toFixed(1)} %)</span>
    </div>
    ${ergebnis.verdraengungskostenEur > 0 ? `
      <div class="fl-ergebnis__zeile">
        <span class="fl-ergebnis__label">Verdrängungskosten</span>
        <span class="fl-ergebnis__wert">${formatiereWaehrung(ergebnis.verdraengungskostenEur)}</span>
      </div>
      <div class="fl-ergebnis__zeile fl-ergebnis__zeile--fett">
        <span class="fl-ergebnis__label">Nettomarge</span>
        <span class="fl-ergebnis__wert">${formatiereWaehrung(ergebnis.nettomargeEur)} (${ergebnis.nettomargeProzent.toFixed(1)} %)</span>
      </div>
    ` : ''}
  `

  // Vergleichs-Tab aktualisieren
  vergleichAnzeigen(daten)
}

// ==================
// Vergleich (Mock)
// ==================

/**
 * Geschätzten Marktwert-Vergleich anzeigen (simuliert).
 *
 * @param {object} daten - { angebot, ergebnis }
 */
function vergleichAnzeigen(daten) {
  const container = document.getElementById('vergleich-inhalt')
  if (!daten?.ergebnis?.angebot) {
    container.innerHTML = '<p class="fl-leer">Wähle ein Angebot aus, um den Marktwert-Vergleich zu sehen.</p>'
    return
  }

  const angebot = daten.ergebnis.angebot
  const preis = angebot.preisEur

  // Simulierte Marktwerte: ±10-20 % vom Angebotspreis
  const simulierterMarktwert = runde2(preis * (1 + (Math.random() * 0.2 - 0.1)))
  const simulierterTiefstpreis = runde2(preis * 0.85)
  const simulierterHoechstpreis = runde2(preis * 1.15)
  const differenz = runde2(simulierterMarktwert - preis)
  const differenzProzent = runde2((differenz / preis) * 100)

  container.innerHTML = `
    <div class="fl-vergleich__zeile">
      <span class="fl-vergleich__label">Dein Angebotspreis</span>
      <span class="fl-vergleich__wert">${formatiereWaehrung(preis)}</span>
    </div>
    <div class="fl-vergleich__zeile">
      <span class="fl-vergleich__label">Geschätzter Marktwert</span>
      <span class="fl-vergleich__wert">${formatiereWaehrung(simulierterMarktwert)}</span>
    </div>
    <div class="fl-vergleich__zeile">
      <span class="fl-vergleich__label">Differenz</span>
      <span class="fl-vergleich__wert ${differenz >= 0 ? 'fl-vergleich__wert--hoeher' : 'fl-vergleich__wert--niedriger'}">
        ${differenz >= 0 ? '+' : ''}${formatiereWaehrung(differenz)} (${differenzProzent >= 0 ? '+' : ''}${differenzProzent.toFixed(1)} %)
      </span>
    </div>
    <div class="fl-vergleich__zeile">
      <span class="fl-vergleich__label">Preisspanne (geschätzt)</span>
      <span class="fl-vergleich__wert">${formatiereWaehrung(simulierterTiefstpreis)} – ${formatiereWaehrung(simulierterHoechstpreis)}</span>
    </div>
  `
}

// ==================
// Einstellungen
// ==================

/**
 * Einstellungen-Formular mit dem aktuellen Profil befüllen.
 *
 * @param {object} profil - Kostenprofil
 */
function einstellungenLaden(profil) {
  const inputs = document.querySelectorAll('.fl-input[data-feld]')
  inputs.forEach((input) => {
    const feld = input.dataset.feld
    if (profil[feld] !== undefined) {
      input.value = profil[feld]
    }
  })
}

/**
 * Profil aus Formular-Feldern auslesen.
 *
 * @returns {object} Kostenprofil
 */
function profilAusFormularLesen() {
  const profil = {}
  const inputs = document.querySelectorAll('.fl-input[data-feld]')
  inputs.forEach((input) => {
    const feld = input.dataset.feld
    profil[feld] = parseFloat(input.value) || 0
  })
  return profil
}

// Formular speichern
document.getElementById('einstellungen-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const profil = profilAusFormularLesen()

  await chrome.runtime.sendMessage({
    type: MSG.PROFIL_SPEICHERN,
    daten: { profil },
  })

  // Toast anzeigen
  toastAnzeigen('✓ Kostenprofil gespeichert')
})

// Zurücksetzen
document.getElementById('btn-zuruecksetzen')?.addEventListener('click', async () => {
  const antwort = await chrome.runtime.sendMessage({ type: MSG.PROFIL_ZURUECKSETZEN })
  if (antwort.erfolg) {
    einstellungenLaden(antwort.profil)
    toastAnzeigen('↩ Auf Standard zurückgesetzt')
  }
})

// ==================
// Toast-Benachrichtigung
// ==================

function toastAnzeigen(text) {
  // Bestehenden Toast entfernen
  document.querySelector('.fl-toast')?.remove()

  const toast = document.createElement('div')
  toast.className = 'fl-toast'
  toast.textContent = text
  document.body.appendChild(toast)

  // Nach 2 Sekunden entfernen
  setTimeout(() => toast.remove(), 2000)
}

// ==================
// Initialisierung
// ==================

async function initialisieren() {
  // Kostenprofil laden und Einstellungen befüllen
  const profilAntwort = await chrome.runtime.sendMessage({ type: MSG.PROFIL_LADEN })
  if (profilAntwort.erfolg) {
    einstellungenLaden(profilAntwort.profil)
  }

  // Letztes angeklicktes Angebot laden (falls vorhanden)
  const letztesAntwort = await chrome.runtime.sendMessage({
    type: MSG.ANGEBOT_ANGEKLICKT,
    daten: null,
  })

  // Versuche das letzte Angebot aus Storage zu laden
  try {
    const result = await chrome.storage.local.get('freightlens_letztes_angebot')
    const letztes = result.freightlens_letztes_angebot
    if (letztes?.ergebnis) {
      bewertungAnzeigen(letztes)
    }
  } catch (e) {
    // Storage nicht verfügbar — ignoriere
  }

  // Auf neue Bewertungs-Nachrichten hören
  chrome.runtime.onMessage.addListener((nachricht) => {
    if (nachricht.type === MSG.BERECHNUNG_ERGEBNIS && nachricht.daten?.ergebnis) {
      bewertungAnzeigen(nachricht.daten)
    }
  })
}

initialisieren()
