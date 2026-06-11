# MachMalTag – Projektrichtlinien

## Sprache

- **UI-Texte:** komplett auf Deutsch – alle Labels, Buttons, Platzhalter, Fehlermeldungen, Tooltips, Nav-Elemente etc.
- **Code:** auf Deutsch – Variablen, Funktionen, Komponenten, Kommentare, Commit-Messages, Branch-Namen, Ordner und Dateinamen (soweit technisch sinnvoll)
- **Technische Begriffe:** bleiben englisch, wenn sie Standardvokabular sind (z.B. `useState`, `useEffect`, `props`, `ref`, `key`)

## Design

- **Strikt nach [DESIGN.md](DESIGN.md)** – Farben, Typografie, Spacing, Komponenten, Icons, Schatten, Animationen und Barrierefreiheit wie dort definiert
- TimoCom Corporate Identity als Grundlage (TimoCom Blue `#003B6F`, TimoCom Orange `#FF6600`)
- Icons: Lucide Icons
- Font: Inter (Fallback für TimoCom Headline)
- Light Mode zuerst, Dark Mode vorläufig nicht implementiert

## Arbeitsweise

- **Immer erst im Plan-Modus agieren** – keine Änderungen ohne vorherige Planung und Freigabe
- Vor jedem Implementationsschritt den Plan vorstellen und auf Bestätigung warten
- Bei Unklarheiten nachfragen, nicht raten
- `EnterPlanMode` verwenden bevor Code geschrieben wird

## Deployment

- **Staging-Deploy via GitHub** bevor Änderungen auf die Produktionsseite gehen
- Workflow: Feature-Branch → PR → Staging-Deploy → Test → Merge in Main → Produktions-Deploy
- **Vercel-Projekt:** `flemmingsmachmaltagergebnis`
- Staging-URLs vor Freigabe prüfen

## Technologie-Stack

- React + TypeScript (Vite)
- Tailwind CSS
- Radix UI (Accessible Primitives)
- Lucide Icons
