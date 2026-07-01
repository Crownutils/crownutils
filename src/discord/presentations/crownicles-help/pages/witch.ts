import { lang } from '@/discord/lang/index.js';
import { createComingSoonPage } from './coming-soon.js';

/** Witch help page: placeholder until the witch feature is implemented. */
export const witchPage = createComingSoonPage(
  'witch',
  '🕸️',
  lang.commands.crowniclesHelp.pages.witch,
);
