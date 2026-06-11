/**
 * Diesel/Kraftstoff-Kostenberechnung.
 *
 * Berechnet die Kraftstoffkosten basierend auf:
 * - Verbrauch pro 100 km
 * - Aktuellem Dieselpreis
 * - Leerkilometer-Aufschlag (höherer Verbrauch bei Leerfahrt)
 */

import type { BerechnungsEingabe, KostentreiberErgebnis } from './typen'
import { runde2 } from '@/geteilt/helfer/utils'

export function berechneDieselKosten(eingabe: BerechnungsEingabe): KostentreiberErgebnis {
  const profil = eingabe.profil

  // Basisverbrauch: (distanz / 100) × verbrauch
  const basisVerbrauchL = (eingabe.distanzKm / 100) * profil.verbrauchLPro100Km

  // Leerkilmeter-Aufschlag: Anteil × Aufschlag-Faktor
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
