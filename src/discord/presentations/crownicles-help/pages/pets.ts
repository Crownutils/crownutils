import { lang } from '@/discord/lang/index.js';
import { createComingSoonPage } from './coming-soon.js';

/** Pets help page: placeholder until the pets feature is implemented. */
export const petsPage = createComingSoonPage(
  'pets',
  '🐾',
  lang.commands.crowniclesHelp.pages.pets,
);
