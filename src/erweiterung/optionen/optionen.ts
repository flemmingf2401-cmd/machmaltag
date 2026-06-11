/**
 * Options-Seite Script — Supabase-Verbindung konfigurieren.
 */

// Bestehende Werte laden
chrome.storage.local.get(['supabaseUrl', 'supabaseAnonKey'], (result) => {
  const urlInput = document.getElementById('supabase-url') as HTMLInputElement
  const keyInput = document.getElementById('supabase-key') as HTMLInputElement

  if (urlInput && result.supabaseUrl) urlInput.value = result.supabaseUrl as string
  if (keyInput && result.supabaseAnonKey) keyInput.value = result.supabaseAnonKey as string
})

// Speichern
document.getElementById('save-btn')?.addEventListener('click', () => {
  const urlInput = document.getElementById('supabase-url') as HTMLInputElement
  const keyInput = document.getElementById('supabase-key') as HTMLInputElement

  chrome.storage.local.set({
    supabaseUrl: urlInput?.value ?? '',
    supabaseAnonKey: keyInput?.value ?? '',
  }, () => {
    const btn = document.getElementById('save-btn') as HTMLButtonElement
    if (btn) {
      btn.textContent = '✓ Gespeichert'
      setTimeout(() => { btn.textContent = 'Speichern' }, 2000)
    }
  })
})
