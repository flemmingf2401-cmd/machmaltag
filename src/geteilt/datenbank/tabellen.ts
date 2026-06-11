/**
 * Tabellen-Namen als Konstanten — zentral verwaltet, Tippfehler vermeiden.
 */

export const TABELLEN = {
  ORGANISATIONEN: 'organisationen',
  BENUTZER: 'benutzer',
  FAHRZEUGTYPEN: 'fahrzeugtypen',
  KOSTENVORLAGEN: 'kostenvorlagen',
  PERSOENLICHE_ANPASSUNGEN: 'persoenliche_anpassungen',
  MAUT_TABELLE: 'maut_tabelle',
  BEWERTETE_ANGEBOTE: 'bewertete_angebote',
  DIESEL_PREISE: 'diesel_preise',
} as const

export type TabellenName = (typeof TABELLEN)[keyof typeof TABELLEN]
