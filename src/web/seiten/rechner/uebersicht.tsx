import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { berechneRentabilitaet } from '@/geteilt/rechner/rentabilitaet'
import type { BerechnungsEingabe, BerechnungsErgebnis, KostenvorlageWerte } from '@/geteilt/rechner/typen'
import { FAHRZEUGTYPEN } from '@/geteilt/rechner/typen'
import { useRoutingStore } from '@/geteilt/zustaende/routing-store'
import { formatiereWaehrung, formatiereProzent } from '@/geteilt/helfer/utils'
import { Button } from '@/komponenten/ui'
import { Input } from '@/komponenten/ui'
import { Label } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/komponenten/ui'
import { Badge } from '@/komponenten/ui'
import { Container } from '@/komponenten/ui'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/komponenten/ui/select'
import { useToast } from '@/komponenten/ui/toast'
import { Copy } from 'lucide-react'

// Demo-Profil für sofortige Nutzung ohne Supabase
const DEMO_PROFIL: KostenvorlageWerte = {
  verbrauchLPro100Km: 32,
  dieselPreisEurL: 1.65,
  leerkilometerAufschlag: 0.1,
  stundenlohnEur: 18.5,
  lenkzeitKorrekturfaktor: 1.2,
  spesenProTagEur: 35,
  uebernachtungEur: 65,
  mautDeutschlandEurProKm: 0.183,
  eurovignetteBetragEur: 0,
  mautAuslandPauschalEurProKm: 0.15,
  kfzSteuerMonatlichEur: 150,
  huAuMonatlichEur: 25,
  versicherungMonatlichEur: 400,
  leasingAbschreibungMonatlichEur: 2500,
  wartungMonatlichEur: 200,
}

