/**
 * Rechner-Seite — Hauptseite für die Rentabilitätsberechnung.
 *
 * 2-Spalten-Layout:
 * - Links: Eingabeformulare (Angebotsdaten, Strecke, Fahrer, Kostenvorlage)
 * - Rechts: Berechnungsergebnis mit Bewertung und Kostenaufschlüsselung
 */

import { useRechnerStore } from '@/geteilt/zustaende/rechner-store'
import { FAHRZEUGTYPEN } from '@/geteilt/rechner/typen'
import { ErgebnisZusammenfassung } from '@/geteilt/komponenten'
import { Button } from '@/komponenten/ui'
import { Input } from '@/komponenten/ui'
import { Label } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/komponenten/ui'
import { Container } from '@/komponenten/ui'
import { NumerischeEingabe } from '@/komponenten/ui'
import { Separator } from '@/komponenten/ui'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/komponenten/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/komponenten/ui'
import { Info, Plus, X, Zap } from 'lucide-react'

// Verfügbare Länder für die Durchfahrt
const VERFUEGBARE_LAENDER = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'SK', name: 'Slowakei' },
  { code: 'HU', name: 'Ungarn' },
  { code: 'SI', name: 'Slowenien' },
  { code: 'HR', name: 'Kroatien' },
  { code: 'RO', name: 'Rumänien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'SE', name: 'Schweden' },
]

