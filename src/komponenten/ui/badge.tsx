import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/geteilt/helfer/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        info: 'bg-info-light text-primary',
        warning: 'bg-warning-light text-accent-dark',
        success: 'bg-success-light text-success',
        error: 'bg-error-light text-error',
        outline: 'border border-border text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
