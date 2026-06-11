-- =============================================
-- MachMalTag Rentabilitäts-Rechner — Initiales Schema
-- =============================================

-- ==================
-- Organisationen (Mandanten)
-- ==================
CREATE TABLE organisationen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organisationen ENABLE ROW LEVEL SECURITY;

-- ==================
-- Benutzer / Profile
-- ==================
CREATE TABLE benutzer (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES organisationen(id),
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rolle TEXT NOT NULL DEFAULT 'disponent' CHECK (rolle IN ('admin', 'disponent')),
  aktiv BOOLEAN DEFAULT true,
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE benutzer ENABLE ROW LEVEL SECURITY;

-- ==================
-- Fahrzeugtypen
-- ==================
CREATE TABLE fahrzeugtypen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES organisationen(id),
  bezeichnung TEXT NOT NULL,
  gewicht_kg INT NOT NULL DEFAULT 40000,
  euro_klasse INT NOT NULL DEFAULT 6,
  achsen INT NOT NULL DEFAULT 5,
  standardprofil_id UUID,
  erstellt_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fahrzeugtypen ENABLE ROW LEVEL SECURITY;

-- ==================
-- Kostenvorlagen (zentrale Kostensätze)
-- ==================
CREATE TABLE kostenvorlagen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES organisationen(id),
  bezeichnung TEXT NOT NULL,
  fahrzeugtyp_id UUID REFERENCES fahrzeugtypen(id),
  version INT NOT NULL DEFAULT 1,

  -- Diesel/Kraftstoff
  verbrauch_l_pro_100km DECIMAL(5,2) NOT NULL,
  diesel_preis_eur_l DECIMAL(5,3) NOT NULL,
  leerkilometer_aufschlag DECIMAL(5,4) DEFAULT 0.0,

  -- Fahrerpersonal
  stundenlohn_eur DECIMAL(6,2) NOT NULL,
  lenkzeit_korrekturfaktor DECIMAL(5,4) DEFAULT 1.0,
  spesen_pro_tag_eur DECIMAL(6,2) DEFAULT 0,
  uebernachtung_eur DECIMAL(6,2) DEFAULT 0,

  -- Maut/Toll
  maut_deutschland_eur_pro_km DECIMAL(6,4) DEFAULT 0,
  eurovignette_betrag_eur DECIMAL(6,2) DEFAULT 0,
  maut_ausland_pauschal_eur_pro_km DECIMAL(6,4) DEFAULT 0,

  -- Fixkosten Fahrzeug (monatlich)
  kfz_steuer_monatlich_eur DECIMAL(8,2) DEFAULT 0,
  hu_au_monatlich_eur DECIMAL(8,2) DEFAULT 0,
  versicherung_monatlich_eur DECIMAL(8,2) DEFAULT 0,
  leasing_abschreibung_monatlich_eur DECIMAL(8,2) DEFAULT 0,
  wartung_monatlich_eur DECIMAL(8,2) DEFAULT 0,

  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID REFERENCES benutzer(id),
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE kostenvorlagen ENABLE ROW LEVEL SECURITY;

-- ==================
-- Persönliche Anpassungen (Disponent-Overrides)
-- ==================
CREATE TABLE persoenliche_anpassungen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  benutzer_id UUID NOT NULL REFERENCES benutzer(id) ON DELETE CASCADE,
  kostenvorlage_id UUID NOT NULL REFERENCES kostenvorlagen(id),
  feld TEXT NOT NULL,
  wert DECIMAL(12,4) NOT NULL,
  erstellt_am TIMESTAMPTZ DEFAULT now(),
  aktualisiert_am TIMESTAMPTZ DEFAULT now(),

  UNIQUE(benutzer_id, kostenvorlage_id, feld)
);

ALTER TABLE persoenliche_anpassungen ENABLE ROW LEVEL SECURITY;

