-- Aggiunge la colonna vincita effettiva (opzionale)
-- Esegui nell'editor SQL di Supabase se hai già creato la tabella con la migration 001

ALTER TABLE bets ADD COLUMN IF NOT EXISTS vincita NUMERIC(10,2);
