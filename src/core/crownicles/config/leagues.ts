export interface CrowniclesLeague {
  id: string;
  name: string;
  icon: string;
  xpBonus: number;
  moneyBonus: number;
}

export const CROWNICLES_LEAGUES: readonly CrowniclesLeague[] = [
  { id: 'wood', name: 'Ligue bois', icon: '🌲', xpBonus: 200, moneyBonus: 250 },
  {
    id: 'stone',
    name: 'Ligue pierre',
    icon: '🗿',
    xpBonus: 350,
    moneyBonus: 300,
  },
  { id: 'iron', name: 'Ligue fer', icon: '⚔️', xpBonus: 500, moneyBonus: 500 },
  {
    id: 'bronze',
    name: 'Ligue bronze',
    icon: '🥉',
    xpBonus: 650,
    moneyBonus: 600,
  },
  {
    id: 'silver',
    name: 'Ligue argent',
    icon: '🥈',
    xpBonus: 750,
    moneyBonus: 800,
  },
  { id: 'gold', name: 'Ligue or', icon: '🥇', xpBonus: 1000, moneyBonus: 1000 },
  {
    id: 'diamond',
    name: 'Ligue diamant',
    icon: '💎',
    xpBonus: 1300,
    moneyBonus: 1300,
  },
  {
    id: 'elite',
    name: 'Ligue élite',
    icon: '💯',
    xpBonus: 1450,
    moneyBonus: 1500,
  },
  {
    id: 'infinite',
    name: 'Ligue infinie',
    icon: '🌀',
    xpBonus: 1750,
    moneyBonus: 1700,
  },
  {
    id: 'legend',
    name: 'Ligue légende',
    icon: '🏆',
    xpBonus: 2000,
    moneyBonus: 2000,
  },
  {
    id: 'royal',
    name: 'Ligue royal',
    icon: '👑',
    xpBonus: 2050,
    moneyBonus: 2025,
  },
];
