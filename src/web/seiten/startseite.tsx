import { Button } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardDescription } from '@/komponenten/ui'
import { Container } from '@/komponenten/ui'

function Startseite() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-24 text-white">
        <Container className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            MachMalTag
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Ein Tag, der Mitarbeitende zu etwas Besonderem macht.
            Gemeinsam Erlebnisse schaffen, die verbinden.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="accent" size="lg">
              Jetzt entdecken
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white/10 hover:text-white"
            >
              Mehr erfahren
            </Button>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bg-subtle">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">
            Was macht den MachMalTag besonders?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Gemeinschaft</CardTitle>
                <CardDescription>
                  Erlebnisse, die das Team zusammenbringen und den Zusammenhalt stärken.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💡 Kreativität</CardTitle>
                <CardDescription>
                  Raum für neue Ideen und Perspektiven abseits des Arbeitsalltags.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌟 Wertschätzung</CardTitle>
                <CardDescription>
                  Ein Tag, der zeigt: Jede und jeder Einzelne ist wichtig für uns.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-text-primary">
            Bereit für deinen MachMalTag?
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Melde dich an und gestalte deinen Tag unvergesslich.
          </p>
          <Button variant="accent" size="lg">
            Jetzt anmelden
          </Button>
        </Container>
      </section>
    </>
  )
}

export { Startseite }
