/**
 * Rentabilitäts-Kalkulator für FreightLens.
 *
 * Portiert aus:
 * - src/geteilt/rechner/diesel.ts         → berechneDieselKosten
 * - src/geteilt/rechner/fahrer.ts         → berechneFahrerkosten
 * - src/geteilt/rechner/maut.ts           → berechneMautkosten
 * - src/geteilt/rechner/fixkosten.ts       → berechneFixkosten
 * - src/geteilt/rechner/rentabilitaet.ts   → berechneRentabilitaet
 *
 * Alle Algorithmen sind 1:1-Übersetzungen der TypeScript-Originale.
 */

// ==================
// Abhängigkeiten (gleiche Datei, geladen via content scripts / importScripts)
// ==================

// Diese Funktionen/Konstanten werden vorausgesetzt und müssen vor diesem Skript geladen sein:
// - runde2()                aus shared/formatierung.js
// - KM_PRO_MONAT            aus calculator/profilkonstanten.js
// - SCHWELLE_PROFITABEL     aus calculator/profilkonstanten.js
// - SCHWELLE_GRENZWERTIG    aus calculator/profilkonstanten.js
// - MAX_LENKZEIT_PRO_TAG_H aus calculator/profilkonstanten.js
// - berechneTollCollectKosten  aus calculator/tariffdaten.js
// - istEurovignetteLand        aus calculator/tariffdaten.js
// - berechneEurovignetteKosten aus calculator/tariffdaten.js
// - berechneAuslandMaut       aus calculator/tariffdaten.js

// ==================
// Diesel/Kraftstoff
// ==================

/**
 * Dieselkosten berechnen.
 *
 * Formel:
 *   Basisverbrauch = (distanz / 100) × verbrauchLPro100Km
 *   Leerkilometer-Aufschlag = basisverbrauch × leerkilometerAnteil × leerkilometerAufschlag
 *   Kosten = (basisverbrauch + aufschlag) × dieselPreis
 *
 * @param {object} eingabe - Berechnungseingabe
 * @param {number} eingabe.distanzKm - Distanz in km
 * @param {number} eingabe.leerkilometerAnteil - Anteil Leerkilometer (0.0–1.0)
 * @param {object} eingabe.profil - Kostenprofil
 * @returns {object} Kostentreiber-Ergebnis
 */
function berechneDieselKosten(eingabe) {
  const profil = eingabe.profil

  // Basisverbrauch: (distanz / 100) × verbrauch
  const basisVerbrauchL = (eingabe.distanzKm / 100) * profil.verbrauchLPro100Km

  // Leerkilometer-Aufschlag: Anteil × Aufschlag-Faktor
  const leerAufschlagL =
    basisVerbrauchL * eingabe.leerkilometerAnteil * profil.leerkilometerAufschlag

  const gesamtVerbrauchL = basisVerbrauchL + leerAufschlagL
  const kostenEur = gesamtVerbrauchL * profil.dieselPreisEurL

  return {
    bezeichnung: 'Diesel/Kraftstoff',
    betragEur: runde2(kostenEur),
    positionen: [
      {
        bezeichnung: 'Basisverbrauch',
        betragEur: runde2(basisVerbrauchL * profil.dieselPreisEurL),
        detail: `${basisVerbrauchL.toFixed(1)} l`,
      },
      {
        bezeichnung: 'Leerkilometer-Aufschlag',
        betragEur: runde2(leerAufschlagL * profil.dieselPreisEurL),
        detail: `${leerAufschlagL.toFixed(1)} l`,
      },
    ],
  }
}

// ==================
// Fahrerpersonal
// ==================

/**
 * Fahrerkosten berechnen.
 *
 * Formel:
 *   Korrigierte Fahrzeit = fahrzeit × korrekturfaktor
 *   Lohn = korrigierteFahrzeit × stundenlohn
 *   Tage = ceil(korrigierteFahrzeit / maxLenkzeit)
 *   Spesen = tage × spesenProTag
 *   Übernachtung = uebernachtungen × uebernachtungKosten
 *   Gesamt = lohn + spesen + uebernachtung
 *
 * @param {object} eingabe - Berechnungseingabe
 * @returns {object} Kostentreiber-Ergebnis
 */
