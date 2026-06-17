import { Select } from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import type { HelpRenderContext } from './page.js';

/**
 * Custom id of the shared navigation select menu. Intercepted by the router
 * so every page can embed it without duplicating the reduce logic.
 */
export const NAV_SELECT_ID = 'crownicles-help-nav';

/** Builds the navigation select present on every help page. */
export function buildNavSelect(ctx: HelpRenderContext): Select {
  const select = new Select(NAV_SELECT_ID).placeholder(
    lang.commands.crowniclesHelp.messages.home.navSelectPlaceholder,
  );
  for (const page of ctx.visiblePages) {
    select.option(page.name, page.id, page.description, page.icon);
  }
  if (ctx.disabled) select.disabled();
  return select;
}
