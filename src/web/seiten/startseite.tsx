import { Link } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardDescription, Container, Testimonials } from '@/komponenten/ui'
import type { Referenz } from '@/komponenten/ui'
import { Calculator, TrendingUp, Clock, AlertTriangle, CheckCircle, ArrowRight, MapPin, Eye, BarChart3 } from 'lucide-react'

const kundenstimmen: Referenz[] = [
  {
    bild: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    name: 'Markus Schneider',
    benutzername: '@m.schneider_sped',
    text: 'Endlich keine Excel-Kopfrechnerei mehr. Ich gebe die Angebotsdaten ein und sehe sofort, ob sich die Fahrt lohnt.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
    name: 'Sandra Weber',
    benutzername: '@sandra_disp',
    text: 'Seit ich den MachMalTag nutze, habe ich deutlich weniger Verlustfahrten. Die Marge-Berechnung ist ein Gamechanger.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
    name: 'Thomas Braun',
    benutzername: '@t.braun_logistik',
    text: 'Früher habe ich oft Blindbids abgegeben. Jetzt prüfe ich jedes Angebot in Sekunden und entscheide fundiert.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
    name: 'Katrin Fischer',
    benutzername: '@k.fischer_trans',
    text: 'Die farbcodierte Bewertung hilft mir auf einen Blick zu sehen: grün = nehmen, rot = lassen. Extrem intuitiv.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    name: 'Stefan Müller',
    benutzername: '@s.mueller_fleet',
    text: 'Unsere Disponenten sparen jetzt pro Tag 30 Minuten Rechenzeit. Das summiert sich auf den ganzen Monat enorm.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1534528741775-53994a2da032?q=80&w=256&auto=format&fit=crop',
    name: 'Lisa Hoffmann',
    benutzername: '@l.hoffmann_cargo',
    text: 'Ich nutze den Rechner täglich auf der TimoCom-Plattform. Kein Kontextwechsel, alles in einem Workflow.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1599566150163-a29178d56e3c?q=80&w=256&auto=format&fit=crop',
    name: 'Jörg Krause',
    benutzername: '@j.krause_spedition',
    text: 'Die Kostenaufschlüsselung ist detailliert und transparent. So kann ich dem Chef jede Entscheidung begründen.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=256&auto=format&fit=crop',
    name: 'Anna Richter',
    benutzername: '@a.richter_dispatch',
    text: 'Vormals habe ich gute Angebote verpasst, weil ich zu lange gerechnet habe. Jetzt entscheide ich in Echtzeit.',
    socialUrl: 'https://twitter.com',
  },
  {
    bild: 'https://images.unsplash.com/photo-1496440737103-cd00c3b29e7e?q=80&w=256&auto=format&fit=crop',
    name: 'Daniel Lang',
    benutzername: '@d.lang_gueter',
    text: 'Der MachMalTag ist aus meinem Arbeitsalltag nicht mehr wegzudenken. Marge vorher wissen – einfach genial.',
    socialUrl: 'https://twitter.com',
  },
]

function Startseite() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-28 lg:py-36 text-white">
        <Container className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Frachtangebote sofort auf Rentabilität prüfen
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Kein Blindbidding mehr, keine Excel-Kopfrechnerei. Gib die Angebotsdaten ein
            und sieh in Sekunden: rentabel oder Verlust.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/rechner">
              <Button variant="accent" size="lg">
                Jetzt kostenlos testen
              </Button>
            </Link>
            <a href="#so-gehts">
              <Button
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white/10 hover:text-white"
              >
                So geht's
              </Button>
            </a>
          </div>
        </Container>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-24 lg:py-32 bg-bg-subtle">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight text-center mb-14 text-text-primary">
            Diese Probleme kennst du?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-t-2 border-t-accent hover:-translate-y-1 transition-all duration-150">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-error shrink-0" />
                  <CardTitle>Blindes Bieten?</CardTitle>
                </div>
                <CardDescription>
                  Angebote ohne Kostenprüfung angenommen – und am Monatsende rote Zahlen.
                </CardDescription>
                <p className="mt-3 text-sm font-medium text-primary">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  Sofort sehen: rentabel oder Verlust
                </p>
              </CardHeader>
            </Card>

            <Card className="hover:-translate-y-1 transition-all duration-150">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="h-5 w-5 text-warning shrink-0" />
                  <CardTitle>Manuell gerechnet?</CardTitle>
                </div>
                <CardDescription>
                  Kopfrechnen oder Excel – langsam, fehleranfällig, jedes Mal von vorn.
                </CardDescription>
                <p className="mt-3 text-sm font-medium text-primary">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  Echtzeit-Ergebnis während du tippst
                </p>
              </CardHeader>
            </Card>

            <Card className="hover:-translate-y-1 transition-all duration-150">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-accent shrink-0" />
                  <CardTitle>Gute Angebote verpasst?</CardTitle>
                </div>
                <CardDescription>
                  Während du noch rechnest, hat schon jemand anderes zugeschlagen.
                </CardDescription>
                <p className="mt-3 text-sm font-medium text-primary">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  In Sekunden entscheiden
                </p>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </section>

      {/* So geht's Section */}
      <section id="so-gehts" className="py-24 lg:py-32">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight text-center mb-14 text-text-primary">
            So geht's – in 3 Schritten
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Angebotsdaten eingeben
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                Ladeort, Entladeort, Distanz, Preis – direkt aus dem TimoCom-Angebot.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-white">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Ergebnis sehen
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                Sofort: Marge in Euro und Prozent, Bewertung farbcodiert,
                Kostenaufschlüsselung auf einen Blick.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                Bewerten und lernen
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                Angebot annehmen oder ablehnen. Deine Historie hilft dir,
                bessere Entscheidungen zu treffen.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Kundenstimmen Section */}
      <section className="py-24 lg:py-32 bg-bg-subtle">
        <Container>
          <Testimonials referenzen={kundenstimmen} titel="Kundenstimmen" />
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-accent-glow">
        <Container className="text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-accent mb-4" />
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-text-primary">
            Bereit, rentabler zu arbeiten?
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Starte jetzt – kostenlos und ohne Anmeldung. Hinterlege später
            deine eigenen Kostenkennzahlen für noch genauere Ergebnisse.
          </p>
          <Link to="/rechner">
            <Button variant="accent" size="lg">
              Jetzt kostenlos testen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Container>
      </section>
    </>
  )
}

export { Startseite }
