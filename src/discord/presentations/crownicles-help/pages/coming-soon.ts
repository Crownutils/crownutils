import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage } from '../page.js';

/** The `lang` slice a placeholder ("coming soon") help page needs. */
interface ComingSoonPageLang {
  name: string;
  description: string;
  messages: { comingSoon: string };
}

/**
 * Builds a placeholder help page that only shows a "coming soon" notice and the
 * navigation select. Used for features not implemented yet (rage, events, …).
 */
export function createComingSoonPage(
  id: string,
  icon: string,
  page: ComingSoonPageLang,
): HelpPage {
  return {
    id,
    name: page.name,
    description: page.description,
    icon,
    requiredAuthorization: 'public',
    render: (_state, ctx) =>
      new Container()
        .color('info')
        .add(
          new Title(`${icon} ${page.name}`),
          new Separator(),
          new Text(page.messages.comingSoon).size('subtle'),
          new Separator(),
          buildNavSelect(ctx),
        ),
    reduce: (_interaction, state) => state,
  };
}
