/**
 * Nachrichten-Typen für die Kommunikation zwischen
 * Content Script ↔ Background Service Worker ↔ Sidebar/Popup.
 *
 * Zentral definiert um String-Tippfehler zu vermeiden.
 */

const MSG = {
  // Content → Background
  ANGEBOT_GESCRAPT: 'angebot_gescrapt',
  ANGEBOT_ANGEKLICKT: 'angebot_angeklickt',

  // Background → Content
  BERECHNUNG_ERGEBNIS: 'berechnung_ergebnis',

  // Sidebar/Popup → Background
  PROFIL_LADEN: 'profil_laden',
  PROFIL_SPEICHERN: 'profil_speichern',
  PROFIL_ZURUECKSETZEN: 'profil_zuruecksetzen',
  HISTORIE_LADEN: 'historie_laden',
  HISTORIE_LEEREN: 'historie_leeren',
  STATS_ANFRAGE: 'stats_anfrage',

  // Demo-Modus
  DEMO_MODUS_TOGGLE: 'demo_modus_toggle',
  DEMO_MODUS_STATUS: 'demo_modus_status',

  // Side Panel
  SEITENPANEL_OEFFNEN: 'seitenpanel_oeffnen',

  // OSRM Routing (Fallback)
  OSRM_ROUTE_ANFRAGE: 'osrm_route_anfrage',
  OSRM_ROUTE_ERGEBNIS: 'osrm_route_ergebnis',

  // Erweiterung aktiv/inaktiv
  ERWEITERUNG_TOGGLE: 'erweiterung_toggle',
  ERWEITERUNG_STATUS: 'erweiterung_status',
}
