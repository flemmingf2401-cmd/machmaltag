/**
 * Fahrerpersonal-Kostenberechnung.
 *
 * Berechnet die Personalkosten basierend auf:
 * - Stundenlohn × korrigierte Fahrzeit
 * - Spesen (Tagesgeld)
 * - Übernachtungskosten
 * - EU-Lenkzeitvorgaben (max. 8,5 h/Tag)
 */

import type { BerechnungsEingabe, KostentreiberErgebnis } from './typen'
import { runde2 } from '@/geteilt/helfer/utils'

/** Maximale Lenkzeit pro Tag nach EU-Verordnung */
const MAX_LENKZEIT_PRO_TAG_H = 8.5

export function berechneFahrerkosten(eingabe: BerechnungsEingabe): KostentreiberErgebnis {
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
