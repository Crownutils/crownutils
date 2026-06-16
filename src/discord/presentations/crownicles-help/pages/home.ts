import { Container, Text, Title } from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage } from '../page.js';

/** Id of the help center home page; the menu's entry point. */
export const HOME_PAGE_ID = 'home';

/** Home page: welcome text, navigation select, and an authorization notice when some pages are hidden. */
const { name, description } = lang.commands.crowniclesHelp.pages.home;

export const homePage = {
  id: HOME_PAGE_ID,
  name,
  description,
  icon: '🏠',
  requiredAuthorization: 'public',

  render: (_state, ctx) => {
    const { home } = lang.commands.crowniclesHelp.messages;

    const container = new Container()
      .color('info')
      .add(new Title(home.title), new Text(home.welcome));

    if (ctx.visiblePages.length < ctx.totalPageCount) {
      container.add(new Text(home.restricted).quote());
    }

    return container.add(buildNavSelect(ctx));
  },

  reduce: (_interaction, state) => state,
} satisfies HelpPage;
