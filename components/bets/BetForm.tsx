'use client';

import { useState, useEffect } from 'react';
import { Bet, BetFormData, BetStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { calcNetProfit, formatCurrencyPlain } from '@/lib/calculations';
import { usePlayersContext } from '@/providers/PlayersProvider';

interface BetFormProps {
  open: boolean;
  bet: Bet | null;
  onClose: () => void;
  onSave: (data: Omit<Bet, 'id' | 'netProfit' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const today = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM: BetFormData = {
  date:        today(),
  description: '',
  category:    '',
  betType:     '',
  odds:        '',
  stake:       '',
  status:      'pending',
  vincita:     '',
  playerIds:   [],
};

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'vinta',   label: '✅ Vinta' },
  { value: 'persa',   label: '❌ Persa' },
  { value: 'void',    label: '🔄 Void' },
];

const CATEGORY_OPTIONS = [
  { value: '',          label: 'Categoria (opzionale)' },
  { value: 'Calcio',    label: '⚽ Calcio' },
  { value: 'Tennis',    label: '🎾 Tennis' },
  { value: 'Basket',    label: '🏀 Basket' },
  { value: 'Football',  label: '🏈 Football' },
  { value: 'Rugby',     label: '🏉 Rugby' },
  { value: 'Hockey',    label: '🏒 Hockey' },
  { value: 'Baseball',  label: '⚾ Baseball' },
  { value: 'Golf',      label: '⛳ Golf' },
  { value: 'Formula 1', label: '🏎 Formula 1' },
  { value: 'MMA/UFC',   label: '🥊 MMA/UFC' },
  { value: 'Altro',     label: '🎯 Altro' },
];

const BET_TYPE_OPTIONS = [
  { value: '',                 label: 'Tipo giocata (opzionale)' },
  { value: 'Singola',          label: 'Singola' },
  { value: 'Multipla',         label: 'Multipla (Accumulator)' },
  { value: 'Sistema',          label: 'Sistema' },
  { value: '1X2',              label: '1X2' },
  { value: 'Over/Under',       label: 'Over / Under' },
  { value: 'BTTS',             label: 'BTTS (Gol/Gol)' },
  { value: 'Handicap',         label: 'Handicap' },
  { value: 'Esatto risultato', label: 'Esatto risultato' },
  { value: 'Testa a testa',    label: 'Testa a testa' },
  { value: 'Combo',            label: 'Combo' },
  { value: 'Altro',            label: 'Altro' },
];

interface FormErrors {
  date?: string;
  odds?: string;
  stake?: string;
  vincita?: string;
}

export default function BetForm({ open, bet, onClose, onSave }: BetFormProps) {
  const { players } = usePlayersContext();
  const [form, setForm]   = useState<BetFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      if (bet) {
        setForm({
          date:        bet.date,
          description: bet.description ?? '',
          category:    bet.category ?? '',
          betType:     bet.betType ?? '',
          odds:        String(bet.odds),
          stake:       String(bet.stake),
          status:      bet.status,
          vincita:     bet.vincita != null ? String(bet.vincita) : '',
          playerIds:   bet.playerIds ?? [],
        });
      } else {
        setForm({ ...EMPTY_FORM, date: today() });
      }
    }
  }, [open, bet]);

  const set = <K extends keyof BetFormData>(key: K, value: BetFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const oddsNum    = parseFloat(form.odds);
  const stakeNum   = parseFloat(form.stake);
  const vincitaNum = parseFloat(form.vincita);
  const validOdds  = !isNaN(oddsNum)  && oddsNum > 1;
  const validStake = !isNaN(stakeNum) && stakeNum > 0;
  const hasVincita = form.status === 'vinta' && !isNaN(vincitaNum) && vincitaNum > 0;

  // Live profit preview: uses vincita if filled, otherwise formula
  const previewProfit = validOdds && validStake
    ? calcNetProfit(oddsNum, stakeNum, form.status, hasVincita ? vincitaNum : undefined)
    : null;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.date)                     errs.date  = 'La data è obbligatoria';
    if (!form.odds || isNaN(oddsNum))   errs.odds  = 'Quota non valida';
    else if (oddsNum <= 1)              errs.odds  = 'La quota deve essere > 1.00';
    if (!form.stake || isNaN(stakeNum)) errs.stake = 'Stake non valido';
    else if (stakeNum <= 0)             errs.stake = 'Lo stake deve essere > 0';
    if (form.vincita && !isNaN(vincitaNum) && vincitaNum <= 0)
      errs.vincita = 'La vincita deve essere > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const togglePlayer = (id: string) => {
    setForm(prev => {
      const ids = prev.playerIds.includes(id)
        ? prev.playerIds.filter(pid => pid !== id)
        : [...prev.playerIds, id];
      return { ...prev, playerIds: ids };
    });
  };

  // Per-player stake preview
  const numSelected = form.playerIds.length;
  const stakePerPlayer = validStake && numSelected > 0
    ? stakeNum / numSelected
    : null;

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        date:        form.date,
        description: form.description.trim() || undefined,
        category:    form.category || undefined,
        betType:     form.betType || undefined,
        odds:        oddsNum,
        stake:       stakeNum,
        status:      form.status as BetStatus,
        vincita:     hasVincita ? vincitaNum : undefined,
        playerIds:   form.playerIds,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bet ? 'Modifica scommessa' : 'Nuova scommessa'}
    >
      {/* Scrollable content — gestisce tastiera aperta su mobile */}
      <div className="overflow-y-auto max-h-[70dvh] px-5 pb-6 pt-2 flex flex-col gap-4">

        {/* Data — full width */}
        <Input
          label="Data"
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          error={errors.date}
          className="[color-scheme:dark]"
        />

        {/* Esito — full width */}
        <Select
          label="Esito"
          value={form.status}
          onChange={e => set('status', e.target.value as BetStatus)}
          options={STATUS_OPTIONS}
        />

        {/* Descrizione */}
        <Input
          label="Descrizione"
          type="text"
          placeholder="Milan - Inter, 1X2 Milan…"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          hint="Opzionale"
        />

        {/* Categoria + Tipo giocata — side by side (labels corti) */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Categoria"
            value={form.category}
            onChange={e => set('category', e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Tipo giocata"
            value={form.betType}
            onChange={e => set('betType', e.target.value)}
            options={BET_TYPE_OPTIONS}
          />
        </div>

        {/* Quota + Stake */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quota"
            type="number"
            placeholder="1.85"
            min="1.01"
            step="0.05"
            value={form.odds}
            onChange={e => set('odds', e.target.value)}
            error={errors.odds}
          />
          <Input
            label="Stake (€)"
            type="number"
            placeholder="10.00"
            min="0.01"
            step="0.50"
            value={form.stake}
            onChange={e => set('stake', e.target.value)}
            error={errors.stake}
          />
        </div>

        {/* Vincita effettiva — solo quando esito = vinta */}
        {form.status === 'vinta' && (
          <Input
            label="Vincita effettiva (€)"
            type="number"
            placeholder={validOdds && validStake ? String((stakeNum * oddsNum).toFixed(2)) : '0.00'}
            min="0.01"
            step="0.50"
            value={form.vincita}
            onChange={e => set('vincita', e.target.value)}
            error={errors.vincita}
            hint="Opzionale — inserisci solo se diversa dal calcolato"
          />
        )}

        {/* Partecipanti multi-select */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Partecipanti</span>
          {players.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
              Nessun giocatore registrato — aggiungine uno nella sezione Giocatori
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {players.map(player => {
                const checked = form.playerIds.includes(player.id);
                return (
                  <label
                    key={player.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-colors ${
                      checked
                        ? 'bg-violet-600/15 border-violet-500/40'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlayer(player.id)}
                      className="w-4 h-4 accent-violet-500 rounded"
                    />
                    <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-slate-300'}`}>
                      {player.name}
                    </span>
                  </label>
                );
              })}
              {stakePerPlayer !== null && (
                <p className="text-xs text-violet-400 mt-1 px-1">
                  Quota per giocatore: {formatCurrencyPlain(stakePerPlayer)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Profit preview */}
        {previewProfit !== null && (
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
            previewProfit > 0 ? 'bg-emerald-500/10 border-emerald-500/20'
            : previewProfit < 0 ? 'bg-rose-500/10 border-rose-500/20'
            : 'bg-slate-800 border-slate-700'
          }`}>
            <span className="text-xs text-slate-400">Profitto netto previsto</span>
            <span className={`text-sm font-bold ${
              previewProfit > 0 ? 'text-emerald-400'
              : previewProfit < 0 ? 'text-rose-400'
              : 'text-slate-400'
            }`}>
              {previewProfit > 0 ? '+' : ''}{formatCurrencyPlain(previewProfit)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose}>Annulla</Button>
          <Button variant="primary" fullWidth onClick={handleSubmit} loading={saving}>
            {bet ? 'Salva modifiche' : 'Aggiungi'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
