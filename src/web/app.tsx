import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/komponenten/layout'
import { Startseite } from './seiten/startseite'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Startseite />} />
        {/* Weitere Routen werden in späteren Phasen hinzugefügt */}
      </Routes>
    </Layout>
  )
}

export { App }
