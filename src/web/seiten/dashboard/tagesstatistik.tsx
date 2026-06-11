import { useEffect } from 'react'
import { useAuth } from '@/geteilt/auth/supabase-auth'
import { useHistorieStore, type TagesstatistikDaten } from '@/geteilt/zustaende/historie-store'
import { formatiereWaehrung } from '@/geteilt/helfer/utils'
import { Container } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/komponenten/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/komponenten/ui/tabs'
import { BarChart3, CheckCircle, XCircle, TrendingUp, ClipboardList } from 'lucide-react'
import { HistorieTab } from './historie'

function Tagesstatistik() {
  const { benutzer } = useAuth()
  const { statistik, statistikBerechnen } = useHistorieStore()

  useEffect(() => {
    if (benutzer) {
      statistikBerechnen(benutzer.id)
    }
  }, [benutzer, statistikBerechnen])

  const hatDaten = statistik && statistik.bewertetHeute > 0

  return (
    <section className="py-12 lg:py-16 bg-bg-subtle min-h-[80vh]">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-2">
            Tages- und Wochenstatistik deiner geprüften Angebote.
          </p>
        </div>

        <Tabs defaultValue="uebersicht">
          <TabsList className="mb-6">
            <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
            <TabsTrigger value="historie">Historie</TabsTrigger>
          </TabsList>

          <TabsContent value="uebersicht">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-text-secondary">
                    <BarChart3 className="h-4 w-4" />
                    Geprüft heute
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary">
                    {hatDaten ? statistik.bewertetHeute : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {hatDaten ? `${statistik.bewertetWoche} diese Woche` : 'Noch keine Daten'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Angenommen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-success">
                    {hatDaten ? statistik.angenommenHeute : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {hatDaten ? `${statistik.angenommenWoche} diese Woche` : 'Noch keine Daten'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-text-secondary">
                    <XCircle className="h-4 w-4 text-error" />
                    Abgelehnt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-error">
                    {hatDaten ? statistik.abgelehntHeute : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {hatDaten ? `${statistik.bewertetHeute - statistik.angenommenHeute - statistik.abgelehntHeute} offen` : 'Noch keine Daten'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-2 border-t-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-text-secondary">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    ∅ Marge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${hatDaten && statistik.margeDurchschnitt >= 0 ? 'text-success' : 'text-text-primary'}`}>
                    {hatDaten ? formatiereWaehrung(statistik.margeDurchschnitt) : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {hatDaten ? `Gesamt: ${formatiereWaehrung(statistik.margeGesamt)}` : 'Noch keine Daten'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detail-Karten */}
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distanz heute</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-text-primary">
                    {hatDaten ? `${statistik.distanzGesamt.toLocaleString('de-DE')} km` : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Geprüfte Strecken gesamt
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top-Route heute</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-text-primary">
                    {hatDaten && statistik.topRoute ? statistik.topRoute : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Am häufigsten geprüft
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Wochenübersicht</CardTitle>
              </CardHeader>
              <CardContent className="py-8 text-center">
                {hatDaten ? (
                  <WochenUebersicht statistik={statistik} />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-text-secondary">
                    <ClipboardList className="h-10 w-10 text-border" />
                    <p>Statistiken werden angezeigt, sobald du Angebote im Rechner prüfst.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historie">
            <HistorieTab />
          </TabsContent>
        </Tabs>
      </Container>
    </section>
  )
}

/** Einfache CSS-Fortschrittsbalken für Wochentage */
function WochenUebersicht({ statistik }: { statistik: TagesstatistikDaten }) {
  const tage = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const maxBewertet = Math.max(statistik.bewertetWoche, 1)
  // Demo-Verteilung: gleichmäßig auf die Wochentage
  const proTag = Math.max(1, Math.round(statistik.bewertetWoche / 5))
  const angenommenProTag = Math.max(0, Math.round(statistik.angenommenWoche / 5))

  return (
    <div className="grid grid-cols-7 gap-3">
      {tage.map((tag, i) => {
        const istWerktag = i < 5
        const bewertet = istWerktag ? proTag : 0
        const angenommen = istWerktag ? angenommenProTag : 0
        const hoehe = bewertet > 0 ? Math.max(8, (bewertet / maxBewertet) * 100) : 4

        return (
          <div key={tag} className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-text-secondary">{tag}</span>
            <div className="w-full bg-bg-subtle rounded-sm overflow-hidden" style={{ height: '80px' }}>
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className="w-full bg-primary/20 rounded-sm transition-all duration-300"
                  style={{ height: `${hoehe}%` }}
                >
                  {angenommen > 0 && (
                    <div
                      className="w-full bg-success rounded-sm transition-all duration-300"
                      style={{ height: `${(angenommen / bewertet) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-text-secondary">
              {istWerktag ? bewertet : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { Tagesstatistik }
