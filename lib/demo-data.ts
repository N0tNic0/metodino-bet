import { Bet } from '@/types';
import { calcNetProfit } from './calculations';

function bet(
  id: string, date: string,
  description: string, category: string,
  odds: number, stake: number,
  status: Bet['status']
): Bet {
  const now = new Date().toISOString();
  return { id, date, description, category, odds, stake, status, netProfit: calcNetProfit(odds, stake, status), createdAt: now, updatedAt: now };
}

/**
 * Demo dataset: 16 bets over Dec 2024 – Jan 2025
 * Concluded: 14 | Won: 9 | Lost: 4 | Void: 1 | Pending: 2
 * Approx. ROI: +19.8%  |  Win rate: 64.3%
 */
export const DEMO_BETS: Bet[] = [
  bet('d1',  '2024-12-01', 'Milan - Inter, 1X2 Milan',          'Calcio',  2.10, 20,  'vinta'),
  bet('d2',  '2024-12-03', 'Juventus - Roma, BTTS sì',           'Calcio',  1.75, 15,  'persa'),
  bet('d3',  '2024-12-05', 'Djokovic vince il 1° set',           'Tennis',  1.55, 25,  'vinta'),
  bet('d4',  '2024-12-08', 'Lakers - Warriors, Lakers +5.5',     'Basket',  1.90, 30,  'persa'),
  bet('d5',  '2024-12-10', 'Real Madrid - Atletico, Real vince', 'Calcio',  2.30, 20,  'vinta'),
  bet('d6',  '2024-12-12', 'Alcaraz vince il match',             'Tennis',  1.65, 10,  'vinta'),
  bet('d7',  '2024-12-15', 'PSG - Marsiglia, PSG -1',            'Calcio',  2.05, 25,  'persa'),
  bet('d8',  '2024-12-18', 'Liverpool - Arsenal, Liverpool',     'Calcio',  1.95, 40,  'vinta'),
  bet('d9',  '2024-12-20', 'Celtics - Knicks, Over 215.5',       'Basket',  1.85, 15,  'void'),
  bet('d10', '2024-12-22', 'Napoli - Lazio, Napoli vince',       'Calcio',  2.15, 30,  'persa'),
  bet('d11', '2024-12-26', 'Sinner - Fritz, Sinner vince',       'Tennis',  1.80, 20,  'vinta'),
  bet('d12', '2024-12-28', 'Bayern - Dortmund, BTTS sì',         'Calcio',  1.70, 35,  'vinta'),
  bet('d13', '2025-01-05', 'Inter - Atalanta, Atalanta ML',      'Calcio',  3.20, 10,  'persa'),
  bet('d14', '2025-01-08', 'GSW - LAC, Golden State ML',         'Basket',  2.10, 25,  'vinta'),
  bet('d15', '2025-01-12', 'Man City - Chelsea, City -1.5',      'Calcio',  2.60, 20,  'pending'),
  bet('d16', '2025-01-15', 'Sinner - Zverev, Sinner vince',      'Tennis',  1.45, 50,  'pending'),
];
