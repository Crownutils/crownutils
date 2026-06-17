import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage } from '../page.js';

export const RAGE_PAGE_ID = 'rage';

const RAGE_ICON = '🤬';

const { name, description, messages } = lang.commands.crowniclesHelp.pages.rage;

/** Rage help page: placeholder until the rage feature is implemented. */
export const ragePage = {
  id: RAGE_PAGE_ID,
  name,
  description,
  icon: RAGE_ICON,
  requiredAuthorization: 'public',

  render: (_state, ctx) =>
    new Container()
      .color('info')
      .add(
        new Title(`${RAGE_ICON} ${name}`),
        new Separator(),
        new Text(messages.comingSoon).size('subtle'),
        new Separator(),
        buildNavSelect(ctx),
      ),

  reduce: (_interaction, state) => state,
} satisfies HelpPage;
