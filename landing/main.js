/**
 * FreightLens Landing Page — JavaScript.
 *
 * Verantwortlichkeiten:
 * - Lead Capture (E-Mail-Formulare)
 * - Konfetti-Animation bei Anmeldung
 * - Scroll-Animationen (IntersectionObserver)
 * - Mobile Navigation
 */

// ==================
// Konfiguration
// ==================

/** Webhook-URL für Lead-Erfassung. Leer = kein Aufruf (Demo-Modus). */
const WEBHOOK_URL = '' // z.B. 'https://hooks.netlify.com/build/...' oder '/api/waitlist'

const LOCALSTORAGE_KEY = 'freightlens_leads'

// ==================
// Lead Capture
// ==================

/**
 * E-Mail-Adresse speichern und Webhook aufrufen.
 *
 * @param {string} email - E-Mail-Adresse
 * @returns {boolean} Erfolg
 */
function leadSpeichern(email) {
  if (!email || !email.includes('@')) return false

  // In localStorage speichern (Demo)
  const leads = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]')

  // Duplikate vermeiden
  if (leads.includes(email)) {
    return true // Bereits angemeldet
  }

  leads.push(email)
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(leads))

  // Webhook aufrufen (falls konfiguriert)
  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
    }).catch(() => {
      // Webhook-Fehler ignorieren — Lead ist im localStorage gesichert
      console.log('[FreightLens] Webhook-Aufruf fehlgeschlagen — Lead im localStorage gesichert.')
    })
  } else {
    console.log('[FreightLens] Lead gespeichert (Demo-Modus, kein Webhook):', email)
  }

  return true
}

// Formular-Handler: Hero
document.getElementById('hero-form')?.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = e.target.querySelector('input[type="email"]')
  const email = input?.value?.trim()

  if (leadSpeichern(email)) {
    konfettiStarten()
    erfolgAnzeigen()
    input.value = ''
  }
})

// Formular-Handler: Footer
document.getElementById('footer-form')?.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = e.target.querySelector('input[type="email"]')
  const email = input?.value?.trim()

  if (leadSpeichern(email)) {
    konfettiStarten()
    erfolgAnzeigen()
    input.value = ''
  }
})

// ==================
// Erfolgs-Overlay
// ==================

function erfolgAnzeigen() {
  const overlay = document.getElementById('erfolg-overlay')
  overlay.classList.add('erfolg-overlay--aktiv')

  // Nach 3 Sekunden ausblenden
  setTimeout(() => {
    overlay.classList.remove('erfolg-overlay--aktiv')
  }, 3000)

  // Klick zum Schließen
  overlay.addEventListener('click', () => {
    overlay.classList.remove('erfolg-overlay--aktiv')
  }, { once: true })
}

// ==================
// Konfetti-Animation
// ==================

function konfettiStarten() {
  const farben = ['#00A89D', '#003057', '#FF6600', '#059669', '#D97706', '#FFFFFF']
  const anzahl = 25

  for (let i = 0; i < anzahl; i++) {
    const partikel = document.createElement('div')
    partikel.className = 'konfetti-partikel'

    // Zufällige Position und Aussehen
    const x = Math.random() * 100
    const farbe = farben[Math.floor(Math.random() * farben.length)]
    const groesse = 6 + Math.random() * 8
    const verzoegerung = Math.random() * 0.5
    const dauer = 2 + Math.random() * 1.5

    Object.assign(partikel.style, {
      left: `${x}%`,
      top: '-10px',
      width: `${groesse}px`,
      height: `${groesse}px`,
      backgroundColor: farbe,
      animationDelay: `${verzoegerung}s`,
      animationDuration: `${dauer}s`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    })

    document.body.appendChild(partikel)

    // Nach Animation entfernen
    setTimeout(() => partikel.remove(), (dauer + verzoegerung) * 1000 + 100)
  }
}

// ==================
// Scroll-Animationen
// ==================

const observer = new IntersectionObserver(
  (eintraege) => {
    eintraege.forEach((eintrag) => {
      if (eintrag.isIntersecting) {
        eintrag.target.classList.add('visible')
        observer.unobserve(eintrag.target) // Nur einmal animieren
      }
    })
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  }
)

// Alle Elemente mit .animate-on-scroll beobachten
document.querySelectorAll('.animate-on-scroll').forEach((el) => {
  observer.observe(el)
})

// ==================
// Mobile Navigation
// ==================

const hamburger = document.getElementById('hamburger')
const navLinks = document.getElementById('nav-links')

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('nav__links--offen')
})

// Nav-Links schließen bei Klick
navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav__links--offen')
  })
})
