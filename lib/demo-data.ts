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

export const DEMO_BETS: Bet[] = [
  bet('00000000-0000-0000-0000-000000000001', '2024-12-01', 'Milan - Inter, 1X2 Milan',          'Calcio',  2.10, 20,  'vinta'),
  bet('00000000-0000-0000-0000-000000000002', '2024-12-03', 'Juventus - Roma, BTTS sì',           'Calcio',  1.75, 15,  'persa'),
  bet('00000000-0000-0000-0000-000000000003', '2024-12-05', 'Djokovic vince il 1° set',           'Tennis',  1.55, 25,  'vinta'),
  bet('00000000-0000-0000-0000-000000000004', '2024-12-08', 'Lakers - Warriors, Lakers +5.5',     'Basket',  1.90, 30,  'persa'),
  bet('00000000-0000-0000-0000-000000000005', '2024-12-10', 'Real Madrid - Atletico, Real vince', 'Calcio',  2.30, 20,  'vinta'),
  bet('00000000-0000-0000-0000-000000000006', '2024-12-12', 'Alcaraz vince il match',             'Tennis',  1.65, 10,  'vinta'),
  bet('00000000-0000-0000-0000-000000000007', '2024-12-15', 'PSG - Marsiglia, PSG -1',            'Calcio',  2.05, 25,  'persa'),
  bet('00000000-0000-0000-0000-000000000008', '2024-12-18', 'Liverpool - Arsenal, Liverpool',     'Calcio',  1.95, 40,  'vinta'),
  bet('00000000-0000-0000-0000-000000000009', '2024-12-20', 'Celtics - Knicks, Over 215.5',       'Basket',  1.85, 15,  'void'),
  bet('00000000-0000-0000-0000-000000000010', '2024-12-22', 'Napoli - Lazio, Napoli vince',       'Calcio',  2.15, 30,  'persa'),
  bet('00000000-0000-0000-0000-000000000011', '2024-12-26', 'Sinner - Fritz, Sinner vince',       'Tennis',  1.80, 20,  'vinta'),
  bet('00000000-0000-0000-0000-000000000012', '2024-12-28', 'Bayern - Dortmund, BTTS sì',         'Calcio',  1.70, 35,  'vinta'),
  bet('00000000-0000-0000-0000-000000000013', '2025-01-05', 'Inter - Atalanta, Atalanta ML',      'Calcio',  3.20, 10,  'persa'),
  bet('00000000-0000-0000-0000-000000000014', '2025-01-08', 'GSW - LAC, Golden State ML',         'Basket',  2.10, 25,  'vinta'),
  bet('00000000-0000-0000-0000-000000000015', '2025-01-12', 'Man City - Chelsea, City -1.5',      'Calcio',  2.60, 20,  'pending'),
  bet('00000000-0000-0000-0000-000000000016', '2025-01-15', 'Sinner - Zverev, Sinner vince',      'Tennis',  1.45, 50,  'pending'),
];
