'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bet } from '@/types';
import { loadBets, saveBets, createBet, updateBet } from '@/lib/storage';
import { DEMO_BETS } from '@/lib/demo-data';
import {
  isSupabaseConfigured,
  sbLoadBets, sbInsertBet, sbUpdateBet, sbDeleteBet, sbUpsertBets,
} from '@/lib/supabase';

export type StorageMode = 'supabase' | 'local';

export function useBets() {
  const [bets, setBets]             = useState<Bet[]>([]);
  const [initialized, setInit]      = useState(false);
  const [storageMode]               = useState<StorageMode>(isSupabaseConfigured ? 'supabase' : 'local');
  const [dbError, setDbError]       = useState<string | null>(null);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        try {
          const remote = await sbLoadBets();
          // First launch: seed demo data into Supabase
          if (remote.length === 0) {
            await sbUpsertBets(DEMO_BETS);
            setBets(DEMO_BETS);
          } else {
            setBets(remote);
          }
          setDbError(null);
        } catch (e) {
          console.error('Supabase load failed, falling back to localStorage', e);
          setDbError('Impossibile connettersi a Supabase. Dati locali in uso.');
          const local = loadBets();
          setBets(local.length > 0 ? local : DEMO_BETS);
          if (local.length === 0) saveBets(DEMO_BETS);
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
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const persist = useCallback((next: Bet[]) => {
    saveBets(next); // always keep local cache in sync
  }, []);

  // ── Add ────────────────────────────────────────────────────────────────────
  const addBet = useCallback(async (data: Omit<Bet, 'id' | 'netProfit' | 'createdAt' | 'updatedAt'>): Promise<Bet> => {
    const bet = createBet(data);
    if (isSupabaseConfigured) {
      try {
        const saved = await sbInsertBet(bet);
        setBets(prev => { const n = [saved, ...prev]; persist(n); return n; });
        return saved;
      } catch (e) {
        console.error('Supabase insert failed', e);
        setDbError('Errore di salvataggio su Supabase. Scommessa salvata localmente.');
      }
    }
    setBets(prev => { const n = [bet, ...prev]; persist(n); return n; });
    return bet;
  }, [persist]);

  // ── Edit ───────────────────────────────────────────────────────────────────
  const editBet = useCallback(async (id: string, patch: Partial<Omit<Bet, 'id' | 'createdAt'>>) => {
    setBets(prev => {
      const next = prev.map(b => b.id === id ? updateBet(b, patch) : b);
      persist(next);
      // Fire-and-forget Supabase update
      if (isSupabaseConfigured) {
        const updated = next.find(b => b.id === id);
        if (updated) sbUpdateBet(updated).catch(e => console.error('Supabase update failed', e));
      }
      return next;
    });
  }, [persist]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteBet = useCallback(async (id: string) => {
    setBets(prev => {
      const next = prev.filter(b => b.id !== id);
      persist(next);
      return next;
    });
    if (isSupabaseConfigured) {
      sbDeleteBet(id).catch(e => console.error('Supabase delete failed', e));
    }
  }, [persist]);

  // ── Import ─────────────────────────────────────────────────────────────────
  const importBets = useCallback(async (incoming: Bet[]) => {
    setBets(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const merged = [...prev, ...incoming.filter(b => !existingIds.has(b.id))];
      persist(merged);
      if (isSupabaseConfigured) {
        sbUpsertBets(incoming).catch(e => console.error('Supabase upsert failed', e));
      }
      return merged;
    });
  }, [persist]);

  // ── Clear ──────────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setBets([]);
    saveBets([]);
    // Note: does not delete from Supabase — intentional (destructive op)
  }, []);

  return { bets, initialized, storageMode, dbError, addBet, editBet, deleteBet, importBets, clearAll };
}
