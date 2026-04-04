'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Bet } from '@/types';
import { useBets, StorageMode } from '@/hooks/useBets';
import BetForm from '@/components/bets/BetForm';
import DeleteConfirmModal from '@/components/bets/DeleteConfirmModal';
import DbStatusBanner from '@/components/layout/DbStatusBanner';

interface BetsContextType {
  bets: Bet[];
  initialized: boolean;
  storageMode: StorageMode;
  dbError: string | null;
  addBet: (data: Omit<Bet, 'id' | 'netProfit' | 'createdAt' | 'updatedAt'>) => Promise<Bet>;
  editBet: (id: string, patch: Partial<Omit<Bet, 'id' | 'createdAt'>>) => Promise<void>;
  deleteBet: (id: string) => Promise<void>;
  importBets: (bets: Bet[]) => Promise<void>;
  clearAll: () => void;
  openForm: (bet?: Bet) => void;
  openDelete: (bet: Bet) => void;
}

const BetsContext = createContext<BetsContextType>(null!);

export function useBetsContext(): BetsContextType {
  const ctx = useContext(BetsContext);
  if (!ctx) throw new Error('useBetsContext must be used within BetsProvider');
  return ctx;
}

export function BetsProvider({ children }: { children: ReactNode }) {
  const betsState = useBets();

  // ── Form modal ──────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);

  const openForm = useCallback((bet?: Bet) => {
    setEditingBet(bet ?? null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingBet(null);
  }, []);

  // ── Delete modal ────────────────────────────────────────────────────────────
  const [deletingBet, setDeletingBet] = useState<Bet | null>(null);

  const openDelete  = useCallback((bet: Bet) => setDeletingBet(bet), []);
  const closeDelete = useCallback(() => setDeletingBet(null), []);

  const confirmDelete = useCallback(async () => {
    if (deletingBet) {
      await betsState.deleteBet(deletingBet.id);
      setDeletingBet(null);
    }
  }, [deletingBet, betsState]);

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (data: Omit<Bet, 'id' | 'netProfit' | 'createdAt' | 'updatedAt'>) => {
    if (editingBet) {
      await betsState.editBet(editingBet.id, data);
    } else {
      await betsState.addBet(data);
    }
    closeForm();
  }, [editingBet, betsState, closeForm]);

  return (
    <BetsContext.Provider value={{
      ...betsState,
      openForm,
      openDelete,
    }}>
      {children}

      <DbStatusBanner mode={betsState.storageMode} error={betsState.dbError} />

      <BetForm
        open={isFormOpen}
        bet={editingBet}
        onClose={closeForm}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        bet={deletingBet}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
    </BetsContext.Provider>
  );
}
