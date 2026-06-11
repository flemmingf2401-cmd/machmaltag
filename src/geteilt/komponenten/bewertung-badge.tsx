/**
 * BewertungBadge — Farbkodierte Rentabilitätsbewertung.
 *
 * Wird von Web-App und Browser-Extension gemeinsam genutzt.
 */

import type { Bewertung } from '@/geteilt/rechner/typen'
import { Badge } from '@/komponenten/ui/badge'

interface BewertungBadgeProps {
  bewertung: Bewertung
  groesse?: 'sm' | 'md'
}

const BEWERTUNG_KONFIG: Record<Bewertung, { variant: 'success' | 'warning' | 'error'; text: string }> = {
  profitabel: { variant: 'success', text: 'Profitabel' },
  grenzwertig: { variant: 'warning', text: 'Grenzwertig' },
  verlust: { variant: 'error', text: 'Verlust' },
}

function BewertungBadge({ bewertung, groesse = 'md' }: BewertungBadgeProps) {
  const konfig = BEWERTUNG_KONFIG[bewertung]
  return (
    <Badge variant={konfig.variant} className={groesse === 'sm' ? 'text-xs' : 'text-sm px-3 py-1'}>
      {konfig.text}
    </Badge>
  )
}

export { BewertungBadge }
