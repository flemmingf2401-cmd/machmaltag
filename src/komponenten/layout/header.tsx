import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Container } from '@/komponenten/ui/container'
import { Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogPortal, DialogClose, DialogTitle } from '@/komponenten/ui/dialog'
import { cn } from '@/geteilt/helfer/utils'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, sticky = true, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'border-b border-border bg-white',
        sticky && 'sticky top-0 z-50',
        className
      )}
      {...props}
    >
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white font-bold text-sm">
            M
          </div>
          <span className="text-lg font-semibold text-text-primary">
            MachMalTag
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link
            to="/"
            className="transition-colors hover:text-primary"
          >
            Start
          </Link>
          <Link
            to="/rechner"
            className="transition-colors hover:text-primary"
          >
            Rechner
          </Link>
          <Link
            to="/dashboard"
            className="transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
        </nav>

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
                ✕
              </DialogClose>

              <div className="flex flex-col gap-6 pt-4">
                <Link to="/" className="flex items-center gap-3 no-underline">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white font-bold text-sm">
                    M
                  </div>
                  <span className="text-lg font-semibold text-text-primary">
                    MachMalTag
                  </span>
                </Link>

                <nav className="flex flex-col gap-1">
                  {[
                    { to: '/', label: 'Start' },
                    { to: '/rechner', label: 'Rechner' },
                    { to: '/dashboard', label: 'Dashboard' },
                    { to: '/dashboard/historie', label: 'Historie' },
                  ].map((link) => (
                    <DialogClose key={link.to} asChild>
                      <Link
                        to={link.to}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        {link.label}
                      </Link>
                    </DialogClose>
                  ))}
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
      </Container>
    </header>
  )
)
Header.displayName = 'Header'

export { Header }