function RechnerUebersicht() {
  const { toastHinzufuegen } = useToast()

  // Eingabefelder
  const [ladeort, setLadeort] = useState('')
  const [entladeort, setEntladeort] = useState('')
  const [distanzKm, setDistanzKm] = useState(0)
  const [preisEur, setPreisEur] = useState(1200)
  const [fahrzeugtyp, setFahrzeugtyp] = useState<'sattelzug' | 'zugmaschine'>('sattelzug')
  const [leerkilometerAnteil, setLeerkilometerAnteil] = useState(0)
  const [verdraengungskostenEur, setVerdraengungskostenEur] = useState(0)
  const [fahrzeitStunden, setFahrzeitStunden] = useState(0)
  const [uebernachtungen, setUebernachtungen] = useState(0)

  // Routing-Store
  const { route, laedt: routeLaeft, fehler: routeFehler, routeBerechnen } = useRoutingStore()

  // Debounced Routing: Route automatisch berechnen wenn beide Orte eingegeben sind
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const routingAusloesen = useCallback((von: string, nach: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(async () => {
      if (von.trim().length >= 3 && nach.trim().length >= 3) {
        const ergebnis = await routeBerechnen(von, nach)
        if (ergebnis) {
          setDistanzKm(ergebnis.distanzKm)
          setFahrzeitStunden(ergebnis.fahrzeitStunden)
          // Übernachtungen automatisch ableiten (>8.5h = 1 Nacht)
          setUebernachtungen(ergebnis.fahrzeitStunden > 8.5 ? 1 : 0)
        }
      }
    }, 800) // 800ms Debounce
  }, [routeBerechnen])

  // Debounce-Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // Ladeort-Änderung
  const handleLadeortChange = (wert: string) => {
    setLadeort(wert)
    routingAusloesen(wert, entladeort)
  }

  // Entladeort-Änderung
  const handleEntladeortChange = (wert: string) => {
    setEntladeort(wert)
    routingAusloesen(ladeort, wert)
  }

  // Berechnung ausführen
  const ergebnis: BerechnungsErgebnis | null = useMemo(() => {
    if (distanzKm <= 0 || preisEur <= 0) return null

    const laender = route?.laender ?? ['DE']
    const distanzProLand = route?.distanzProLand ?? { DE: distanzKm }

    const eingabe: BerechnungsEingabe = {
      distanzKm,
      leerkilometerAnteil,
      fahrzeitStunden,
      uebernachtungen,
      laender,
      distanzProLand,
      profil: DEMO_PROFIL,
      verdraengungskostenEur,
    }

    return berechneRentabilitaet(preisEur, eingabe)
  }, [distanzKm, preisEur, leerkilometerAnteil, fahrzeitStunden, uebernachtungen, verdraengungskostenEur, route])

  const bewertungFarbe = ergebnis?.bewertung === 'profitabel'
    ? 'success'
    : ergebnis?.bewertung === 'grenzwertig'
      ? 'warning'
      : 'error'

  const bewertungText = ergebnis?.bewertung === 'profitabel'
    ? 'Profitabel'
    : ergebnis?.bewertung === 'grenzwertig'
      ? 'Grenzwertig'
      : 'Verlust'

  // Ergebnis als Text kopieren
  const ergebnisKopieren = useCallback(() => {
    if (!ergebnis) return

    const bewertungLabel =
      ergebnis.bewertung === 'profitabel' ? 'Profitabel' :
      ergebnis.bewertung === 'grenzwertig' ? 'Grenzwertig' : 'Verlust'

    const text = [
      `MachMalTag – Rentabilitätsprüfung`,
      `${ladeort || '—'} → ${entladeort || '—'}`,
      `Distanz: ${distanzKm} km | Preis: ${formatiereWaehrung(preisEur)}`,
      `Fahrzeug: ${FAHRZEUGTYPEN[fahrzeugtyp].bezeichnung}`,
      ``,
      `Bewertung: ${bewertungLabel}`,
      `Marge: ${ergebnis.margeEur >= 0 ? '+' : ''}${formatiereWaehrung(ergebnis.margeEur)} (${formatiereProzent(ergebnis.margeProzent)})`,
      `Kosten gesamt: ${formatiereWaehrung(ergebnis.kostenGesamtEur)}`,
      `  Diesel: ${formatiereWaehrung(ergebnis.kostentreiber.diesel.betragEur)}`,
      `  Fahrer: ${formatiereWaehrung(ergebnis.kostentreiber.fahrer.betragEur)}`,
      `  Maut: ${formatiereWaehrung(ergebnis.kostentreiber.maut.betragEur)}`,
      `  Fixkosten: ${formatiereWaehrung(ergebnis.kostentreiber.fixkosten.betragEur)}`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      toastHinzufuegen({ beschreibung: 'Ergebnis in die Zwischenablage kopiert', art: 'success' })
    }).catch(() => {
      toastHinzufuegen({ beschreibung: 'Kopieren fehlgeschlagen', art: 'error' })
    })
  }, [ergebnis, ladeort, entladeort, distanzKm, preisEur, fahrzeugtyp, toastHinzufuegen])

  return (
    <section className="py-12 bg-bg-subtle min-h-[80vh]">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Rentabilitäts-Rechner
          </h1>
          <p className="text-text-secondary mt-2">
            Gib Start und Ziel ein — Distanz und Fahrzeit werden automatisch berechnet.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Linke Spalte: Eingabe */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Angebotsdaten</CardTitle>
                <CardDescription>
                  Gib die Daten aus dem TimoCom-Angebot ein. PLZ oder Ortsname werden automatisch geroutet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ladeort">Ladeort (PLZ oder Ort)</Label>
                    <Input
                      id="ladeort"
                      placeholder="20095 oder Hamburg"
                      value={ladeort}
                      onChange={(e) => handleLadeortChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entladeort">Entladeort (PLZ oder Ort)</Label>
                    <Input
                      id="entladeort"
                      placeholder="80331 oder München"
                      value={entladeort}
                      onChange={(e) => handleEntladeortChange(e.target.value)}
                    />
                  </div>
                </div>

                {/* Routing-Status */}
                {routeLaeft && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Route wird berechnet…
                  </div>
                )}
                {routeFehler && (
                  <div className="rounded-md bg-warning-light p-3 text-sm text-accent-dark">
                    ⚠️ {routeFehler} — Gib die Distanz manuell ein.
                  </div>
                )}
                {route && !routeLaeft && (
                  <div className="rounded-md bg-success-light p-3 text-sm text-success">
                    ✅ Route berechnet: {route.distanzKm} km, ~{route.fahrzeitStunden.toFixed(1)} h Fahrzeit
                    {route.laender.length > 1 && (` über ${route.laender.join(', ')}`)}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distanz">Distanz (km)</Label>
                    <Input
                      id="distanz"
                      type="number"
                      min={1}
                      value={distanzKm || ''}
                      onChange={(e) => setDistanzKm(Number(e.target.value))}
                      placeholder="Auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preis">Angebotspreis (€)</Label>
                    <Input
                      id="preis"
                      type="number"
                      min={1}
                      value={preisEur}
                      onChange={(e) => setPreisEur(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fahrzeug">Fahrzeugtyp</Label>
                    <Select
                      value={fahrzeugtyp}
                      onValueChange={(wert) => setFahrzeugtyp(wert as 'sattelzug' | 'zugmaschine')}
                    >
                      <SelectTrigger id="fahrzeug">
                        <SelectValue placeholder="Fahrzeug wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FAHRZEUGTYPEN).map((ft) => (
                          <SelectItem key={ft.schluessel} value={ft.schluessel}>
                            {ft.bezeichnung}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fahrzeit">Fahrzeit (h)</Label>
                    <Input
                      id="fahrzeit"
                      type="number"
                      min={0}
                      step={0.5}
                      value={fahrzeitStunden || ''}
                      onChange={(e) => setFahrzeitStunden(Number(e.target.value))}
                      placeholder="Auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uebernachtungen">Übernachtungen</Label>
                    <Input
                      id="uebernachtungen"
                      type="number"
                      min={0}
                      value={uebernachtungen}
                      onChange={(e) => setUebernachtungen(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zusatzeingaben</CardTitle>
                <CardDescription>
                  Leerkilometer und Verdrängungskosten anpassen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leerkilometer">
                    Leerkilometer-Anteil: {Math.round(leerkilometerAnteil * 100)}%
                  </Label>
                  <input
                    id="leerkilometer"
                    type="range"
                    min={0}
                    max={100}
                    value={leerkilometerAnteil * 100}
                    onChange={(e) => setLeerkilometerAnteil(Number(e.target.value) / 100)}
                    aria-valuetext={`${Math.round(leerkilometerAnteil * 100)}% Leerkilometer`}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Voll (0%)</span>
                    <span>Leer (100%)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verdraengung">Verdrängungskosten (€)</Label>
                  <Input
                    id="verdraengung"
                    type="number"
                    min={0}
                    value={verdraengungskostenEur}
                    onChange={(e) => setVerdraengungskostenEur(Number(e.target.value))}
                  />
                  <p className="text-xs text-text-secondary">
                    Kosten eines Auftrags, der durch dieses Angebot verdrängt wird.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rechte Spalte: Ergebnis */}
          <div className="space-y-6">
            {ergebnis ? (
              <>
                {/* Haupt-Ergebnis */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Badge variant={bewertungFarbe as 'success' | 'warning' | 'error'}>
                        {bewertungText}
                      </Badge>

                      <div>
                        <p className="text-4xl font-bold text-text-primary">
                          {ergebnis.margeEur >= 0 ? '+' : ''}{formatiereWaehrung(ergebnis.margeEur)}
                        </p>
                        <p className="text-lg text-text-secondary">
                          {ergebnis.margeProzent >= 0 ? '+' : ''}{formatiereProzent(ergebnis.margeProzent)} Marge
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="rounded-lg bg-bg-subtle p-4">
                          <p className="text-sm text-text-secondary">Erlös</p>
                          <p className="text-xl font-semibold text-text-primary">
                            {formatiereWaehrung(preisEur)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-bg-subtle p-4">
                          <p className="text-sm text-text-secondary">Kosten</p>
                          <p className="text-xl font-semibold text-text-primary">
                            {formatiereWaehrung(ergebnis.kostenGesamtEur)}
                          </p>
                        </div>
                      </div>

                      {verdraengungskostenEur > 0 && (
                        <div className="rounded-lg bg-warning-light p-4 text-sm">
                          <p className="font-medium text-accent-dark">Nettomarge nach Verdrängung</p>
                          <p className="text-lg font-bold text-accent-dark">
                            {ergebnis.nettomargeEur >= 0 ? '+' : ''}{formatiereWaehrung(ergebnis.nettomargeEur)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Kostenaufschlüsselung */}
                <Card>
                  <CardHeader>
                    <CardTitle>Kostenaufschlüsselung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.values(ergebnis.kostentreiber).map((treiber) => (
                        <div key={treiber.bezeichnung} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-primary">
                              {treiber.bezeichnung}
                            </span>
                            <span className="text-sm font-semibold text-text-primary">
                              {formatiereWaehrung(treiber.betragEur)}
                            </span>
                          </div>
                          <div className="pl-4 space-y-1">
                            {treiber.positionen.map((pos) => (
                              <div key={pos.bezeichnung} className="flex items-center justify-between text-xs text-text-secondary">
                                <span>{pos.bezeichnung} {pos.detail && `(${pos.detail})`}</span>
                                <span>{formatiereWaehrung(pos.betragEur)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="border-t border-border pt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-text-primary">Gesamtkosten</span>
                        <span className="text-sm font-bold text-text-primary">
                          {formatiereWaehrung(ergebnis.kostenGesamtEur)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="accent" className="w-full" onClick={ergebnisKopieren}>
                      <Copy className="h-4 w-4 mr-2" />
                      Ergebnis kopieren
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-text-secondary mb-4">
                    Gib Start und Ziel ein — die Distanz wird automatisch berechnet.
                  </p>
                  <p className="text-xs text-text-secondary">
                    Oder gib Distanz und Angebotspreis manuell ein.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export { RechnerUebersicht }
