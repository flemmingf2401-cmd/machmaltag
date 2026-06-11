import { useEffect } from 'react'
import { useAuth } from '@/geteilt/auth/supabase-auth'
import { useHistorieStore } from '@/geteilt/zustaende/historie-store'
import { formatiereWaehrung } from '@/geteilt/helfer/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Container } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/komponenten/ui'
import { Button } from '@/komponenten/ui'
import { Badge } from '@/komponenten/ui'

function Historie() {
  const { benutzer } = useAuth()
  const { bewertungen, laedt, historieLaden, entscheidungSetzen, csvExportieren } = useHistorieStore()

  useEffect(() => {
    if (benutzer) {
      historieLaden(benutzer.id)
    }
  }, [benutzer, historieLaden])

  const handleCsvExport = () => {
    const csv = csvExportieren()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `machmaltag-historie-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const bewertungBadge = (bewertung: string) => {
    const variant = bewertung === 'profitabel'
      ? 'success'
      : bewertung === 'grenzwertig'
        ? 'warning'
        : 'error'
    const text = bewertung === 'profitabel'
      ? 'Profitabel'
      : bewertung === 'grenzwertig'
        ? 'Grenzwertig'
        : 'Verlust'
    return <Badge variant={variant as 'success' | 'warning' | 'error'}>{text}</Badge>
  }

  return (
    <section className="py-12 bg-bg-subtle min-h-[80vh]">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Historie</h1>
            <p className="text-text-secondary mt-2">
              Alle geprüften Frachtangebote mit Rentabilitätsberechnung.
            </p>
          </div>
          {bewertungen.length > 0 && (
            <Button variant="outline" onClick={handleCsvExport}>
              CSV Export
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bewertete Angebote ({bewertungen.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {laedt ? (
              <div className="py-12 text-center text-text-secondary">
                Daten werden geladen…
              </div>
            ) : bewertungen.length === 0 ? (
              <div className="py-12 text-center text-text-secondary">
                Deine geprüften Angebote erscheinen hier.
                Nutze den Rechner, um Angebote zu bewerten.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-secondary">
                      <th className="pb-3 pr-4 font-medium">Datum</th>
                      <th className="pb-3 pr-4 font-medium">Route</th>
                      <th className="pb-3 pr-4 font-medium text-right">Preis</th>
                      <th className="pb-3 pr-4 font-medium text-right">Kosten</th>
                      <th className="pb-3 pr-4 font-medium text-right">Marge</th>
                      <th className="pb-3 pr-4 font-medium">Bewertung</th>
                      <th className="pb-3 font-medium">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bewertungen.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 hover:bg-bg-subtle/50">
                        <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                          {format(b.bewertetAm, 'dd.MM.yy HH:mm', { locale: de })}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-medium text-text-primary">{b.ladeort}</span>
                          <span className="text-text-secondary mx-1">→</span>
                          <span className="font-medium text-text-primary">{b.entladeort}</span>
                          {b.distanzKm && (
                            <span className="text-xs text-text-secondary ml-2">
                              {b.distanzKm} km
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-text-primary">
                          {formatiereWaehrung(b.preisEur)}
                        </td>
                        <td className="py-3 pr-4 text-right text-text-secondary">
                          {formatiereWaehrung(b.kostenGesamtEur)}
                        </td>
                        <td className={`py-3 pr-4 text-right font-medium ${b.margeEur >= 0 ? 'text-success' : 'text-error'}`}>
                          {b.margeEur >= 0 ? '+' : ''}{formatiereWaehrung(b.margeEur)}
                          <span className="text-xs text-text-secondary ml-1">
                            ({b.margeProzent >= 0 ? '+' : ''}{b.margeProzent.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {bewertungBadge(b.bewertung)}
                        </td>
                        <td className="py-3">
                          {b.entscheidung === null ? (
                            <div className="flex gap-1">
                              <button
                                className="rounded px-2 py-1 text-xs font-medium bg-success-light text-success hover:bg-success/20 transition-colors"
                                onClick={() => entscheidungSetzen(b.id, 'angenommen')}
                              >
                                Annehmen
                              </button>
                              <button
                                className="rounded px-2 py-1 text-xs font-medium bg-error-light text-error hover:bg-error/20 transition-colors"
                                onClick={() => entscheidungSetzen(b.id, 'abgelehnt')}
                              >
                                Ablehnen
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs font-medium ${b.entscheidung === 'angenommen' ? 'text-success' : 'text-error'}`}>
                              {b.entscheidung === 'angenommen' ? '✓ Angenommen' : '✗ Abgelehnt'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </section>
  )
}

export { Historie }
