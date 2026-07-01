import { lang } from '@/discord/lang/index.js';
import { createComingSoonPage } from './coming-soon.js';

/** Events help page: placeholder until the events feature is implemented. */
export const eventsPage = createComingSoonPage(
  'events',
  '🎭',
  lang.commands.crowniclesHelp.pages.events,
);
