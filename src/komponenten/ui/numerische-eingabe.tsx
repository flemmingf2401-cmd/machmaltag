/**
 * NumerischeEingabe — Spezialisierte Eingabe für Währungs-, Distanz- und Prozentwerte.
 *
 * Features:
 * - Rechtsbündige Darstellung
 * - Einheiten-Suffix (€, km, h, %)
 * - Auto-Formatierung bei Blur
 * - Min/Max/Step-Validierung
 * - Verhindert nicht-numerische Eingabe
 */

import * as React from 'react'
import { cn } from '@/geteilt/helfer/utils'

type Einheit = 'EUR' | 'km' | 'h' | '%' | ''

interface NumerischeEingabeProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  /** Einheit für Suffix-Anzeige */
  einheit?: Einheit
  /** Callback bei Wertänderung (numerisch) */
  wertAendern: (wert: number) => void
  /** Aktueller Wert */
  wert: number
  /** Dezimalstellen für Formatierung */
  dezimalstellen?: number
  /** Minimalwert */
  min?: number
  /** Maximalwert */
  max?: number
  /** Schrittweite */
  step?: number
}

const EINHEIT_SUFFIX: Record<Einheit, string> = {
  EUR: '€',
  km: 'km',
  h: 'h',
  '%': '%',
  '': '',
}

function NumerischeEingabe({
  einheit = '',
  wertAendern,
  wert,
  dezimalstellen = 2,
  min,
  max,
  step,
  className,
  disabled,
  id,
  placeholder,
  ...rest
}: NumerischeEingabeProps) {
  const [anzeigeWert, setAnzeigeWert] = React.useState<string>(() =>
    formatiereEingabe(wert, einheit, dezimalstellen)
  )
  const [fokussiert, setFokussiert] = React.useState(false)

  // Wert-Aktualisierung von außen
  React.useEffect(() => {
    if (!fokussiert) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnzeigeWert(formatiereEingabe(wert, einheit, dezimalstellen))
    }
  }, [wert, einheit, dezimalstellen, fokussiert])

  const handleFokus = React.useCallback(() => {
    setFokussiert(true)
    // Rohe Zahl ohne Formatierung anzeigen
    setAnzeigeWert(wert.toString())
  }, [wert])

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFokussiert(false)
      let wertNeu = parseFloat(e.target.value)
      if (isNaN(wertNeu)) wertNeu = 0

      // Min/Max clampen
      if (min !== undefined) wertNeu = Math.max(min, wertNeu)
      if (max !== undefined) wertNeu = Math.min(max, wertNeu)

      // Auf step runden
      if (step !== undefined && step > 0) {
        wertNeu = Math.round(wertNeu / step) * step
      }

      wertAendern(wertNeu)
      setAnzeigeWert(formatiereEingabe(wertNeu, einheit, dezimalstellen))
    },
    [wertAendern, einheit, dezimalstellen, min, max, step]
  )

  const handleAenderung = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rohwert = e.target.value
      // Nur Zahlen, Komma, Punkt und Minus erlauben
      if (/^-?\d*[.,]?\d*$/.test(rohwert) || rohwert === '') {
        setAnzeigeWert(rohwert)
      }
    },
    []
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Pfeiltasten mit step
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const schritt = step ?? (einheit === '%' ? 1 : 0.01)
        const richtung = e.key === 'ArrowUp' ? 1 : -1
        let wertNeu = wert + schritt * richtung
        if (min !== undefined) wertNeu = Math.max(min, wertNeu)
        if (max !== undefined) wertNeu = Math.min(max, wertNeu)
        wertAendern(wertNeu)
      }
    },
    [wert, step, einheit, min, max, wertAendern]
  )

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className={cn(
          'flex h-11 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary',
          'text-right tabular-nums',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'placeholder:text-placeholder',
          'disabled:cursor-not-allowed disabled:opacity-50',
          einheit && 'pr-12',
          className
        )}
        value={anzeigeWert}
        onChange={handleAenderung}
        onFocus={handleFokus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={rest['aria-label']}
      />
      {einheit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary pointer-events-none">
          {EINHEIT_SUFFIX[einheit]}
        </span>
      )}
    </div>
  )
}

function formatiereEingabe(wert: number, einheit: Einheit, dezimalstellen: number): string {
  if (isNaN(wert)) return '0'

  if (einheit === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: dezimalstellen,
      maximumFractionDigits: dezimalstellen,
    }).format(wert)
  }

  if (einheit === '%') {
    return wert.toFixed(0)
  }

  if (einheit === 'km' || einheit === 'h') {
    return wert.toFixed(dezimalstellen > 0 ? 1 : 0)
  }

  return wert.toFixed(dezimalstellen)
}

export { NumerischeEingabe, type NumerischeEingabeProps, type Einheit }
