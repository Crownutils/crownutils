import { Container, Text, Title } from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import type { HelpPage } from '../page.js';

/** Id of the help center home page; the menu's entry point. */
export const HOME_PAGE_ID = 'home';

/** Home page stub: a placeholder welcome. The real menu is added later. */
export const homePage = {
  id: HOME_PAGE_ID,
  requiredAuthorization: 'public',
  render: (_state, _ctx) =>
    new Container()
      .color('info')
      .add(
        new Title(lang.commands.crowniclesHelp.messages.home.title),
        new Text(lang.commands.crowniclesHelp.messages.home.welcome),
      ),
  reduce: (_interaction, state) => state,
} satisfies HelpPage;
