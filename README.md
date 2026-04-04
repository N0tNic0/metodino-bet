# Metodino Bet

Tracker personale delle scommesse sportive. Mobile-first, dark mode, nessun backend richiesto.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS 3**
- **Recharts** – grafici leggeri e SSR-safe
- **Lucide React** – icone
- **localStorage** – persistenza dati lato client (nessun backend)

## Avvio rapido

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) sul browser o sul telefono (stesso WiFi).

## Struttura cartelle

```
metodino-bet/
├── app/
│   ├── layout.tsx          # Root layout con BetsProvider e BottomNav
│   ├── page.tsx            # Dashboard (KPI + grafici)
│   ├── bets/page.tsx       # Lista scommesse con filtri
│   └── globals.css
├── components/
│   ├── ui/                 # Badge, Button, Input, Modal, Select
│   ├── layout/             # Header, BottomNav
│   ├── dashboard/          # KpiCard, ProfitChart, OutcomeChart
│   └── bets/               # BetCard, BetForm, BetFilters, DeleteConfirmModal
├── hooks/
│   ├── useBets.ts          # CRUD scommesse + localStorage
│   └── useFilters.ts       # Filtri e ordinamento
├── lib/
│   ├── calculations.ts     # Calcoli puri (profit, stats, chart data)
│   ├── storage.ts          # Wrapper localStorage
│   ├── csv.ts              # Esportazione/importazione CSV
│   ├── demo-data.ts        # 16 scommesse demo
│   └── utils.ts            # cn() helper
├── providers/
│   └── BetsProvider.tsx    # Contesto globale (stato + modali)
├── types/
│   └── index.ts            # Tipi TypeScript
└── public/
    └── manifest.json       # PWA manifest
```

## Funzionalità

### Gestione scommesse
- Aggiungi / modifica / elimina scommesse
- Campi: data, descrizione, categoria, quota, stake, esito
- Calcolo automatico del profitto netto
- Preview del profitto in tempo reale nel form

### Dashboard KPI
| KPI | Descrizione |
|-----|-------------|
| Profitto netto | Somma profitti scommesse concluse (escluse pending) |
| ROI | `profitto / stake_concluso * 100` |
| Win Rate | `vinte / (vinte + perse + void) * 100` |
| Loss Rate | `perse / concluse * 100` |
| Pending Rate | `pending / totale * 100` |
| Quota media | Media di tutte le quote |
| Statistiche mensili | Breakdown per mese |

### Grafici
- **Andamento profitto** – area chart del profitto cumulato nel tempo
- **Distribuzione esiti** – donut chart vinte/perse/pending/void

### Filtri e ordinamento
- Per esito (tutte, vinte, perse, pending, void)
- Per intervallo date
- Per quota min/max
- Ricerca testuale su descrizione/categoria
- Ordinamento per data, quota, stake, profitto (asc/desc)

### Import / Export
- **Export CSV**: scarica tutte le scommesse in formato CSV
- **Import CSV**: importa scommesse da CSV (salta duplicati per `id`)

## Formule implementate

```
profitto_netto:
  vinta   → stake * (odds - 1)
  persa   → -stake
  void    → 0
  pending → 0

winRate    = (vinte / concluse) * 100
lossRate   = (perse / concluse) * 100
pendingRate = (pending / totale) * 100
ROI        = (profitto_totale / stake_concluso) * 100

concluse = vinte + perse + void  (escluse pending)
```

> Le scommesse **pending** sono escluse dai KPI finanziari (ROI, profitto, win/loss rate)
> ma contribuiscono al totale scommesse e al pending rate.

## PWA

Installabile su iOS/Android come app standalone:
- iOS: Safari → Condividi → Aggiungi a schermata Home
- Android: Chrome → Menu → Aggiungi a schermata Home

Per abilitare il service worker offline, aggiungi `/public/sw.js` e registralo nel layout.

## Dati demo

Al primo avvio vengono caricati 16 scommesse demo (dic 2024 – gen 2025):
- 9 vinte · 4 perse · 1 void · 2 pending
- ROI ≈ +19.8% · Win rate ≈ 64.3%

Per azzerare, usa il browser DevTools → Application → localStorage → cancella la chiave `metodino-bet-v1`.
