import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Container } from '@/komponenten/ui/container'
import { Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogPortal, DialogClose, DialogTitle } from '@/komponenten/ui/dialog'
import { cn } from '@/geteilt/helfer/utils'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean
}

/** Prüft ob ein Link aktiv ist (exakt oder als Präfix) */
function istAktiv(pfad: string, aktuellerPfad: string, exakt = false) {
  if (exakt) return aktuellerPfad === pfad
  return aktuellerPfad === pfad || aktuellerPfad.startsWith(pfad + '/')
}

const NAV_LINKS = [
  { to: '/', label: 'Start', exakt: true },
  { to: '/rechner', label: 'Rechner' },
  { to: '/dashboard', label: 'Dashboard' },
]

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, sticky = true, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'bg-white shadow-sm',
        sticky && 'sticky top-0 z-50',
        className
      )}
      {...props}
    >
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
            M
          </div>
          <span className="text-lg font-semibold text-text-primary">
            MachMalTag
          </span>
        </Link>

        {/* Desktop Navigation mit Active-State */}
        <ActiveNavLinks />

        {/* Desktop Auth-Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Anmelden
          </Link>
        </div>

        {/* Mobile Hamburger-Menü */}
        <MobileNavigation />
      </Container>
    </header>
  )
)
Header.displayName = 'Header'

/** Desktop-Navigation mit Active-State */
function ActiveNavLinks() {
  const location = useLocation()

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
      {NAV_LINKS.map((link) => {
        const aktiv = istAktiv(link.to, location.pathname, link.exakt)
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              'relative px-3 py-2 rounded-md transition-colors',
              aktiv
                ? 'text-primary font-semibold'
                : 'text-text-secondary hover:text-primary hover:bg-primary-light/30'
            )}
          >
            {link.label}
            {aktiv && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/** Mobile Navigation als Slide-in Drawer */
function MobileNavigation() {
  const location = useLocation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-primary hover:bg-bg-subtle transition-colors"
          aria-label="Navigation öffnen"
        >
          <Menu className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity" aria-label="Schließen">
            <X className="h-4 w-4" />
          </DialogClose>

          <div className="flex flex-col gap-6 pt-4">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
                M
              </div>
              <span className="text-lg font-semibold text-text-primary">
                MachMalTag
              </span>
            </Link>

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const aktiv = istAktiv(link.to, location.pathname, link.exakt)
                return (
                  <DialogClose key={link.to} asChild>
                    <Link
                      to={link.to}
                      className={cn(
                        'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        aktiv
                          ? 'bg-primary-light text-primary'
                          : 'text-text-secondary hover:text-primary hover:bg-primary-light/50'
                      )}
                    >
                      {link.label}
                    </Link>
                  </DialogClose>
                )
              })}
            </nav>

            <div className="border-t border-border pt-4">
              <DialogClose asChild>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary-light transition-colors block"
                >
                  Anmelden
                </Link>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export { Header }
