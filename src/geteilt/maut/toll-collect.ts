/**
 * Toll Collect-Tarife für Deutschland.
 *
 * Basiert auf Emissionsklasse und Achszahl.
 * Tarife müssen bei Änderungen durch Toll Collect aktualisiert werden.
 * Stand: 2024
 */

interface TollCollectTarif {
  euroKlasse: number
  achsen: number
  preisEurProKm: number
}

const TOLL_COLLECT_TARIFE: TollCollectTarif[] = [
  // Euro VI (ab 2014) — typisch für neue Sattelzüge
  { euroKlasse: 6, achsen: 4, preisEurProKm: 0.166 },
  { euroKlasse: 6, achsen: 5, preisEurProKm: 0.183 },

  // Euro V (2008-2013)
  { euroKlasse: 5, achsen: 4, preisEurProKm: 0.219 },
  { euroKlasse: 5, achsen: 5, preisEurProKm: 0.241 },

  // Euro EEV (Enhanced Environmentally Friendly Vehicle)
  { euroKlasse: -1, achsen: 4, preisEurProKm: 0.219 },
  { euroKlasse: -1, achsen: 5, preisEurProKm: 0.241 },

  // Euro III (2000-2005)
  { euroKlasse: 3, achsen: 4, preisEurProKm: 0.262 },
  { euroKlasse: 3, achsen: 5, preisEurProKm: 0.288 },

  // Euro II (1998-2000)
  { euroKlasse: 2, achsen: 4, preisEurProKm: 0.299 },
  { euroKlasse: 2, achsen: 5, preisEurProKm: 0.328 },
]

/** Fallback-Tarif falls kein passender gefunden wird */
const FALLBACK_TARIF_EUR_PRO_KM = 0.20

/**
 * Toll Collect-Kosten für eine gegebene Distanz berechnen.
 *
 * @param distanzKm - Distanz in km
 * @param euroKlasse - Euro-Emissionsklasse (2-6, -1 für EEV), Standard: 6
 * @param achsen - Achszahl (4 oder 5), Standard: 5
 * @returns Mautkosten in Euro
 */
export function berechneTollCollectKosten(
  distanzKm: number,
  euroKlasse: number = 6,
  achsen: number = 5
): number {
  const tarif = TOLL_COLLECT_TARIFE.find(
    (t) => t.euroKlasse === euroKlasse && t.achsen === achsen
  )

  if (tarif) {
    return distanzKm * tarif.preisEurProKm
  }

  // Fallback: nächstgelegener Tarif (gleiche Achsen, niedrigste Euro-Klasse)
  const naechster = TOLL_COLLECT_TARIFE
    .filter((t) => t.achsen >= achsen)
    .sort((a, b) => a.euroKlasse - b.euroKlasse)[0]

  return distanzKm * (naechster?.preisEurProKm ?? FALLBACK_TARIF_EUR_PRO_KM)
}

/**
 * Tarif-Tabelle für Anzeige zurückgeben.
 */
export function getTollCollectTarife(): TollCollectTarif[] {
  return [...TOLL_COLLECT_TARIFE]
}
