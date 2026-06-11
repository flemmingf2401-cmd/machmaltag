import { Container } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/komponenten/ui'

function Historie() {
  return (
    <section className="py-12 bg-bg-subtle min-h-[80vh]">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Historie</h1>
          <p className="text-text-secondary mt-2">
            Alle geprüften Frachtangebote mit Rentabilitätsberechnung.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bewertete Angebote</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary">
              Deine geprüften Angebote erscheinen hier.
              Nutze den Rechner, um Angebote zu bewerten.
            </p>
          </CardContent>
        </Card>
      </Container>
    </section>
  )
}

export { Historie }
