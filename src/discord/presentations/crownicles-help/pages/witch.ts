import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage } from '../page.js';

const WITCH_PAGE_ID = 'witch';

const WITCH_ICON = '🕸️';

const { name, description, messages } =
  lang.commands.crowniclesHelp.pages.witch;

/** Witch help page: placeholder until the witch feature is implemented. */
export const witchPage = {
  id: WITCH_PAGE_ID,
  name,
  description,
  icon: WITCH_ICON,
  requiredAuthorization: 'public',

  render: (_state, ctx) =>
    new Container()
      .color('info')
      .add(
        new Title(`${WITCH_ICON} ${name}`),
        new Separator(),
        new Text(messages.comingSoon).size('subtle'),
        new Separator(),
        buildNavSelect(ctx),
      ),

  reduce: (_interaction, state) => state,
} satisfies HelpPage;
