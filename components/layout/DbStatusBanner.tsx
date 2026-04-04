'use client';

import { useState } from 'react';
import { Database, HardDrive, AlertTriangle, X } from 'lucide-react';
import { StorageMode } from '@/hooks/useBets';
import { cn } from '@/lib/utils';

interface Props {
  mode: StorageMode;
  error: string | null;
}

export default function DbStatusBanner({ mode, error }: Props) {
  const [dismissed, setDismissed] = useState(false);

  // Show error banner if Supabase failed
  if (error && !dismissed) {
    return (
      <div className="fixed top-14 inset-x-0 z-20 flex items-center justify-between gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 max-w-lg mx-auto text-xs">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Subtle storage mode indicator (only shown once, then hidden)
  if (mode === 'supabase' && !dismissed) {
    return (
      <button
        onClick={() => setDismissed(true)}
        className="fixed top-14 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-500/8 border-b border-emerald-500/15 max-w-lg mx-auto text-[10px] text-emerald-500/70 hover:text-emerald-400 transition-colors"
      >
        <Database className="w-3 h-3" />
        Connesso a Supabase
        <X className="w-3 h-3 ml-1 opacity-50" />
      </button>
    );
  }

  return null;
}
