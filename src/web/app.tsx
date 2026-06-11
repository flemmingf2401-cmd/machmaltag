import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/komponenten/layout'
import { Startseite } from './seiten/startseite'
import { LoginSeite } from './seiten/login'
import { RechnerUebersicht } from './seiten/rechner/uebersicht'
import { Tagesstatistik } from './seiten/dashboard/tagesstatistik'
import { Historie } from './seiten/dashboard/historie'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Startseite />} />
        <Route path="/login" element={<LoginSeite />} />
        <Route path="/rechner" element={<RechnerUebersicht />} />
        <Route path="/dashboard" element={<Tagesstatistik />} />
        <Route path="/dashboard/historie" element={<Historie />} />
      </Routes>
    </Layout>
  )
}

export { App }
