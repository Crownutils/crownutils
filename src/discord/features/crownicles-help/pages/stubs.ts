import { helpMessages } from '../crownicles-help.ui.js';
import { createComingSoonPage } from './coming-soon.js';

/**
 * The announced-but-unwritten categories, shown as coming-soon placeholders.
 * Replace each with a real page file once its content is implemented.
 */

export const ragePage = createComingSoonPage({
  id: 'rage',
  icon: '🤬',
  name: (locale) => helpMessages(locale).rage.name,
  description: (locale) => helpMessages(locale).rage.description,
});

export const witchPage = createComingSoonPage({
  id: 'witch',
  icon: '🧹',
  name: (locale) => helpMessages(locale).witch.name,
  description: (locale) => helpMessages(locale).witch.description,
});

export const leaguesPage = createComingSoonPage({
  id: 'leagues',
  icon: '🏆',
  name: (locale) => helpMessages(locale).leagues.name,
  description: (locale) => helpMessages(locale).leagues.description,
});

export const routePage = createComingSoonPage({
  id: 'route',
  icon: '🗺️',
  name: (locale) => helpMessages(locale).route.name,
  description: (locale) => helpMessages(locale).route.description,
});

export const missionsPage = createComingSoonPage({
  id: 'missions',
  icon: '📜',
  name: (locale) => helpMessages(locale).missions.name,
  description: (locale) => helpMessages(locale).missions.description,
});
