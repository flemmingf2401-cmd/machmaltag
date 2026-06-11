/**
 * Storage-Wrapper für FreightLens.
 *
 * Verwaltet:
 * - Kostenprofil in chrome.storage.local (kein Google-Sync — Datenschutz)
 * - Bewertungshistorie in chrome.storage.local (max. 500 Einträge, FIFO)
 * - Demo-Modus-Flag
 * - Erweiterung aktiv/inaktiv
 */

const STORAGE_SCHLUESSEL = {
  PROFIL: 'freightlens_profil',
  HISTORIE: 'freightlens_historie',
  DEMO_MODUS: 'freightlens_demo_modus',
  ERWEITERUNG_AKTIV: 'freightlens_aktiv',
  LETZTES_ANGEBOT: 'freightlens_letztes_angebot',
}

const MAX_HISTORIE_EINTRAEGE = 500

// ==================
// Kostenprofil
// ==================

/**
 * Kostenprofil aus chrome.storage.local laden.
 * Falls kein Profil existiert, wird das Standardprofil zurückgegeben.
 *
 * @returns {Promise<object>} Kostenprofil
 */
async function profilLaden() {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.PROFIL)
  if (result[STORAGE_SCHLUESSEL.PROFIL]) {
    return result[STORAGE_SCHLUESSEL.PROFIL]
  }
  // Standardprofil speichern und zurückgeben
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.PROFIL]: STANDARD_PROFIL })
  return { ...STANDARD_PROFIL }
}

/**
 * Kostenprofil in chrome.storage.local speichern.
 *
 * @param {object} profil - Vollständiges Kostenprofil
 * @returns {Promise<void>}
 */
async function profilSpeichern(profil) {
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.PROFIL]: profil })
}

/**
 * Kostenprofil auf Standardwerte zurücksetzen.
 *
 * @returns {Promise<object>} Das zurückgesetzte Standardprofil
 */
async function profilZuruecksetzen() {
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.PROFIL]: STANDARD_PROFIL })
  return { ...STANDARD_PROFIL }
}

// ==================
// Bewertungshistorie
// ==================

/**
 * Bewertung in die Historie aufnehmen (FIFO, max. 500 Einträge).
 *
 * @param {object} eintrag - Bewertungseintrag mit Angebotdaten + Ergebnis + Zeitstempel
 * @returns {Promise<void>}
 */
async function historieSpeichern(eintrag) {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.HISTORIE)
  const historie = result[STORAGE_SCHLUESSEL.HISTORIE] || []

  // Eintrag mit Zeitstempel versehen
  eintrag.zeitstempel = new Date().toISOString()

  historie.push(eintrag)

  // FIFO: nur die letzten 500 Einträge behalten
  if (historie.length > MAX_HISTORIE_EINTRAEGE) {
    historie.splice(0, historie.length - MAX_HISTORIE_EINTRAEGE)
  }

  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.HISTORIE]: historie })
}

/**
 * Historie laden.
 *
 * @param {number} [limit=50] - Maximale Anzahl Einträge
 * @param {number} [offset=0] - Offset für Paginierung
 * @returns {Promise<object[]>} Historieneinträge (neueste zuerst)
 */
async function historieLaden(limit = 50, offset = 0) {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.HISTORIE)
  const historie = result[STORAGE_SCHLUESSEL.HISTORIE] || []

  // Neueste zuerst
  const umgekehrt = [...historie].reverse()
  return umgekehrt.slice(offset, offset + limit)
}

/**
 * Gesamte Historie leeren.
 *
 * @returns {Promise<void>}
 */
async function historieLeeren() {
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.HISTORIE]: [] })
}

// ==================
// Tagesstatistik
// ==================

/**
 * Statistik für den heutigen Tag berechnen.
 *
 * @returns {Promise<object>} { anzahl, profitabel, grenzwertig, verlust, margeSumme, margeDurchschnitt }
 */
async function heutigeStatistikBerechnen() {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.HISTORIE)
  const historie = result[STORAGE_SCHLUESSEL.HISTORIE] || []

  const heute = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const heutige = historie.filter((e) => e.zeitstempel?.startsWith(heute))

  if (heutige.length === 0) {
    return {
      anzahl: 0,
      profitabel: 0,
      grenzwertig: 0,
      verlust: 0,
      margeSumme: 0,
      margeDurchschnitt: 0,
    }
  }

  let profitabel = 0
  let grenzwertig = 0
  let verlust = 0
  let margeSumme = 0

  for (const eintrag of heutige) {
    if (eintrag.ergebnis?.bewertung === 'profitabel') profitabel++
    else if (eintrag.ergebnis?.bewertung === 'grenzwertig') grenzwertig++
    else verlust++

    margeSumme += eintrag.ergebnis?.margeProzent ?? 0
  }

  return {
    anzahl: heutige.length,
    profitabel,
    grenzwertig,
    verlust,
    margeSumme: runde2(margeSumme),
    margeDurchschnitt: runde2(margeSumme / heutige.length),
  }
}

// ==================
// Demo-Modus
// ==================

/**
 * Demo-Modus-Status lesen.
 *
 * @returns {Promise<boolean>} true wenn Demo-Modus aktiv
 */
async function demoModusLesen() {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.DEMO_MODUS)
  return result[STORAGE_SCHLUESSEL.DEMO_MODUS] ?? true // Standard: Demo-Modus an
}

/**
 * Demo-Modus setzen.
 *
 * @param {boolean} aktiv - Demo-Modus aktivieren/deaktivieren
 * @returns {Promise<void>}
 */
async function demoModusSetzen(aktiv) {
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.DEMO_MODUS]: aktiv })
}

// ==================
// Erweiterung aktiv/inaktiv
// ==================

/**
 * Prüfen ob FreightLens aktiv ist.
 *
 * @returns {Promise<boolean>}
 */
async function erweiterungAktivLesen() {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.ERWEITERUNG_AKTIV)
  return result[STORAGE_SCHLUESSEL.ERWEITERUNG_AKTIV] ?? true
}

/**
 * Erweiterung aktivieren/deaktivieren.
 *
 * @param {boolean} aktiv
 * @returns {Promise<void>}
 */
async function erweiterungAktivSetzen(aktiv) {
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.ERWEITERUNG_AKTIV]: aktiv })
}

// ==================
// Letztes angeklicktes Angebot (für Sidebar)
// ==================

/**
 * Letztes ausgewähltes Angebot speichern (für Sidebar-Anzeige).
 *
 * @param {object} daten - { angebot, ergebnis }
 * @returns {Promise<void>}
 */
async function letztesAngebotSpeichern(daten) {
  await chrome.storage.local.set({ [STORAGE_SCHLUESSEL.LETZTES_ANGEBOT]: daten })
}

/**
 * Letztes ausgewähltes Angebot laden.
 *
 * @returns {Promise<object|null>}
 */
async function letztesAngebotLaden() {
  const result = await chrome.storage.local.get(STORAGE_SCHLUESSEL.LETZTES_ANGEBOT)
  return result[STORAGE_SCHLUESSEL.LETZTES_ANGEBOT] ?? null
}