function berechneFahrerkosten(eingabe) {
  const profil = eingabe.profil

  // Tatsächliche Fahrzeit mit Korrekturfaktor (Pausenzeiten, Rüstzeiten etc.)
  const korrigierteFahrzeitH = eingabe.fahrzeitStunden * profil.lenkzeitKorrekturfaktor

  // Stundenlohn
  const stundenkostenEur = korrigierteFahrzeitH * profil.stundenlohnEur

  // Spesen: voller oder anteiliger Tag
  const tage = Math.ceil(korrigierteFahrzeitH / MAX_LENKZEIT_PRO_TAG_H)
  const spesenEur = tage * profil.spesenProTagEur

  // Übernachtungen
  const uebernachtungKostenEur = eingabe.uebernachtungen * profil.uebernachtungEur

  const kostenEur = stundenkostenEur + spesenEur + uebernachtungKostenEur

  return {
    bezeichnung: 'Fahrerpersonal',
    betragEur: runde2(kostenEur),
    positionen: [
      {
        bezeichnung: 'Fahrerlohn',
        betragEur: runde2(stundenkostenEur),
        detail: `${korrigierteFahrzeitH.toFixed(1)} h à ${profil.stundenlohnEur.toFixed(2)} €`,
      },
      {
        bezeichnung: 'Spesen',
        betragEur: runde2(spesenEur),
        detail: `${tage} Tag(e) à ${profil.spesenProTagEur.toFixed(2)} €`,
      },
      {
        bezeichnung: 'Übernachtung',
        betragEur: runde2(uebernachtungKostenEur),
        detail: `${eingabe.uebernachtungen} Nacht/Nächte à ${profil.uebernachtungEur.toFixed(2)} €`,
      },
    ],
  }
}

// ==================
// Maut/Toll
// ==================

/**
 * Mautkosten berechnen — pro Land.
 *
 * - DE: Toll Collect (oder Profil-Satz)
 * - NL/BE/LU: Eurovignette
 * - Alle anderen: Auslands-Pauschale
 * - Zusätzlich: Eurovignette-Trip-Pauschale falls im Profil
 *
 * @param {object} eingabe - Berechnungseingabe
 * @returns {object} Kostentreiber-Ergebnis
 */
function berechneMautkosten(eingabe) {
  const positionen = []
  let gesamtEur = 0

  // Pro Land berechnen
  for (const [land, distanz] of Object.entries(eingabe.distanzProLand)) {
    let kostenEur

    if (land === 'DE') {
      // Deutschland: Toll Collect
      // Falls Profil einen abweichenden DE-Satz hat, diesen verwenden
      if (eingabe.profil.mautDeutschlandEurProKm > 0) {
        kostenEur = distanz * eingabe.profil.mautDeutschlandEurProKm
      } else {
        kostenEur = berechneTollCollectKosten(distanz, 6, 5)
      }
    } else if (istEurovignetteLand(land)) {
      // Eurovignette-Länder
      kostenEur = berechneEurovignetteKosten(land, distanz)
    } else {
      // Auslands-Pauschale
      kostenEur = berechneAuslandMaut(land, distanz, eingabe.profil.mautAuslandPauschalEurProKm)
    }

    positionen.push({
      bezeichnung: `Maut ${land}`,
      betragEur: runde2(kostenEur),
      detail: `${distanz.toFixed(0)} km`,
    })
    gesamtEur += kostenEur
  }

  // Eurovignette-Pauschalbetrag pro Trip (falls im Profil hinterlegt)
  const eurovignetteLaender = eingabe.laender.filter((l) => istEurovignetteLand(l))
  if (eurovignetteLaender.length > 0 && eingabe.profil.eurovignetteBetragEur > 0) {
    const betrag = eingabe.profil.eurovignetteBetragEur
    positionen.push({
      bezeichnung: 'Eurovignette (Trip-Pauschale)',
      betragEur: runde2(betrag),
      detail: eurovignetteLaender.join(', '),
    })
    gesamtEur += betrag
  }

  return {
    bezeichnung: 'Maut/Toll',
    betragEur: runde2(gesamtEur),
    positionen,
  }
}

// ==================
// Fixkosten Fahrzeug
// ==================

/**
 * Fixkosten berechnen — monatliche Kosten auf km umgelegt.
 *
 * Formel:
 *   Monatliche Fixkosten = kfzSteuer + huAu + versicherung + leasing + wartung
 *   Fixkosten pro km = monatlicheFixkosten / KM_PRO_MONAT
 *   Kosten = distanz × fixkostenProKm
 *
 * @param {object} eingabe - Berechnungseingabe
 * @returns {object} Kostentreiber-Ergebnis
 */
