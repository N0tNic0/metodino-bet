'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bet } from '@/types';
import { loadBets, saveBets, createBet, updateBet } from '@/lib/storage';
import { DEMO_BETS } from '@/lib/demo-data';
import {
  isSupabaseConfigured,
  sbLoadBets, sbInsertBet, sbUpdateBet, sbDeleteBet, sbUpsertBets,
} from '@/lib/supabase';

export type StorageMode = 'supabase' | 'local';

export function useBets() {
  const [bets, setBets]       = useState<Bet[]>([]);
  const [initialized, setInit] = useState(false);
  const [storageMode]          = useState<StorageMode>(isSupabaseConfigured ? 'supabase' : 'local');
  const [dbError, setDbError]  = useState<string | null>(null);

  // Ref sempre aggiornato — permette di leggere i bets correnti
  // fuori dai callback di setState (evita side-effect dentro updater)
  const betsRef = useRef<Bet[]>([]);
  useEffect(() => { betsRef.current = bets; }, [bets]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const applyAndPersist = useCallback((next: Bet[]) => {
    saveBets(next);
    setBets(next);
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        try {
          const remote = await sbLoadBets();
          if (remote.length === 0) {
            await sbUpsertBets(DEMO_BETS);
            applyAndPersist(DEMO_BETS);
          } else {
            applyAndPersist(remote);
          }
          setDbError(null);
        } catch (e) {
          console.error('Supabase load failed, falling back to localStorage', e);
          setDbError('Impossibile connettersi a Supabase. Dati locali in uso.');
          const local = loadBets();
          const initial = local.length > 0 ? local : DEMO_BETS;
          if (local.length === 0) saveBets(DEMO_BETS);
          setBets(initial);
        }
      } else {
        const local = loadBets();
        const initial = local.length > 0 ? local : DEMO_BETS;
        if (local.length === 0) saveBets(DEMO_BETS);
        setBets(initial);
      }
      setInit(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add ────────────────────────────────────────────────────────────────────
  const addBet = useCallback(async (
    data: Omit<Bet, 'id' | 'netProfit' | 'createdAt' | 'updatedAt'>
  ): Promise<Bet> => {
    const bet = createBet(data);

    if (isSupabaseConfigured) {
      try {
        const saved = await sbInsertBet(bet);
        applyAndPersist([saved, ...betsRef.current]);
        setDbError(null);
        return saved;
      } catch (e) {
        console.error('Supabase insert failed', e);
        setDbError('Errore salvataggio su Supabase. Riprova.');
        // Non salvare localmente se Supabase è configurato — evita desync
        throw e;
      }
    }

    applyAndPersist([bet, ...betsRef.current]);
    return bet;
  }, [applyAndPersist]);

  // ── Edit ───────────────────────────────────────────────────────────────────
  const editBet = useCallback(async (
    id: string,
    patch: Partial<Omit<Bet, 'id' | 'createdAt'>>
  ) => {
    // 1. Calcola il bet aggiornato dalla ref (sempre fresco, fuori da setBets)
    const existing = betsRef.current.find(b => b.id === id);
    if (!existing) return;
    const updated = updateBet(existing, patch);

    // 2. Aggiorna stato locale immediatamente (ottimistico)
    const next = betsRef.current.map(b => b.id === id ? updated : b);
    applyAndPersist(next);

    // 3. Sincronizza su Supabase (fuori dal callback di setState)
    if (isSupabaseConfigured) {
      try {
        await sbUpdateBet(updated);
        setDbError(null);
      } catch (e) {
        console.error('Supabase update failed', e);
        setDbError('Errore aggiornamento su Supabase.');
        // Rollback ottimistico
        applyAndPersist(betsRef.current.map(b => b.id === id ? existing : b));
      }
    }
  }, [applyAndPersist]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteBet = useCallback(async (id: string) => {
    const prev = betsRef.current;
    const next = prev.filter(b => b.id !== id);

    // Ottimistico
    applyAndPersist(next);

    if (isSupabaseConfigured) {
      try {
        await sbDeleteBet(id);
        setDbError(null);
      } catch (e) {
        console.error('Supabase delete failed', e);
        setDbError('Errore eliminazione su Supabase.');
        // Rollback
        applyAndPersist(prev);
      }
    }
  }, [applyAndPersist]);

  // ── Import ─────────────────────────────────────────────────────────────────
  const importBets = useCallback(async (incoming: Bet[]) => {
    const existingIds = new Set(betsRef.current.map(b => b.id));
    const toAdd = incoming.filter(b => !existingIds.has(b.id));
    const merged = [...betsRef.current, ...toAdd];

    applyAndPersist(merged);

    if (isSupabaseConfigured && toAdd.length > 0) {
      try {
        await sbUpsertBets(toAdd);
        setDbError(null);
      } catch (e) {
        console.error('Supabase upsert failed', e);
        setDbError('Errore importazione su Supabase.');
      }
    }
  }, [applyAndPersist]);

  // ── Clear ──────────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    applyAndPersist([]);
  }, [applyAndPersist]);

  return { bets, initialized, storageMode, dbError, addBet, editBet, deleteBet, importBets, clearAll };
}
