/**
 * Fixkosten-Fahrzeug-Berechnung.
 *
 * Verteilt monatliche Fixkosten auf die gefahrenen Kilometer.
 * Grundlage: 12.000 km/Monat als Standardauslastung.
 *
 * Enthaltene Posten:
 * - Kfz-Steuer
 * - HU/AU
 * - Versicherung
 * - Leasing/Abschreibung
 * - Wartung
 */

import type { BerechnungsEingabe, KostentreiberErgebnis } from './typen'
import { KM_PRO_MONAT } from './typen'
import { runde2 } from '@/geteilt/helfer/utils'

export function berechneFixkosten(eingabe: BerechnungsEingabe): KostentreiberErgebnis {
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
        betragEur: runde2((eingabe.distanzKm * profil.versicherungMonatlichEur) / KM_PRO_MONAT),
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
