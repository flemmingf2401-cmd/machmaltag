/**
 * Maut-Kosten-Orchestrator.
 *
 * Führt die verschiedenen Maut-Berechnungen zusammen:
 * - Toll Collect (DE Autobahn)
 * - Eurovignette (NL, BE, LU)
 * - Auslands-Pauschalen (AT, FR, IT, etc.)
 * - Profil-Fallback für unbekannte Länder
 */

import type { BerechnungsEingabe, KostentreiberErgebnis, Kostenposition } from './typen'
import { berechneTollCollectKosten } from '@/geteilt/maut/toll-collect'
import { berechneEurovignetteKosten, istEurovignetteLand } from '@/geteilt/maut/eurovignette'
import { berechneAuslandMaut } from '@/geteilt/maut/ausland'
import { runde2 } from '@/geteilt/helfer/utils'

export function berechneMautkosten(eingabe: BerechnungsEingabe): KostentreiberErgebnis {
  const positionen: Kostenposition[] = []
  let gesamtEur = 0

  // Pro Land berechnen
  for (const [land, distanz] of Object.entries(eingabe.distanzProLand)) {
    let kostenEur: number

    if (land === 'DE') {
      // Deutschland: Toll Collect
      kostenEur = berechneTollCollectKosten(
        distanz,
        eingabe.profil.mautDeutschlandEurProKm > 0 ? undefined : 6,
        5
      )
      // Falls Profil einen abweichenden DE-Satz hat, diesen verwenden
      if (eingabe.profil.mautDeutschlandEurProKm > 0) {
        kostenEur = distanz * eingabe.profil.mautDeutschlandEurProKm
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
