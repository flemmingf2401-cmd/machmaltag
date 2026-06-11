---
name: wrap-up
description: Use when user says "wrap up", "close session", "end session", "wrap things up", "close out this task", or invokes /wrap-up — runs end-of-session checklist for memory, and self-improvement
argument-hint: [optional: Kontext oder Hinweise für den Wrap-Up]
---

# Wrap-Up: Sitzung abschließen

Du führst den End-of-Session-Checklist aus, um sicherzustellen, dass nichts Wichtiges verloren geht und die nächste Sitzung nahtlos anknüpfen kann.

## Ablauf

### 1. Erreichtes zusammenfassen

- Liste alle abgeschlossenen Aufgaben und Änderungen auf
- Notiere offene Aufgaben, die in dieser Sitzung nicht abgeschlossen wurden
- Prüfe ob es uncommittete Änderungen gibt (`git status`) und weise den Nutzer darauf hin

### 2. Memory aktualisieren

- **Neue Erkenntnisse speichern:** Was hat sich in dieser Sitzung ergeben, das nicht im Code/CLAUDE.md/DESIGN.md steht und bei der nächsten Sitzung nützlich wäre?
- **Bestehende Memories prüfen:** Sind Einträge veraltet oder widerlegt? → aktualisieren oder löschen
- **Nur nicht-offensichtliches speichern:** Nicht, was das Repo bereits dokumentiert (Code-Struktur, git-History, CLAUDE.md-Inhalte)

Speichere jedes neue Fact als Memory-Datei im Verzeichnis `C:\Users\Flemming\.claude\projects\c--Users-Flemming-OneDrive-Desktop-machmaltag\memory\` mit Frontmatter:

```
---
name: <short-kebab-case-slug>
description: <one-line summary>
metadata:
  type: user | feedback | project | reference
---

<the fact>
```

Und trage einen Zeiger in `MEMORY.md` ein:
`- [Titel](datei.md) — Hook`

### 3. Selbstverbesserung

Reflektiere die Sitzung und speichere Feedback als Memory vom Typ `feedback`:

- Was lief gut?
- Was lief nicht gut oder war ineffizient?
- Gab es wiederkehrende Permission-Prompts, die per Allowlist reduziert werden könnten?
- Gab es Missverständnisse, die durch eine Memory-Notiz in Zukunft vermeidbar wären?

### 4. Ausgabe an den Nutzer

Gib eine kurze, strukturierte Zusammenfassung:

```
## 🏁 Wrap-Up

### Erreicht
- [Aufgabe 1]
- [Aufgabe 2]

### Offen
- [Aufgabe 3] – Grund: ...

### Neue Memories
- [Memory-Titel 1]
- [Memory-Titel 2]

### Selbstverbesserung
- [Erkenntnis]

### Nächste Schritte
- [Was als nächstes anstehen sollte]
```

## Hinweise

- Wenn der Nutzer `$ARGUMENTS` angibt, berücksichtige diesen Kontext bei der Zusammenfassung und Reflexion.
- Keine Änderungen am Code mehr vornehmen – der Wrap-Up ist rein dokumentativ.
- Wenn keine neuen Memories anfallen, einfach "Keine neuen Memories" ausgeben.
