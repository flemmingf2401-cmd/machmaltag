import { useEffect } from 'react'
import { useAuth } from '@/geteilt/auth/supabase-auth'
import { useHistorieStore } from '@/geteilt/zustaende/historie-store'
import { formatiereWaehrung } from '@/geteilt/helfer/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Container } from '@/komponenten/ui'
import { Card, CardContent } from '@/komponenten/ui'
import { Button } from '@/komponenten/ui'
import { Badge } from '@/komponenten/ui'
import { Download, Check, X, Inbox } from 'lucide-react'

/** Historie als Tab-Inhalt (kein eigener Seiten-Wrapper) */
function HistorieTab() {
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
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Bewertete Angebote ({bewertungen.length})</h2>
        </div>
        {bewertungen.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleCsvExport}>
            <Download className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {laedt ? (
            <div className="py-12 text-center text-text-secondary">
              Daten werden geladen…
            </div>
          ) : bewertungen.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-text-secondary">
              <Inbox className="h-10 w-10 text-border" />
              <p>Deine geprüften Angebote erscheinen hier.</p>
              <p className="text-xs">Nutze den Rechner, um Angebote zu bewerten.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary sticky top-0 bg-white">
                    <th className="pb-3 pt-3 pr-4 pl-6 font-medium">Datum</th>
                    <th className="pb-3 pt-3 pr-4 font-medium">Route</th>
                    <th className="pb-3 pt-3 pr-4 font-medium text-right">Preis</th>
                    <th className="pb-3 pt-3 pr-4 font-medium text-right">Kosten</th>
                    <th className="pb-3 pt-3 pr-4 font-medium text-right">Marge</th>
                    <th className="pb-3 pt-3 pr-4 font-medium">Bewertung</th>
                    <th className="pb-3 pt-3 pr-6 font-medium">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {bewertungen.map((b) => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-primary-light/30 transition-colors">
                      <td className="py-3 pr-4 pl-6 text-text-secondary whitespace-nowrap">
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
                      <td className="py-3 pr-6">
                        {b.entscheidung === null ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-success hover:bg-success-light"
                              onClick={() => entscheidungSetzen(b.id, 'angenommen')}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Annehmen
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-error hover:bg-error-light"
                              onClick={() => entscheidungSetzen(b.id, 'abgelehnt')}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Ablehnen
                            </Button>
                          </div>
                        ) : (
                          <span className={`flex items-center gap-1 text-xs font-medium ${b.entscheidung === 'angenommen' ? 'text-success' : 'text-error'}`}>
                            {b.entscheidung === 'angenommen' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {b.entscheidung === 'angenommen' ? 'Angenommen' : 'Abgelehnt'}
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
    </>
  )
}

/** Eigenständige Historie-Seite (für /dashboard/historie Route) */
function Historie() {
  return (
    <section className="py-12 lg:py-16 bg-bg-subtle min-h-[80vh]">
      <Container>
        <HistorieTab />
      </Container>
    </section>
  )
}

export { Historie, HistorieTab }
