import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/geteilt/helfer/utils'

// ==================
// Toast Provider
// ==================

const ToastProvider = ToastPrimitive.Provider

// ==================
// Toast Viewport
// ==================

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

// ==================
// Toast Varianten
// ==================

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-white text-text-primary',
        success: 'border-success/30 bg-success-light text-success',
        error: 'border-error/30 bg-error-light text-error',
        warning: 'border-warning/30 bg-warning-light text-accent-dark',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

// ==================
// Toast Action
// ==================

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium text-text-primary hover:bg-bg-subtle focus:outline-none focus:ring-2 focus:ring-primary/15',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

// ==================
// Toast Close
// ==================

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-1 top-1 rounded-md p-1 text-text-secondary opacity-0 transition-opacity hover:text-text-primary focus:opacity-100 focus:outline-none group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

// ==================
// Toast Title
// ==================

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

// ==================
// Toast Description
// ==================

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

// ==================
// Hook: useToast
// ==================

type ToastArt = 'default' | 'success' | 'error' | 'warning'

interface ToastNachricht {
  titel?: string
  beschreibung: string
  art?: ToastArt
  dauer?: number
}

interface ToastKontextWert {
  toasts: ToastNachricht[]
  toastHinzufuegen: (nachricht: ToastNachricht) => void
  toastEntfernen: () => void
}

const ToastKontext = React.createContext<ToastKontextWert | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const kontext = React.useContext(ToastKontext)
  if (!kontext) {
    throw new Error('useToast muss innerhalb eines ToastKontextProvider verwendet werden')
  }
  return kontext
}

export function ToastKontextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastNachricht[]>([])

  const toastHinzufuegen = React.useCallback((nachricht: ToastNachricht) => {
    setToasts((prev) => [...prev, nachricht])
  }, [])

  const toastEntfernen = React.useCallback(() => {
    setToasts((prev) => prev.slice(1))
  }, [])

  return (
    <ToastKontext.Provider value={{ toasts, toastHinzufuegen, toastEntfernen }}>
      {children}
    </ToastKontext.Provider>
  )
}

export type { ToastArt, ToastNachricht }

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}