-- ==================
-- Länderspezifische Mautraten
-- ==================
CREATE TABLE maut_tabelle (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES organisationen(id),
  land_code TEXT NOT NULL,
  fahrzeugtyp_id UUID REFERENCES fahrzeugtypen(id),
  tariftyp TEXT NOT NULL DEFAULT 'pro_km' CHECK (tariftyp IN ('pro_km', 'pauschal_pro_trip', 'pro_tag')),
  betrag_eur DECIMAL(8,4) NOT NULL,
  gueltig_ab DATE NOT NULL,
  gueltig_bis DATE,
  erstellt_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE maut_tabelle ENABLE ROW LEVEL SECURITY;

-- ==================
-- Bewertete Angebote (Historie)
-- ==================
CREATE TABLE bewertete_angebote (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  benutzer_id UUID NOT NULL REFERENCES benutzer(id),
  organisation_id UUID NOT NULL REFERENCES organisationen(id),
  kostenvorlage_id UUID NOT NULL REFERENCES kostenvorlagen(id),

  -- Angebotsdaten (aus TimoCom extrahiert)
  timocom_angebot_id TEXT,
  ladung TEXT,
  ladeort TEXT NOT NULL,
  entladeort TEXT NOT NULL,
  ladeort_plz TEXT,
  entladeort_plz TEXT,
  distanz_km DECIMAL(10,2),
  preis_eur DECIMAL(10,2) NOT NULL,

  -- Berechnungseingaben
  fahrzeugtyp TEXT NOT NULL,
  ist_leerfahrt BOOLEAN DEFAULT false,
  verdraengungskosten_eur DECIMAL(10,2) DEFAULT 0,

  -- Berechnungsergebnisse (denormalisiert für schnelle Abfragen)
  kosten_diesel_eur DECIMAL(10,2),
  kosten_fahrer_eur DECIMAL(10,2),
  kosten_maut_eur DECIMAL(10,2),
  kosten_fixkosten_eur DECIMAL(10,2),
  kosten_gesamt_eur DECIMAL(10,2) NOT NULL,
  marge_eur DECIMAL(10,2) NOT NULL,
  marge_prozent DECIMAL(5,2) NOT NULL,

  -- Entscheidung
  entscheidung TEXT CHECK (entscheidung IN ('angenommen', 'abgelehnt', 'offen')),
  entscheidung_grund TEXT,

  bewertet_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bewertete_angebote ENABLE ROW LEVEL SECURITY;

-- Indizes für häufige Abfragen
CREATE INDEX idx_bewertete_angebote_benutzer_datum
  ON bewertete_angebote(benutzer_id, bewertet_am DESC);
CREATE INDEX idx_bewertete_angebote_organisation_datum
  ON bewertete_angebote(organisation_id, bewertet_am DESC);

-- ==================
-- Diesel-Preis-Cache
-- ==================
CREATE TABLE diesel_preise (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  land_code TEXT NOT NULL DEFAULT 'DE',
  preis_eur_l DECIMAL(5,3) NOT NULL,
  quelle TEXT NOT NULL,
  gueltig_am DATE NOT NULL,
  erstellt_am TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE diesel_preise ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Benutzer: nur eigene Organisation sehen
CREATE POLICY "benutzer_eigene_organisation" ON benutzer
  FOR ALL USING (
    organisation_id IN (
      SELECT organisation_id FROM benutzer WHERE id = auth.uid()
    )
  );

-- Kostenvorlagen: Org-Mitglieder lesen, nur Admins schreiben
CREATE POLICY "kostenvorlagen_lesen" ON kostenvorlagen
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM benutzer WHERE id = auth.uid()
    )
  );

CREATE POLICY "kostenvorlagen_schreiben" ON kostenvorlagen
  FOR ALL USING (
    organisation_id IN (
      SELECT o.id FROM organisationen o
      JOIN benutzer b ON b.organisation_id = o.id
      WHERE b.id = auth.uid() AND b.rolle = 'admin'
    )
  );

-- Persönliche Anpassungen: nur eigener Benutzer
CREATE POLICY "anpassungen_eigene" ON persoenliche_anpassungen
  FOR ALL USING (benutzer_id = auth.uid());

-- Bewertete Angebote: eigene sehen, Admin org-weit
CREATE POLICY "bewertungen_lesen" ON bewertete_angebote
  FOR SELECT USING (
    benutzer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM benutzer WHERE id = auth.uid() AND rolle = 'admin'
        AND organisation_id = bewertete_angebote.organisation_id
    )
  );

CREATE POLICY "bewertungen_schreiben" ON bewertete_angebote
  FOR INSERT WITH CHECK (benutzer_id = auth.uid());

CREATE POLICY "bewertungen_aktualisieren" ON bewertete_angebote
  FOR UPDATE USING (benutzer_id = auth.uid());

-- Fahrzeugtypen: Org lesen, Admin schreiben
CREATE POLICY "fahrzeugtypen_lesen" ON fahrzeugtypen
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM benutzer WHERE id = auth.uid()
    )
  );

CREATE POLICY "fahrzeugtypen_schreiben" ON fahrzeugtypen
  FOR ALL USING (
    organisation_id IN (
      SELECT o.id FROM organisationen o
      JOIN benutzer b ON b.organisation_id = o.id
      WHERE b.id = auth.uid() AND b.rolle = 'admin'
    )
  );

-- Maut-Tabelle: Org lesen, Admin schreiben
CREATE POLICY "maut_tabelle_lesen" ON maut_tabelle
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM benutzer WHERE id = auth.uid()
    )
  );

CREATE POLICY "maut_tabelle_schreiben" ON maut_tabelle
  FOR ALL USING (
    organisation_id IN (
      SELECT o.id FROM organisationen o
      JOIN benutzer b ON b.organisation_id = o.id
      WHERE b.id = auth.uid() AND b.rolle = 'admin'
    )
  );

-- Diesel-Preise: Org lesen
CREATE POLICY "diesel_preise_lesen" ON diesel_preise
  FOR SELECT USING (true);

-- =============================================
-- Updated_at Trigger
-- =============================================
CREATE OR REPLACE FUNCTION aktualisiere_zeitstempel()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aktualisiert_am = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organisationen_aktualisiert
  BEFORE UPDATE ON organisationen
  FOR EACH ROW EXECUTE FUNCTION aktualisiere_zeitstempel();

CREATE TRIGGER trg_benutzer_aktualisiert
  BEFORE UPDATE ON benutzer
  FOR EACH ROW EXECUTE FUNCTION aktualisiere_zeitstempel();

CREATE TRIGGER trg_kostenvorlagen_aktualisiert
  BEFORE UPDATE ON kostenvorlagen
  FOR EACH ROW EXECUTE FUNCTION aktualisiere_zeitstempel();

CREATE TRIGGER trg_persoenliche_anpassungen_aktualisiert
  BEFORE UPDATE ON persoenliche_anpassungen
  FOR EACH ROW EXECUTE FUNCTION aktualisiere_zeitstempel();
