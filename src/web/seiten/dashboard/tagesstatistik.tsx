import { Container } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/komponenten/ui'

function Tagesstatistik() {
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
              <p className="text-3xl font-bold text-text-primary">—</p>
              <p className="text-xs text-text-secondary mt-1">Noch keine Daten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary">Angenommen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">—</p>
              <p className="text-xs text-text-secondary mt-1">Noch keine Daten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary">Abgelehnt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-error">—</p>
              <p className="text-xs text-text-secondary mt-1">Noch keine Daten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary">∅ Marge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-text-primary">—</p>
              <p className="text-xs text-text-secondary mt-1">Noch keine Daten</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Wochenübersicht</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary">
              Statistiken werden angezeigt, sobald du Angebote im Rechner prüfst.
            </p>
          </CardContent>
        </Card>
      </Container>
    </section>
  )
}

export { Tagesstatistik }
