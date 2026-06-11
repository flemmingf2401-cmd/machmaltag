/**
 * KostentreiberKarte — Darstellung eines einzelnen Kostentreibers.
 *
 * Zeigt Bezeichnung + Gesamtbetrag, aufklappbar für einzelne Positionen.
 * Wird von Web-App und Browser-Extension gemeinsam genutzt.
 */

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import type { KostentreiberErgebnis } from '@/geteilt/rechner/typen'
import { formatiereWaehrung } from '@/geteilt/helfer/utils'
import { cn } from '@/geteilt/helfer/utils'

interface KostentreiberKarteProps {
  treiber: KostentreiberErgebnis
  /** Farbcode nach Typ: diesel=blau, fahrer=grün, maut=orange, fixkosten=grau */
  farbklasse?: string
  /** Initial aufgeklappt */
  aufgeklappt?: boolean
  /** Kompakte Darstellung für Extension */
  kompakt?: boolean
}

const STANDARD_FARBE: Record<string, string> = {
  'Diesel/Kraftstoff': 'border-l-primary',
  'Fahrerpersonal': 'border-l-success',
  'Maut/Toll': 'border-l-accent',
  'Fixkosten Fahrzeug': 'border-l-text-secondary',
}

function KostentreiberKarte({
  treiber,
  farbklasse,
  aufgeklappt: aufgeklapptProp,
  kompakt = false,
}: KostentreiberKarteProps) {
  const [aufgeklappt, setAufgeklappt] = React.useState(aufgeklapptProp ?? false)
  const farbe = farbklasse ?? STANDARD_FARBE[treiber.bezeichnung] ?? 'border-l-border'

  return (
    <div className={cn('border-l-4 rounded-md', farbe, kompakt ? 'p-2' : 'p-3')}>
      <button
        type="button"
        onClick={() => setAufgeklappt(!aufgeklappt)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className={cn('font-medium text-text-primary', kompakt ? 'text-xs' : 'text-sm')}>
          {treiber.bezeichnung}
        </span>
        <span className="flex items-center gap-2">
          <span className={cn('font-semibold text-text-primary', kompakt ? 'text-xs' : 'text-sm')}>
            {formatiereWaehrung(treiber.betragEur)}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-secondary transition-transform',
              aufgeklappt && 'rotate-180'
            )}
          />
        </span>
      </button>

      {aufgeklappt && treiber.positionen.length > 0 && (
        <div className={cn('mt-2 space-y-1', kompakt ? 'pl-2' : 'pl-4')}>
          {treiber.positionen.map((pos) => (
            <div
              key={pos.bezeichnung}
              className="flex items-center justify-between text-text-secondary"
            >
              <span className={kompakt ? 'text-[10px]' : 'text-xs'}>
                {pos.bezeichnung}
                {pos.detail && <span className="ml-1 opacity-70">({pos.detail})</span>}
              </span>
              <span className={kompakt ? 'text-[10px]' : 'text-xs'}>
                {formatiereWaehrung(pos.betragEur)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { KostentreiberKarte }
