'use client';

import { Bet } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  bet: Bet | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ bet, onClose, onConfirm }: Props) {
  return (
    <Modal open={!!bet} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 px-5 pt-3 pb-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <AlertTriangle className="w-7 h-7 text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Elimina scommessa</h3>
          <p className="text-sm text-slate-400 mt-1">
            {bet?.description
              ? `"${bet.description}"`
              : `Scommessa del ${bet?.date}`}
          </p>
          <p className="text-xs text-slate-500 mt-2">Questa azione non può essere annullata.</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" fullWidth onClick={onClose}>Annulla</Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>Elimina</Button>
        </div>
      </div>
    </Modal>
  );
}
