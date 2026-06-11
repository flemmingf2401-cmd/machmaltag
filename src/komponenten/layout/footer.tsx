import * as React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/komponenten/ui/container'
import { cn } from '@/geteilt/helfer/utils'

const Footer = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <footer
    ref={ref}
    className={cn('border-t border-border bg-primary-dark text-white', className)}
    {...props}
  >
    <Container className="py-16">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Marken-Spalte */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-dark text-white font-bold text-sm">
              M
            </div>
            <span className="text-lg font-semibold">MachMalTag</span>
          </div>
          <p className="text-sm text-white/70">
            Rentabilitäts-Rechner für TimoCom-Disponenten.
          </p>
        </div>

        {/* Links-Spalte */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/" className="hover:text-white transition-colors">Startseite</Link></li>
            <li><Link to="/rechner" className="hover:text-white transition-colors">Rechner</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
          </ul>
        </div>

        {/* Kontakt-Spalte */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
            Rechtliches
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/15 text-center text-xs text-white/50">
        © {new Date().getFullYear()} MachMalTag. Alle Rechte vorbehalten.
      </div>
    </Container>
  </footer>
))
Footer.displayName = 'Footer'

export { Footer }
