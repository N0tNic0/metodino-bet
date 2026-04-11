'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from '@/types';
import { loadPlayers, savePlayers, createPlayer, updatePlayer } from '@/lib/storage';
import {
  isSupabaseConfigured,
  sbLoadPlayers, sbInsertPlayer, sbUpdatePlayer, sbDeletePlayer,
} from '@/lib/supabase';

export function usePlayers() {
  const [players, setPlayers]   = useState<Player[]>([]);
  const [loading, setLoading]   = useState(true);

  // Ref always up-to-date — lets callbacks read current players without stale closure
  const playersRef = useRef<Player[]>([]);
  useEffect(() => { playersRef.current = players; }, [players]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const applyAndPersist = useCallback((next: Player[]) => {
    savePlayers(next);
    setPlayers(next);
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        try {
          const remote = await sbLoadPlayers();
          applyAndPersist(remote);
        } catch (e) {
          console.error('Supabase players load failed, falling back to localStorage', e);
          const local = loadPlayers();
          setPlayers(local);
        }
      } else {
        const local = loadPlayers();
        setPlayers(local);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add ──────────────────────────────────────────────────────────────────────
  const addPlayer = useCallback(async (
    data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Player> => {
    const player = createPlayer(data);

    if (isSupabaseConfigured) {
      try {
        const saved = await sbInsertPlayer(player);
        applyAndPersist([...playersRef.current, saved].sort((a, b) => a.name.localeCompare(b.name)));
        return saved;
      } catch (e) {
        console.error('Supabase player insert failed', e);
        throw e;
      }
    }

    const next = [...playersRef.current, player].sort((a, b) => a.name.localeCompare(b.name));
    applyAndPersist(next);
    return player;
  }, [applyAndPersist]);

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const editPlayer = useCallback(async (
    id: string,
    patch: Partial<Omit<Player, 'id' | 'createdAt'>>
  ) => {
    const existing = playersRef.current.find(p => p.id === id);
    if (!existing) return;
    const updated = updatePlayer(existing, patch);

    const next = playersRef.current
      .map(p => p.id === id ? updated : p)
      .sort((a, b) => a.name.localeCompare(b.name));
    applyAndPersist(next);

    if (isSupabaseConfigured) {
      try {
        await sbUpdatePlayer(updated);
      } catch (e) {
        console.error('Supabase player update failed', e);
        // Rollback
        applyAndPersist(playersRef.current.map(p => p.id === id ? existing : p));
      }
    }
  }, [applyAndPersist]);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deletePlayer = useCallback(async (id: string) => {
    const prev = playersRef.current;
    const next = prev.filter(p => p.id !== id);
    applyAndPersist(next);

    if (isSupabaseConfigured) {
      try {
        await sbDeletePlayer(id);
      } catch (e) {
        console.error('Supabase player delete failed', e);
        // Rollback
        applyAndPersist(prev);
      }
    }
  }, [applyAndPersist]);

  return { players, loading, addPlayer, editPlayer, deletePlayer };
}
