import * as React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

const Footer = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <footer
    ref={ref}
    className={cn('border-t border-border bg-primary-dark text-white', className)}
    {...props}
  >
    <Container className="py-12">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-white font-bold text-sm">
              M
            </div>
            <span className="text-lg font-semibold">MachMalTag</span>
          </div>
          <p className="text-sm text-white/70">
            Ein Tag, der Mitarbeitende zu etwas Besonderem macht.
          </p>
        </div>

        {/* Links column */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
            Links
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#" className="hover:text-white transition-colors">Startseite</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
            Kontakt
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>TimoCom GmbH & Co. KG</li>
            <li>info@timocom.com</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-white/50">
        © {new Date().getFullYear()} TimoCom. Alle Rechte vorbehalten.
      </div>
    </Container>
  </footer>
))
Footer.displayName = 'Footer'

export { Footer }
