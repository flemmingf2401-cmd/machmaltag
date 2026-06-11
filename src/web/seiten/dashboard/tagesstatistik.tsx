import { useEffect } from 'react'
import { useAuth } from '@/geteilt/auth/supabase-auth'
import { useHistorieStore } from '@/geteilt/zustaende/historie-store'
import { formatiereWaehrung } from '@/geteilt/helfer/utils'
import { Container } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/komponenten/ui'

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
    <section className="py-12 bg-bg-subtle min-h-[80vh]">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-2">
            Tages- und Wochenstatistik deiner geprüften Angebote.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary">Geprüft heute</CardTitle>
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
              <CardTitle className="text-sm text-text-secondary">Angenommen</CardTitle>
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
              <CardTitle className="text-sm text-text-secondary">Abgelehnt</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary">∅ Marge</CardTitle>
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
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary">
              {hatDaten
                ? 'Diagramm wird in einer späteren Version hinzugefügt.'
                : 'Statistiken werden angezeigt, sobald du Angebote im Rechner prüfst.'}
            </p>
          </CardContent>
        </Card>
      </Container>
    </section>
  )
}

export { Tagesstatistik }
