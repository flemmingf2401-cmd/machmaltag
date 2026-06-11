import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/geteilt/helfer/utils'
import { Button } from '@/komponenten/ui/button'
import { Card } from '@/komponenten/ui/card'

/* ---------- Typen ---------- */

export interface Referenz {
  bild: string
  name: string
  benutzername: string
  text: string
  socialUrl: string
}

interface TestimonialsProps {
  referenzen: Referenz[]
  className?: string
  titel?: string
  beschreibung?: string
  maxAngezeigt?: number
}

/* ---------- Komponente ---------- */

export function Testimonials({
  referenzen,
  className,
  titel = 'Kundenstimmen',
  beschreibung = 'Erfahrungen von Disponenten und Spediteuren, die den MachMalTag nutzen.',
  maxAngezeigt = 6,
}: TestimonialsProps) {
  const [allesAnzeigen, setAllesAnzeigen] = useState(false)

  return (
    <div className={className}>
      {/* Überschrift */}
      <div className="flex flex-col items-center justify-center pt-5">
        <div className="flex flex-col gap-5 mb-8">
          <h2 className="text-center text-4xl font-medium">{titel}</h2>
          <p className="text-center text-text-secondary">
            {beschreibung.split('<br />').map((zeile, i) => (
              <span key={i}>
                {zeile}
                {i !== beschreibung.split('<br />').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Karten */}
      <div className="relative">
        <div
          className={cn(
            'flex justify-center items-center gap-5 flex-wrap',
            !allesAnzeigen &&
              referenzen.length > maxAngezeigt &&
              'max-h-[720px] overflow-hidden',
          )}
        >
          {referenzen
            .slice(0, allesAnzeigen ? undefined : maxAngezeigt)
            .map((referenz, index) => (
              <Card
                key={index}
                className="w-80 h-auto p-5 relative bg-white border-border"
              >
                {/* Avatar + Name */}
                <div className="flex items-center">
                  <img
                    src={referenz.bild}
                    alt={`Avatar von ${referenz.name}`}
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-col pl-4">
                    <span className="font-semibold text-base">
                      {referenz.name}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {referenz.benutzername}
                    </span>
                  </div>
                </div>

                {/* Zitat */}
                <div className="mt-5 mb-5">
                  <p className="text-text-primary font-medium">
                    {referenz.text}
                  </p>
                </div>

                {/* Social-Link */}
                <a
                  href={referenz.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${referenz.name} auf LinkedIn`}
                  className="absolute top-4 right-4 hover:opacity-80 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </Card>
            ))}
        </div>

        {/* "Mehr anzeigen"-Überlagerung */}
        {referenzen.length > maxAngezeigt && !allesAnzeigen && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-bg-subtle to-transparent" />
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
              <Button variant="secondary" onClick={() => setAllesAnzeigen(true)}>
                Mehr anzeigen
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
