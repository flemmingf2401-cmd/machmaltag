/**
 * Popup-Script — Auth-Status prüfen und Statistik anzeigen.
 */

// Auth-Status prüfen
chrome.storage.local.get('supabaseSession', (result) => {
  const statusEl = document.getElementById('stat-heute')
  const margeEl = document.getElementById('stat-marge')
  const statusDiv = document.getElementById('status')

  if (result.supabaseSession) {
    if (statusDiv) {
      statusDiv.textContent = '✅ Angemeldet'
      statusDiv.className = 'status angemeldet'
    }
    // Statistiken aus Storage laden
    chrome.storage.local.get('tagesstatistik', (statResult) => {
      const statistik = statResult.tagesstatistik as Record<string, number> | undefined
      if (statistik) {
        if (statusEl) statusEl.textContent = String(statistik.bewertetHeute ?? 0)
        if (margeEl) margeEl.textContent = `${(statistik.margeDurchschnitt ?? 0).toFixed(0)}€`
      }
    })
  } else {
    if (statusDiv) {
      statusDiv.textContent = '⚠️ Nicht angemeldet'
      statusDiv.className = 'status abgemeldet'
    }
  }
})
