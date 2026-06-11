import * as React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

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
        {/* Logo placeholder */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white font-bold text-sm">
            M
          </div>
          <span className="text-lg font-semibold text-text-primary">
            MachMalTag
          </span>
        </div>

        {/* Navigation placeholder */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <a
            href="#"
            className="transition-colors hover:text-primary"
          >
            Startseite
          </a>
          <a
            href="#"
            className="transition-colors hover:text-primary"
          >
            Events
          </a>
          <a
            href="#"
            className="transition-colors hover:text-primary"
          >
            Über uns
          </a>
        </nav>

        {/* CTA placeholder */}
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            Anmelden
          </button>
        </div>
      </Container>
    </header>
  )
)
Header.displayName = 'Header'

export { Header }
