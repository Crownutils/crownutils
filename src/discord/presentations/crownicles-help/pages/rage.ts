import { lang } from '@/discord/lang/index.js';
import { createComingSoonPage } from './coming-soon.js';

/** Rage help page: placeholder until the rage feature is implemented. */
export const ragePage = createComingSoonPage(
  'rage',
  '🤬',
  lang.commands.crowniclesHelp.pages.rage,
);
