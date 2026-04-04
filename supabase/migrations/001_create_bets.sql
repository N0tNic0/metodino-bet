-- Metodino Bet — tabella scommesse
-- Esegui questo script nell'editor SQL di Supabase Dashboard

CREATE TABLE IF NOT EXISTS bets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date        TEXT        NOT NULL,                          -- YYYY-MM-DD
  description TEXT,
  category    TEXT,
  bet_type    TEXT,                                          -- tipo di giocata (es. Singola, Multipla, Over/Under…)
  odds        NUMERIC(10,3) NOT NULL CHECK (odds > 1),
  stake       NUMERIC(10,2) NOT NULL CHECK (stake > 0),
  status      TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'vinta', 'persa', 'void')),
  net_profit  NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aggiornamento automatico di updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indici utili per le query frequenti
CREATE INDEX IF NOT EXISTS bets_date_idx   ON bets (date DESC);
CREATE INDEX IF NOT EXISTS bets_status_idx ON bets (status);

-- Row Level Security (opzionale — abilita se aggiungi autenticazione in futuro)
-- ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "utente vede solo le sue scommesse" ON bets FOR ALL USING (auth.uid() = user_id);
