'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Player } from '@/types';
import { usePlayers } from '@/hooks/usePlayers';

interface PlayersContextType {
  players: Player[];
  loading: boolean;
  addPlayer:    (data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Player>;
  editPlayer:   (id: string, patch: Partial<Omit<Player, 'id' | 'createdAt'>>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
}

const PlayersContext = createContext<PlayersContextType>(null!);

export function usePlayersContext(): PlayersContextType {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error('usePlayersContext must be used within PlayersProvider');
  return ctx;
}

export function PlayersProvider({ children }: { children: ReactNode }) {
  const playersState = usePlayers();

  return (
    <PlayersContext.Provider value={playersState}>
      {children}
    </PlayersContext.Provider>
  );
}