function RechnerSeite() {
  const {
    ladeort,
    entladeort,
    distanzKm,
    angebotPreisEur,
    fahrzeugtyp,
    leerkilometerAnteil,
    fahrzeitStunden,
    uebernachtungen,
    verdraengungskostenEur,
    laender,
    distanzProLand,
    ergebnis,
    berechnet,
    liveBerechnung,
    feldSetzen,
    fahrzeugtypSetzen,
    landHinzufuegen,
    landEntfernen,
    distanzProLandSetzen,
    berechnen,
    zuruecksetzen,
    liveBerechnungUmschalten,
  } = useRechnerStore()

  const verfuegbareZusaetzlicheLaender = VERFUEGBARE_LAENDER.filter(
    (l) => !laender.includes(l.code)
  )

  return (
    <section className="py-12 bg-bg-subtle min-h-[80vh]">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Rentabilitäts-Rechner
            </h1>
            <p className="text-text-secondary mt-2">
              Prüfe sofort, ob sich ein Frachtangebot für dein Unternehmen lohnt.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={liveBerechnungUmschalten}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                liveBerechnung
                  ? 'bg-accent text-white'
                  : 'bg-bg-subtle text-text-secondary hover:bg-border'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Live
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ===== LINKE SPALTE: EINGABE ===== */}
          <div className="space-y-6">
            {/* Angebotsdaten */}
            <Card>
              <CardHeader>
                <CardTitle>Angebotsdaten</CardTitle>
                <CardDescription>
                  Gib die Daten aus dem TIMOCOM-Angebot ein.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ladeort">Ladeort</Label>
                    <Input
                      id="ladeort"
                      placeholder="Hamburg"
                      value={ladeort}
                      onChange={(e) => feldSetzen('ladeort', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entladeort">Entladeort</Label>
                    <Input
                      id="entladeort"
                      placeholder="München"
                      value={entladeort}
                      onChange={(e) => feldSetzen('entladeort', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preis">Angebotspreis</Label>
                    <NumerischeEingabe
                      id="preis"
                      einheit="EUR"
                      wert={angebotPreisEur}
                      wertAendern={(w) => feldSetzen('angebotPreisEur', w)}
                      min={0}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fahrzeug">Fahrzeugtyp</Label>
                    <Select value={fahrzeugtyp} onValueChange={(v) => fahrzeugtypSetzen(v as 'sattelzug' | 'zugmaschine')}>
                      <SelectTrigger id="fahrzeug">
                        <SelectValue />
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
              </CardContent>
            </Card>

            {/* Strecke */}
            <Card>
              <CardHeader>
                <CardTitle>Strecke</CardTitle>
                <CardDescription>
                  Distanz, Leerfahrten und Länderdurchfahrt.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distanz">Distanz</Label>
                    <NumerischeEingabe
                      id="distanz"
                      einheit="km"
                      wert={distanzKm}
                      wertAendern={(w) => feldSetzen('distanzKm', w)}
                      min={0}
                      step={1}
                      dezimalstellen={0}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label htmlFor="leerkilometer" className="flex items-center gap-1">
                            Leerfahrten-Anteil
                            <Info className="h-3.5 w-3.5 text-text-secondary" />
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          Anteil der Strecke, der ohne Ladung gefahren wird. Erhöht den Kraftstoffverbrauch.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <NumerischeEingabe
                      id="leerkilometer"
                      einheit="%"
                      wert={leerkilometerAnteil * 100}
                      wertAendern={(w) => feldSetzen('leerkilometerAnteil', w / 100)}
                      min={0}
                      max={100}
                      step={1}
                      dezimalstellen={0}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Länderauswahl */}
                <div className="space-y-2">
                  <Label>Länderdurchfahrt</Label>
                  <div className="flex flex-wrap gap-2">
                    {laender.map((land) => (
                      <span
                        key={land}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary"
                      >
                        {land}
                        {laender.length > 1 && (
                          <button
                            type="button"
                            onClick={() => landEntfernen(land)}
                            className="ml-0.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {verfuegbareZusaetzlicheLaender.length > 0 && (
                      <span className="relative">
                        <select
                          className="appearance-none rounded-full border border-dashed border-border bg-white px-3 py-1 text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
                          onChange={(e) => {
                            if (e.target.value) {
                              landHinzufuegen(e.target.value)
                              e.target.value = ''
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            + Land hinzufügen
                          </option>
                          {verfuegbareZusaetzlicheLaender.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.code} — {l.name}
                            </option>
                          ))}
                        </select>
                        <Plus className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Distanz pro Land */}
                {laender.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Distanz pro Land</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {laender.map((land) => (
                        <div key={land} className="space-y-1">
                          <Label htmlFor={`distanz-${land}`} className="text-xs text-text-secondary">
                            {land}
                          </Label>
                          <NumerischeEingabe
                            id={`distanz-${land}`}
                            einheit="km"
                            wert={distanzProLand[land] ?? 0}
                            wertAendern={(w) => distanzProLandSetzen(land, w)}
                            min={0}
                            step={1}
                            dezimalstellen={0}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fahrer */}
            <Card>
              <CardHeader>
                <CardTitle>Fahrer</CardTitle>
                <CardDescription>
                  Fahrzeit und Übernachtungen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fahrzeit">Fahrzeit</Label>
                    <NumerischeEingabe
                      id="fahrzeit"
                      einheit="h"
                      wert={fahrzeitStunden}
                      wertAendern={(w) => feldSetzen('fahrzeitStunden', w)}
                      min={0}
                      step={0.5}
                      dezimalstellen={1}
                      placeholder="0,0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uebernachtungen">Übernachtungen</Label>
                    <NumerischeEingabe
                      id="uebernachtungen"
                      einheit=""
                      wert={uebernachtungen}
                      wertAendern={(w) => feldSetzen('uebernachtungen', w)}
                      min={0}
                      step={1}
                      dezimalstellen={0}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="verdraengung" className="flex items-center gap-1">
                          Verdrängungskosten
                          <Info className="h-3.5 w-3.5 text-text-secondary" />
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        Kosten eines Auftrags, der durch dieses Angebot verdrängt wird (Opportunitätskosten).
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <NumerischeEingabe
                    id="verdraengung"
                    einheit="EUR"
                    wert={verdraengungskostenEur}
                    wertAendern={(w) => feldSetzen('verdraengungskostenEur', w)}
                    min={0}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Berechnen-Button */}
            {!liveBerechnung && (
              <Button variant="accent" size="lg" className="w-full" onClick={berechnen}>
                Berechnen
              </Button>
            )}
          </div>

          {/* ===== RECHTE SPALTE: ERGEBNIS ===== */}
          <div className="space-y-6">
            {ergebnis ? (
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <ErgebnisZusammenfassung
                    ergebnis={ergebnis}
                    angebotPreisEur={angebotPreisEur}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-text-secondary">
                    {liveBerechnung
                      ? 'Gib Distanz und Angebotspreis ein, um die Rentabilität zu berechnen.'
                      : 'Klicke auf "Berechnen", um die Rentabilität zu prüfen.'}
                  </p>
                </CardContent>
              </Card>
            )}

            {berechnet && (
              <Button variant="ghost" className="w-full" onClick={zuruecksetzen}>
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export { RechnerSeite }
