import * as React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/komponenten/ui/container'
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

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link
            to="/"
            className="transition-colors hover:text-primary"
          >
            Startseite
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

        {/* Auth-Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Anmelden
          </Link>
        </div>
      </Container>
    </header>
  )
)
Header.displayName = 'Header'

export { Header }
