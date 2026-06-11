import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/komponenten/layout'
import { ToastProvider, ToastViewport, ToastKontextProvider, Toast as ToastKomponente, ToastTitle, ToastDescription, ToastClose, TooltipProvider } from '@/komponenten/ui'
import { useToast } from '@/komponenten/ui/toast'
import { Startseite } from './seiten/startseite'
import { LoginSeite } from './seiten/login'
import { RechnerSeite } from './seiten/rechner/rechner-seite'
import { Tagesstatistik } from './seiten/dashboard/tagesstatistik'
import { Historie } from './seiten/dashboard/historie'

/** Toast-Renderer – hört auf den ToastKontextProvider und zeigt Toasts an */
function ToastRenderer() {
  const { toasts, toastEntfernen } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toast, index) => (
        <ToastKomponente
          key={index}
          variant={toast.art}
          duration={toast.dauer ?? 4000}
          onOpenChange={(offen) => { if (!offen) toastEntfernen() }}
        >
          <div className="grid gap-1">
            {toast.titel && <ToastTitle>{toast.titel}</ToastTitle>}
            <ToastDescription>{toast.beschreibung}</ToastDescription>
          </div>
          <ToastClose />
        </ToastKomponente>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

function App() {
  return (
    <ToastKontextProvider>
      <TooltipProvider delayDuration={300}>
        <Layout>
          <Routes>
            <Route path="/" element={<Startseite />} />
            <Route path="/login" element={<LoginSeite />} />
            <Route path="/rechner" element={<RechnerSeite />} />
            <Route path="/dashboard" element={<Tagesstatistik />} />
            <Route path="/dashboard/historie" element={<Historie />} />
          </Routes>
        </Layout>
      </TooltipProvider>
      <ToastRenderer />
    </ToastKontextProvider>
  )
}

export { App }
