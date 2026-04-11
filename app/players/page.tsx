'use client';

import { useState, useMemo } from 'react';
import { Users, Plus, Pencil, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { usePlayersContext } from '@/providers/PlayersProvider';
import { useBetsContext } from '@/providers/BetsProvider';
import { Player } from '@/types';
import {
  calcPlayerStats,
  formatCurrency, formatCurrencyPlain, formatPercent, formatDate,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

// ── Player form state ─────────────────────────────────────────────────────────

interface PlayerFormData {
  name:            string;
  registeredAt:    string;
  capitalInvested: string;
}

const today = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM: PlayerFormData = {
  name:            '',
  registeredAt:    today(),
  capitalInvested: '',
};

interface FormErrors {
  name?:            string;
  registeredAt?:    string;
  capitalInvested?: string;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PlayersPage() {
  const { players, loading, addPlayer, editPlayer, deletePlayer } = usePlayersContext();
  const { bets } = useBetsContext();

  // Form modal state
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm]               = useState<PlayerFormData>(EMPTY_FORM);
  const [errors, setErrors]           = useState<FormErrors>({});
  const [saving, setSaving]           = useState(false);

  // Delete confirm state
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  const openCreate = () => {
    setEditingPlayer(null);
    setForm({ ...EMPTY_FORM, registeredAt: today() });
    setErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    setForm({
      name:            player.name,
      registeredAt:    player.registeredAt,
      capitalInvested: String(player.capitalInvested),
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlayer(null);
  };

  const setField = <K extends keyof PlayerFormData>(key: K, value: PlayerFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim())             errs.name            = 'Il nome è obbligatorio';
    if (!form.registeredAt)            errs.registeredAt    = 'La data è obbligatoria';
    const cap = parseFloat(form.capitalInvested);
    if (form.capitalInvested && (isNaN(cap) || cap < 0))
      errs.capitalInvested = 'Capitale non valido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        name:            form.name.trim(),
        registeredAt:    form.registeredAt,
        capitalInvested: form.capitalInvested ? parseFloat(form.capitalInvested) : 0,
      };
      if (editingPlayer) {
        await editPlayer(editingPlayer.id, data);
      } else {
        await addPlayer(data);
      }
      closeForm();
    } catch {
      // error already logged in hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPlayer) return;
    await deletePlayer(deletingPlayer.id);
    setDeletingPlayer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-nav">
      <Header
        title="Giocatori"
        subtitle={`${players.length} giocatore${players.length !== 1 ? 'i' : ''} registrat${players.length !== 1 ? 'i' : 'o'}`}
        right={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuovo
          </button>
        }
      />

      <div className="px-4 pt-4 flex flex-col gap-4">
        {players.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Nessun giocatore</p>
              <p className="text-sm text-slate-400 mt-1">Aggiungi i partecipanti per tracciare le quote individuali</p>
            </div>
            <Button onClick={openCreate}>+ Aggiungi giocatore</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {players.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                bets={bets}
                onEdit={openEdit}
                onDelete={setDeletingPlayer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={editingPlayer ? 'Modifica giocatore' : 'Nuovo giocatore'}
        size="sm"
      >
        <div className="overflow-y-auto max-h-[70dvh] px-5 pb-6 pt-2 flex flex-col gap-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Es. Mario Rossi"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            error={errors.name}
          />
          <Input
            label="Data registrazione"
            type="date"
            value={form.registeredAt}
            onChange={e => setField('registeredAt', e.target.value)}
            error={errors.registeredAt}
            className="[color-scheme:dark]"
          />
          <Input
            label="Capitale investito (€)"
            type="number"
            placeholder="0.00"
            min="0"
            step="10"
            value={form.capitalInvested}
            onChange={e => setField('capitalInvested', e.target.value)}
            error={errors.capitalInvested}
            hint="Opzionale — totale investito nel periodo"
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={closeForm}>Annulla</Button>
            <Button variant="primary"   fullWidth onClick={handleSave} loading={saving}>
              {editingPlayer ? 'Salva modifiche' : 'Aggiungi'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deletingPlayer} onClose={() => setDeletingPlayer(null)} size="sm">
        <div className="flex flex-col items-center gap-4 px-5 pt-3 pb-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Elimina giocatore</h3>
            <p className="text-sm text-slate-400 mt-1">
              {deletingPlayer?.name}
            </p>
            <p className="text-xs text-slate-500 mt-2">Questa azione non può essere annullata.</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" fullWidth onClick={() => setDeletingPlayer(null)}>Annulla</Button>
            <Button variant="danger"    fullWidth onClick={handleDelete}>Elimina</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Player card ───────────────────────────────────────────────────────────────

function PlayerCard({
  player, bets, onEdit, onDelete,
}: {
  player: Player;
  bets: ReturnType<typeof useBetsContext>['bets'];
  onEdit: (p: Player) => void;
  onDelete: (p: Player) => void;
}) {
  const stats = useMemo(() => calcPlayerStats(bets, player.id), [bets, player.id]);

  const profitPositive = stats.totalProfit > 0;
  const profitNeutral  = stats.totalProfit === 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white">{player.name}</span>
          <span className="text-xs text-slate-500">
            Dal {formatDate(player.registeredAt)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(player)}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Modifica giocatore"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(player)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            aria-label="Elimina giocatore"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatTile
          label="Capitale investito"
          value={formatCurrencyPlain(player.capitalInvested)}
          color="text-slate-300"
        />
        <StatTile
          label="Profitto / Perdita"
          value={formatCurrency(stats.totalProfit)}
          color={profitNeutral ? 'text-slate-400' : profitPositive ? 'text-emerald-400' : 'text-rose-400'}
          icon={profitNeutral ? null : profitPositive
            ? <TrendingUp className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />}
        />
        <StatTile
          label="ROI"
          value={formatPercent(stats.roi)}
          color={stats.roi > 0 ? 'text-emerald-400' : stats.roi < 0 ? 'text-rose-400' : 'text-slate-400'}
        />
        <StatTile
          label="Scommesse"
          value={String(stats.betCount)}
          color="text-slate-300"
        />
      </div>
    </div>
  );
}

function StatTile({ label, value, color, icon }: {
  label: string; value: string; color: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={cn('text-sm font-bold flex items-center gap-1', color)}>
        {icon}
        {value}
      </span>
    </div>
  );
}
