/**
 * Rentabilitäts-Berechnungs-Orchestrator.
 *
 * Führt alle 4 Kostentreiber zusammen und berechnet:
 * - Gesamtkosten
 * - Marge (€ und %)
 * - Nettomarge (nach Verdrängungskosten)
 * - Bewertung (profitabel / grenzwertig / verlust)
 */

import type { BerechnungsEingabe, BerechnungsErgebnis, Bewertung } from './typen'
import { berechneDieselKosten } from './diesel'
import { berechneFahrerkosten } from './fahrer'
import { berechneMautkosten } from './maut'
import { berechneFixkosten } from './fixkosten'
import { runde2 } from '@/geteilt/helfer/utils'

/** Marge-Schwellenwerte für Bewertung */
const SCHWELLE_PROFITABEL = 5 // > 5% = profitabel
const SCHWELLE_GRENZWERTIG = 0 // 0-5% = grenzwertig, < 0% = verlust

/**
 * Rentabilität eines Frachtangebots berechnen.
 *
 * @param angebotPreisEur - Angebotspreis (Erlös) in Euro
 * @param eingabe - Berechnungseingabe mit Distanz, Profil etc.
 * @returns Vollständiges Berechnungsergebnis
 */
export function berechneRentabilitaet(
  angebotPreisEur: number,
  eingabe: BerechnungsEingabe
): BerechnungsErgebnis {
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
  const bewertung: Bewertung =
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