function berechneFixkosten(eingabe) {
  const profil = eingabe.profil

  // Monatliche Fixkosten aufsummiert
  const monatlicheFixkostenEur =
    profil.kfzSteuerMonatlichEur +
    profil.huAuMonatlichEur +
    profil.versicherungMonatlichEur +
    profil.leasingAbschreibungMonatlichEur +
    profil.wartungMonatlichEur

  // Fixkosten pro km = monatliche Kosten / km pro Monat
  const fixkostenProKm = monatlicheFixkostenEur / KM_PRO_MONAT

  // Kosten für diese Strecke
  const kostenEur = eingabe.distanzKm * fixkostenProKm

  return {
    bezeichnung: 'Fixkosten Fahrzeug',
    betragEur: runde2(kostenEur),
    positionen: [
      {
        bezeichnung: 'Kfz-Steuer',
        betragEur: runde2((eingabe.distanzKm * profil.kfzSteuerMonatlichEur) / KM_PRO_MONAT),
      },
      {
        bezeichnung: 'HU/AU',
        betragEur: runde2((eingabe.distanzKm * profil.huAuMonatlichEur) / KM_PRO_MONAT),
      },
      {
        bezeichnung: 'Versicherung',
        betragEur: runde2(
          (eingabe.distanzKm * profil.versicherungMonatlichEur) / KM_PRO_MONAT
        ),
      },
      {
        bezeichnung: 'Leasing/Abschreibung',
        betragEur: runde2(
          (eingabe.distanzKm * profil.leasingAbschreibungMonatlichEur) / KM_PRO_MONAT
        ),
      },
      {
        bezeichnung: 'Wartung',
        betragEur: runde2((eingabe.distanzKm * profil.wartungMonatlichEur) / KM_PRO_MONAT),
      },
    ],
  }
}

// ==================
// Orchestrator: Rentabilität berechnen
// ==================

/**
 * Rentabilität eines Frachtangebots berechnen.
 *
 * Führt alle 4 Kostentreiber zusammen und berechnet:
 * - Gesamtkosten
 * - Marge (€ und %)
 * - Nettomarge (nach Verdrängungskosten)
 * - Bewertung (profitabel / grenzwertig / verlust)
 *
 * @param {number} angebotPreisEur - Angebotspreis (Erlös) in Euro
 * @param {object} eingabe - Berechnungseingabe
 * @returns {object} Vollständiges Berechnungsergebnis
 */
function berechneRentabilitaet(angebotPreisEur, eingabe) {
  // 4 Kostentreiber berechnen
  const diesel = berechneDieselKosten(eingabe)
  const fahrer = berechneFahrerkosten(eingabe)
  const maut = berechneMautkosten(eingabe)
  const fixkosten = berechneFixkosten(eingabe)

  // Gesamtkosten
  const kostenGesamtEur =
    diesel.betragEur + fahrer.betragEur + maut.betragEur + fixkosten.betragEur

  // Marge
  const margeEur = angebotPreisEur - kostenGesamtEur
  const margeProzent = angebotPreisEur > 0 ? (margeEur / angebotPreisEur) * 100 : 0

  // Nettomarge (nach Verdrängungskosten)
  const nettomargeEur = margeEur - eingabe.verdraengungskostenEur
  const nettomargeProzent =
    angebotPreisEur > 0 ? (nettomargeEur / angebotPreisEur) * 100 : 0

  // Bewertung
  const bewertung =
    margeProzent > SCHWELLE_PROFITABEL
      ? 'profitabel'
      : margeProzent >= SCHWELLE_GRENZWERTIG
        ? 'grenzwertig'
        : 'verlust'

  return {
    kostentreiber: { diesel, fahrer, maut, fixkosten },
    kostenGesamtEur: runde2(kostenGesamtEur),
    margeEur: runde2(margeEur),
    margeProzent: runde2(margeProzent),
    verdraengungskostenEur: runde2(eingabe.verdraengungskostenEur),
    nettomargeEur: runde2(nettomargeEur),
    nettomargeProzent: runde2(nettomargeProzent),
    bewertung,
  }
}
