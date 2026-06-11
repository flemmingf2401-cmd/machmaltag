/**
 * FreightLens Popup Logic.
 *
 * Statusanzeige, Toggles, Tagesstatistik, Side Panel öffnen.
 */

// ==================
// Initialisierung
// ==================

async function initialisieren() {
  // Status abfragen
  const statusAntwort = await chrome.runtime.sendMessage({ type: MSG.ERWEITERUNG_STATUS })

  if (statusAntwort.erfolg) {
    // Toggle-Status setzen
    document.getElementById('toggle-aktiv').checked = statusAntwort.aktiv
    document.getElementById('toggle-demo').checked = statusAntwort.demoModus
  }

  // Tagesstatistik laden
  const statsAntwort = await chrome.runtime.sendMessage({ type: MSG.STATS_ANFRAGE })

  if (statsAntwort.erfolg) {
    const stats = statsAntwort.stats
    document.getElementById('stat-anzahl').textContent = stats.anzahl
    document.getElementById('stat-profitabel').textContent = stats.profitabel
    document.getElementById('stat-marge').textContent = `${stats.margeDurchschnitt.toFixed(1)} %`
  }
}

// ==================
// Toggle-Handler
// ==================

// Erweiterung aktiv/inaktiv
document.getElementById('toggle-aktiv')?.addEventListener('change', async (e) => {
  await chrome.runtime.sendMessage({
    type: MSG.ERWEITERUNG_TOGGLE,
  })

  // Status neu laden
  const antwort = await chrome.runtime.sendMessage({ type: MSG.ERWEITERUNG_STATUS })
  if (antwort.erfolg) {
    e.target.checked = antwort.aktiv
  }
})

// Demo-Modus Toggle
document.getElementById('toggle-demo')?.addEventListener('change', async (e) => {
  await chrome.runtime.sendMessage({
    type: MSG.DEMO_MODUS_TOGGLE,
  })

  // Status neu laden
  const antwort = await chrome.runtime.sendMessage({ type: MSG.ERWEITERUNG_STATUS })
  if (antwort.erfolg) {
    e.target.checked = antwort.demoModus
  }
})

// ==================
// Side Panel öffnen
// ==================

document.getElementById('btn-seitenpanel')?.addEventListener('click', async () => {
  // Aktiven Tab ermitteln
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.id && chrome.sidePanel) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
  // Popup schließen
  window.close()
})

// ==================
// Start
// ==================

initialisieren()
