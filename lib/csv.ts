import { Bet } from '@/types';
import { calcNetProfit } from './calculations';

const HEADERS = ['id', 'date', 'description', 'category', 'bet_type', 'odds', 'stake', 'status', 'netProfit', 'createdAt', 'updatedAt'];

function escapeCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function exportToCSV(bets: Bet[]): void {
  const rows = bets.map(b => [
    b.id, b.date, b.description ?? '', b.category ?? '', b.betType ?? '',
    b.odds, b.stake, b.status, b.netProfit, b.createdAt, b.updatedAt,
  ].map(escapeCell).join(','));

  const csv = [HEADERS.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `metodino-bet-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromCSV(file: File): Promise<{ bets: Bet[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text    = (e.target?.result as string).replace(/^\uFEFF/, '');
        const lines   = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const bets: Bet[]     = [];
        const errors: string[] = [];

        lines.slice(1).forEach((line, i) => {
          try {
            // Simple CSV parse: handles quoted fields
            const values: string[] = [];
            let cur = '', inQ = false;
            for (let j = 0; j < line.length; j++) {
              if (line[j] === '"') { inQ = !inQ; continue; }
              if (line[j] === ',' && !inQ) { values.push(cur); cur = ''; continue; }
              cur += line[j];
            }
            values.push(cur);

            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => { obj[h] = values[idx]?.trim() ?? ''; });

            const odds  = parseFloat(obj.odds);
            const stake = parseFloat(obj.stake);
            const status = obj.status as Bet['status'];

            if (isNaN(odds) || odds <= 1) { errors.push(`Riga ${i + 2}: quota non valida`); return; }
            if (isNaN(stake) || stake <= 0) { errors.push(`Riga ${i + 2}: stake non valido`); return; }
            if (!['pending', 'vinta', 'persa', 'void'].includes(status)) { errors.push(`Riga ${i + 2}: stato non valido`); return; }

            bets.push({
              id:          obj.id || crypto.randomUUID(),
              date:        obj.date || new Date().toISOString().split('T')[0],
              description: obj.description || undefined,
              category:    obj.category || undefined,
              betType:     obj.bet_type || undefined,
              odds, stake, status,
              netProfit:   calcNetProfit(odds, stake, status),
              createdAt:   obj.createdAt || new Date().toISOString(),
              updatedAt:   new Date().toISOString(),
            });
          } catch {
            errors.push(`Riga ${i + 2}: errore di parsing`);
          }
        });

        resolve({ bets, errors });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}
