import type { SupportedLocale } from '@/core/types.js';
import { createContainer, Text } from '@/discord/components/index.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import { helpMessages } from '../crownicles-help.ui.js';

export const HOME_PAGE_ID = 'home';

const HOME_ICON = '🏠';

/** Landing page: a welcome and a nudge toward the category select below it. */
export const homePage: HelpPage = {
  id: HOME_PAGE_ID,
  authorization: 'normal',
  icon: HOME_ICON,

  name: (locale: SupportedLocale) => helpMessages(locale).home.name,
  description: (locale: SupportedLocale) =>
    helpMessages(locale).home.description,

  render(_state: HelpState, context: HelpRenderContext) {
    const t = helpMessages(context.locale).home;
    return createContainer('brand').add(
      new Text(`${HOME_ICON} ${t.title}`).title(),
      new Text(t.welcome),
    );
  },

  reduce: (state: HelpState) => state,
};
