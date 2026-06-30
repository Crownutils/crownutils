import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage } from '../page.js';

const EVENTS_PAGE_ID = 'events';

const EVENTS_ICON = '🎭';

const { name, description, messages } =
  lang.commands.crowniclesHelp.pages.events;

/** Events help page: placeholder until the events feature is implemented. */
export const eventsPage = {
  id: EVENTS_PAGE_ID,
  name,
  description,
  icon: EVENTS_ICON,
  requiredAuthorization: 'public',

  render: (_state, ctx) =>
    new Container()
      .color('info')
      .add(
        new Title(`${EVENTS_ICON} ${name}`),
        new Separator(),
        new Text(messages.comingSoon).size('subtle'),
        new Separator(),
        buildNavSelect(ctx),
      ),

  reduce: (_interaction, state) => state,
} satisfies HelpPage;
