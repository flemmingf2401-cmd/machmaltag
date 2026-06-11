/**
 * ErgebnisZusammenfassung — Darstellung des Rentabilitätsergebnisses.
 *
 * Zeigt Bewertung, Gesamtkosten, Marge, Nettomarge und Kostentreiber-Aufschlüsselung.
 * Wird von Web-App und Browser-Extension gemeinsam genutzt.
 */

import type { BerechnungsErgebnis } from '@/geteilt/rechner/typen'
import { formatiereWaehrung, formatiereProzent } from '@/geteilt/helfer/utils'
import { BewertungBadge } from './bewertung-badge'
import { KostentreiberKarte } from './kostentreiber-karte'

interface ErgebnisZusammenfassungProps {
  ergebnis: BerechnungsErgebnis
  angebotPreisEur: number
  /** Kompakte Darstellung für Extension */
  kompakt?: boolean
  /** Zeige "Speichern"-Aktion */
  onSpeichern?: () => void
}

function ErgebnisZusammenfassung({
  ergebnis,
  angebotPreisEur,
  kompakt = false,
  onSpeichern,
}: ErgebnisZusammenfassungProps) {
  const treiber = [
    ergebnis.kostentreiber.diesel,
    ergebnis.kostentreiber.fahrer,
    ergebnis.kostentreiber.maut,
    ergebnis.kostentreiber.fixkosten,
  ]

  return (
    <div className={kompakt ? 'space-y-3' : 'space-y-6'}>
      {/* Haupt-Ergebnis */}
      <div className="text-center space-y-3">
        <BewertungBadge bewertung={ergebnis.bewertung} groesse={kompakt ? 'sm' : 'md'} />

        <div>
          <p className={kompakt ? 'text-2xl font-bold text-text-primary' : 'text-4xl font-bold text-text-primary'}>
            {ergebnis.margeEur >= 0 ? '+' : ''}{formatiereWaehrung(ergebnis.margeEur)}
          </p>
          <p className={kompakt ? 'text-sm text-text-secondary' : 'text-lg text-text-secondary'}>
            {ergebnis.margeProzent >= 0 ? '+' : ''}{formatiereProzent(ergebnis.margeProzent)} Marge
          </p>
        </div>

        {/* Erlös vs. Kosten */}
        <div className={kompakt ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 gap-4 pt-2'}>
          <div className="rounded-lg bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Erlös</p>
            <p className={kompakt ? 'text-base font-semibold' : 'text-xl font-semibold'}>
              {formatiereWaehrung(angebotPreisEur)}
            </p>
          </div>
          <div className="rounded-lg bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Kosten</p>
            <p className={kompakt ? 'text-base font-semibold' : 'text-xl font-semibold'}>
              {formatiereWaehrung(ergebnis.kostenGesamtEur)}
            </p>
          </div>
        </div>

        {/* Nettomarge */}
        {ergebnis.verdraengungskostenEur > 0 && (
          <div className="rounded-lg bg-warning-light p-3 text-sm">
            <p className="font-medium text-accent-dark">Nettomarge nach Verdrängung</p>
            <p className="text-lg font-bold text-accent-dark">
              {ergebnis.nettomargeEur >= 0 ? '+' : ''}{formatiereWaehrung(ergebnis.nettomargeEur)}
            </p>
          </div>
        )}
      </div>

      {/* Kostentreiber-Aufschlüsselung */}
      <div className="space-y-2">
        <h3 className={kompakt ? 'text-xs font-semibold text-text-secondary' : 'text-sm font-semibold text-text-secondary'}>
          Kostenaufschlüsselung
        </h3>
        {treiber.map((t) => (
          <KostentreiberKarte key={t.bezeichnung} treiber={t} kompakt={kompakt} />
        ))}
      </div>

      {/* Aktionen */}
      {onSpeichern && (
        <button
          type="button"
          onClick={onSpeichern}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          In Historie speichern
        </button>
      )}
    </div>
  )
}

export { ErgebnisZusammenfassung }
