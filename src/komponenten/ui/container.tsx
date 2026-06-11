import * as React from 'react'
import { cn } from '@/geteilt/helfer/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  size?: 'default' | 'wide' | 'narrow'
}

const sizeClasses = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[1440px]',
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Comp = 'div', size = 'default', ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(
        'mx-auto w-full px-4 md:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Container.displayName = 'Container'

export { Container }
