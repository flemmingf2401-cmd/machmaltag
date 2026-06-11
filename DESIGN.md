# MachMalTag – Design-Richtlinien

> **Basierend auf der TimoCom Corporate Identity** ([brand.timocom.com](https://brand.timocom.com/))
> Die folgenden Richtlinien orientieren sich an den TimoCom Brand Guidelines.
> Sobald die exakten Werte von brand.timocom.com verfügbar sind, sollten diese ergänzt/korrigiert werden.

---

## 1. Markenfarben

### Primärfarben

| Name            | Hex       | CSS Variable              | Verwendung                                |
|-----------------|-----------|---------------------------|-------------------------------------------|
| **TimoCom Blue**  | `#003B6F` | `--color-primary`         | Primärfarbe, Header, CTA-Buttons, Links   |
| **TimoCom Orange**| `#FF6600` | `--color-accent`          | Akzentfarbe, Hover-Zustände, Highlights    |
| **White**        | `#FFFFFF` | `--color-white`           | Hintergründe, Text auf Dark Backgrounds    |

### Sekundärfarben

| Name             | Hex       | CSS Variable              | Verwendung                                |
|------------------|-----------|---------------------------|-------------------------------------------|
| **Dark Navy**    | `#00264D` | `--color-primary-dark`    | Hover/Active Zustände, Footer              |
| **Light Blue**   | `#E8F0F8` | `--color-primary-light`   | Hellere Hintergründe, Cards               |
| **Light Orange** | `#FFF3E6` | `--color-accent-light`    | Warnhinweise, Badge-Hintergründe          |
| **Dark Gray**    | `#333333` | `--color-text-primary`    | Fließtext, Überschriften                  |
| **Medium Gray**  | `#666666` | `--color-text-secondary`  | Untertitel, Beschreibungen                |
| **Light Gray**   | `#F5F5F5` | `--color-bg-subtle`       | Seitenhintergrund, Section-Wechsel        |
| **Border Gray**  | `#E0E0E0` | `--color-border`          | Rahmen, Trennlinien                       |

### Semantische Farben

| Name      | Hex       | CSS Variable           | Verwendung          |
|-----------|-----------|------------------------|---------------------|
| **Success** | `#28A745` | `--color-success`      | Bestätigungen, OK   |
| **Warning** | `#FFC107` | `--color-warning`      | Warnungen           |
| **Error**   | `#DC3545` | `--color-error`        | Fehler, Validierung |
| **Info**    | `#17A2B8` | `--color-info`         | Hinweise            |

---

## 2. Typografie

### Schriftfamilien

| Rolle         | Font Family                            | Fallback                  |
|---------------|----------------------------------------|---------------------------|
| **Headlines** | `TimoCom Headline` / `Inter`           | `system-ui, sans-serif`   |
| **Body**      | `Inter`                                | `system-ui, sans-serif`   |
| **Mono**      | `JetBrains Mono`                       | `monospace`               |

> **Hinweis:** Falls TimoCom-eigene Webfonts nicht verfügbar sind, wird **Inter** als Ersatz verwendet.
> Inter ist frei verfügbar und deckt ein ähnliches Design-Spektrum ab.

### Schriftgrößen (Typographic Scale)

| Level          | Size    | Weight | Line Height | Tailwind Class  |
|----------------|---------|--------|-------------|-----------------|
| **Display**    | 3.5rem  | 700    | 1.1         | `text-5xl`      |
| **H1**         | 2.5rem  | 700    | 1.2         | `text-4xl`      |
| **H2**         | 2rem    | 600    | 1.3         | `text-3xl`      |
| **H3**         | 1.5rem  | 600    | 1.4         | `text-2xl`      |
| **H4**         | 1.25rem | 500    | 1.4         | `text-xl`       |
| **Body Large** | 1.125rem| 400    | 1.6         | `text-lg`       |
| **Body**       | 1rem    | 400    | 1.6         | `text-base`     |
| **Small**      | 0.875rem| 400    | 1.5         | `text-sm`       |
| **XSmall**     | 0.75rem | 400    | 1.5         | `text-xs`       |

---

## 3. Spacing & Layout

### Spacing Scale (8px Grid)

| Token    | Value  | Tailwind  |
|----------|--------|-----------|
| `xs`     | 4px    | `p-1`     |
| `sm`     | 8px    | `p-2`     |
| `md`     | 16px   | `p-4`     |
| `lg`     | 24px   | `p-6`     |
| `xl`     | 32px   | `p-8`     |
| `2xl`    | 48px   | `p-12`    |
| `3xl`    | 64px   | `p-16`    |
| `4xl`    | 96px   | `p-24`    |

### Layout-Breakpoints

| Name     | Width    | Verwendung                      |
|----------|----------|----------------------------------|
| `sm`     | 640px    | Mobile Landscape                |
| `md`     | 768px    | Tablet Portrait                  |
| `lg`     | 1024px   | Tablet Landscape / kleines Desktop |
| `xl`     | 1280px   | Desktop                          |
| `2xl`    | 1536px   | Large Desktop                    |

### Max-Content-Breite

- **Content Area:** 1200px
- **Wide Content:** 1440px
- **Seitenränder:** 16px (Mobile), 24px (Tablet), 32px (Desktop)

---

## 4. Komponenten-Design

### Buttons

| Variante     | Background       | Text       | Border         | Hover                         |
|--------------|-------------------|------------|----------------|-------------------------------|
| **Primary**  | `#003B6F`         | `#FFFFFF`  | none           | Background `#00264D`          |
| **Secondary**| `transparent`      | `#003B6F`  | `2px #003B6F`  | Background `#E8F0F8`          |
| **Accent**   | `#FF6600`         | `#FFFFFF`  | none           | Background `#E65C00`          |
| **Ghost**    | `transparent`      | `#666666`  | none           | Background `#F5F5F5`          |
| **Danger**   | `#DC3545`         | `#FFFFFF`  | none           | Background `#C82333`          |

**Button-Größen:**
- `sm`: Padding `8px 16px`, Font `0.875rem`
- `md`: Padding `12px 24px`, Font `1rem` (Default)
- `lg`: Padding `16px 32px`, Font `1.125rem`

**Border-Radius:** `6px` (`rounded-md`)

### Cards

- Background: `#FFFFFF`
- Border: `1px solid #E0E0E0`
- Border-Radius: `8px` (`rounded-lg`)
- Shadow: `0 2px 8px rgba(0, 59, 111, 0.08)`
- Padding: `24px`
- Hover: Shadow `0 4px 16px rgba(0, 59, 111, 0.12)`

### Inputs

- Height: `44px`
- Border: `1px solid #E0E0E0`
- Border-Radius: `6px`
- Focus: Border `#003B6F`, Shadow `0 0 0 3px rgba(0, 59, 111, 0.15)`
- Placeholder: `#999999`

### Badges / Tags

| Variante    | Background  | Text       |
|------------|-------------|------------|
| **Info**   | `#E8F0F8`   | `#003B6F`  |
| **Warning**| `#FFF3E6`   | `#CC5200`  |
| **Success**| `#E8F5E9`   | `#28A745`  |
| **Error**  | `#FFEBEE`   | `#DC3545`  |

Border-Radius: `9999px` (`rounded-full`), Padding: `4px 12px`

---

## 5. Icons

- **Icon-Set:** [Lucide Icons](https://lucide.dev/) (Open Source, konsistent, kompatibel mit React)
- **Standard-Größe:** 20px (`w-5 h-5`)
- **Linienstärke:** 2px
- **Farbe:** Erbt von aktueller Textfarbe (`currentColor`)

---

## 6. Schatten & Elevation

| Level | Shadow                                        | Verwendung          |
|-------|-----------------------------------------------|---------------------|
| `sm`  | `0 1px 2px rgba(0,0,0,0.05)`                 | Subtile Trennung    |
| `md`  | `0 2px 8px rgba(0, 59, 111, 0.08)`           | Cards, Dropdowns    |
| `lg`  | `0 4px 16px rgba(0, 59, 111, 0.12)`          | Modals, Popovers    |
| `xl`  | `0 8px 32px rgba(0, 59, 111, 0.16)`          | Hero-Overlays       |

---

## 7. Animation & Transitions

- **Default Duration:** `150ms`
- **Slow Duration:** `300ms`
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind Default)
- **Hover-Transitions:** Background, Border-Color, Box-Shadow, Transform
- **Keine heavy Animationen** – TimoCom Design ist professionell und zurückhaltend

---

## 8. Barrierefreiheit (Accessibility)

- **WCAG 2.1 AA** als Minimum-Standard
- Mindest-Kontrastverhältnis: **4.5:1** für normalen Text, **3:1** für großen Text
- Fokus-Ring: `2px solid #003B6F` mit `2px` Offset
- Alle interaktiven Elemente müssen per Tastatur erreichbar sein
- ARIA-Labels für alle interaktiven Komponenten
- Screen-Reader-freundliche Semantik (HTML5-Elemente)

---

## 9. Dark Mode

> **Vorläufig nicht implementiert.** Die MachMalTag-App startet mit Light Mode.
> Dark Mode kann als zukünftiges Feature ergänzt werden.

Dark Mode Palette (für spätere Implementierung):

| Name              | Light        | Dark         |
|-------------------|-------------|--------------|
| Background        | `#FFFFFF`   | `#1A1A2E`   |
| Surface           | `#F5F5F5`   | `#252540`   |
| Text Primary      | `#333333`   | `#F0F0F0`   |
| Text Secondary    | `#666666`   | `#AAAAAA`   |
| Primary           | `#003B6F`   | `#4D9FEF`   |
| Accent            | `#FF6600`   | `#FF8833`   |

---

## 10. Logo-Richtlinien

- **Clear Space:** Mindestens 1x die Höhe des "T" um das Logo
- **Mindestbreite:** 120px
- **Keine Verzerrung, Rotation oder Farbänderung** des Logos
- **Auf dunklem Hintergrund:** Weißes Logo verwenden
- **Versionen:** Full Logo (Text + Icon), Icon Only, Horizontal, Vertikal

---

## 11. Benennungskonventionen

### Dateien & Ordner
- Komponenten: `PascalCase` (`Button.tsx`, `EventCard.tsx`)
- Utilities: `camelCase` (`formatDate.ts`, `apiClient.ts`)
- Styles: Komponentenname + `.module.css` oder Tailwind-Utility-Klassen
- Seiten/Routes: `kebab-case` (`event-detail/`, `my-events/`)

### CSS-Klassen (Tailwind)
- Keine eigenen Utility-Klassen erstellen, wenn Tailwind ausreicht
- Custom Utilities nur in `src/styles/utilities.css` mit `@layer utilities`
- Komponenten-spezifische Varianten über Tailwind `cva` (class-variance-authority)

---

## 12. Referenz-Links

- [TimoCom Brand Portal](https://brand.timocom.com/) – Offizielle Brand-Richtlinien
- [Inter Font](https://rsms.me/inter/) – Fallback-Font
- [Lucide Icons](https://lucide.dev/) – Icon-Set
- [Radix UI](https://www.radix-ui.com/) – Accessible UI Primitives
- [Tailwind CSS](https://tailwindcss.com/) – Utility-First CSS Framework
