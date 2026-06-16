import { Container, Select, Text, Title } from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import type { HelpPage } from '../page.js';

/** Id of the help center home page; the menu's entry point. */
export const HOME_PAGE_ID = 'home';

const HOME_NAV_SELECT_ID = 'crownicles-help-select';

/** Home page: welcome text, navigation select, and an authorization notice when some pages are hidden. */
export const homePage = {
  id: HOME_PAGE_ID,
  name: 'Accueil',
  requiredAuthorization: 'public',

  render: (_state, ctx) => {
    const { home } = lang.commands.crowniclesHelp.messages;

    const navSelect = new Select(HOME_NAV_SELECT_ID).placeholder(
      home.navSelectPlaceholder,
    );
    for (const page of ctx.visiblePages) {
      navSelect.option(page.name, page.id);
    }
    if (ctx.disabled) {
      navSelect.disabled();
    }

    const container = new Container()
      .color('info')
      .add(new Title(home.title), new Text(home.welcome));

    if (ctx.visiblePages.length < ctx.totalPageCount) {
      container.add(new Text(home.restricted).quote());
    }

    return container.add(navSelect);
  },

  reduce: (interaction, state) => {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === HOME_NAV_SELECT_ID
    ) {
      const pageId = interaction.values[0];
      return pageId !== undefined ? { ...state, pageId } : state;
    }
    return state;
  },
} satisfies HelpPage;
