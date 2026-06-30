/** One Crownicles league: identity, display, and its end-of-season bonuses. */
export interface CrowniclesLeague {
  id: string;
  name: string;
  icon: string;
  /** Accent color (RGB hex), matching the official Crownicles league colors. */
  color: number;
  xpBonus: number;
  moneyBonus: number;
}

/** The Crownicles leagues, from lowest to highest (also their display order). */
export const CROWNICLES_LEAGUES: readonly CrowniclesLeague[] = [
  {
    id: 'wood',
    name: 'Ligue bois',
    icon: '🌲',
    color: 0xa06253,
    xpBonus: 200,
    moneyBonus: 250,
  },
  {
    id: 'stone',
    name: 'Ligue pierre',
    icon: '🗿',
    color: 0x66757f,
    xpBonus: 350,
    moneyBonus: 300,
  },
  {
    id: 'iron',
    name: 'Ligue fer',
    icon: '⚔️',
    color: 0x9aaab4,
    xpBonus: 500,
    moneyBonus: 500,
  },
  {
    id: 'bronze',
    name: 'Ligue bronze',
    icon: '🥉',
    color: 0xff8a3b,
    xpBonus: 650,
    moneyBonus: 600,
  },
  {
    id: 'silver',
    name: 'Ligue argent',
    icon: '🥈',
    color: 0xccd6dd,
    xpBonus: 750,
    moneyBonus: 800,
  },
  {
    id: 'gold',
    name: 'Ligue or',
    icon: '🥇',
    color: 0xffac33,
    xpBonus: 1000,
    moneyBonus: 1000,
  },
  {
    id: 'diamond',
    name: 'Ligue diamant',
    icon: '💎',
    color: 0x5dadec,
    xpBonus: 1300,
    moneyBonus: 1300,
  },
  {
    id: 'elite',
    name: 'Ligue élite',
    icon: '💯',
    color: 0xbb1934,
    xpBonus: 1450,
    moneyBonus: 1500,
  },
  {
    id: 'infinite',
    name: 'Ligue infinie',
    icon: '🌀',
    color: 0x483891,
    xpBonus: 1750,
    moneyBonus: 1700,
  },
  {
    id: 'legend',
    name: 'Ligue légende',
    icon: '🏆',
    color: 0xffdbba,
    xpBonus: 2000,
    moneyBonus: 2000,
  },
  {
    id: 'royal',
    name: 'Ligue royal',
    icon: '👑',
    color: 0xb95e4b,
    xpBonus: 2050,
    moneyBonus: 2025,
  },
];
