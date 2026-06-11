import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/geteilt/auth/supabase-auth'
import { Button } from '@/komponenten/ui'
import { Input } from '@/komponenten/ui'
import { Label } from '@/komponenten/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/komponenten/ui'
import { Container } from '@/komponenten/ui'

function LoginSeite() {
  const { anmelden, registrieren, laedt, fehler, fehlerLoeschen } = useAuth()
  const navigate = useNavigate()

  const [istRegistrierung, setIstRegistrierung] = useState(false)
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    fehlerLoeschen()

    try {
      if (istRegistrierung) {
        await registrieren(email, passwort, vorname, nachname)
      } else {
        await anmelden(email, passwort)
      }
      navigate('/rechner')
    } catch {
      // Fehler wird im Auth-Kontext gesetzt
    }
  }

  return (
    <section className="py-20 bg-bg-subtle min-h-[80vh] flex items-center">
      <Container size="narrow">
        <Card>
          <CardHeader>
            <CardTitle>
              {istRegistrierung ? 'Konto erstellen' : 'Anmelden'}
            </CardTitle>
            <CardDescription>
              {istRegistrierung
                ? 'Erstelle dein MachMalTag-Konto und hinterlege deine Kostenkennzahlen.'
                : 'Melde dich an, um den Rentabilitäts-Rechner zu nutzen.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {istRegistrierung && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vorname">Vorname</Label>
                    <Input
                      id="vorname"
                      type="text"
                      placeholder="Max"
                      value={vorname}
                      onChange={(e) => setVorname(e.target.value)}
                      required={istRegistrierung}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nachname">Nachname</Label>
                    <Input
                      id="nachname"
                      type="text"
                      placeholder="Mustermann"
                      value={nachname}
                      onChange={(e) => setNachname(e.target.value)}
                      required={istRegistrierung}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwort">Passwort</Label>
                <Input
                  id="passwort"
                  type="password"
                  placeholder="••••••••"
                  value={passwort}
                  onChange={(e) => setPasswort(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {fehler && (
                <div className="rounded-md bg-error-light p-3 text-sm text-error">
                  {fehler}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={laedt}>
                {laedt
                  ? 'Bitte warten…'
                  : istRegistrierung
                    ? 'Konto erstellen'
                    : 'Anmelden'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <button
              type="button"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
              onClick={() => {
                setIstRegistrierung(!istRegistrierung)
                fehlerLoeschen()
              }}
            >
              {istRegistrierung
                ? 'Bereits ein Konto? Jetzt anmelden'
                : 'Noch kein Konto? Jetzt registrieren'}
            </button>
          </CardFooter>
        </Card>
      </Container>
    </section>
  )
}

export { LoginSeite }
