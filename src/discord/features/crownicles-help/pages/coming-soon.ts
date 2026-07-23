import type { Authorization } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { createContainer, Text } from '@/discord/components/index.js';
import type { HelpPage } from '../page.js';
import { helpMessages } from '../crownicles-help.ui.js';

/** What a stub page needs: its router id, select identity and emote. */
export interface ComingSoonPageOptions {
  readonly id: string;
  readonly icon: string;
  /** Minimum rank required to see the page; defaults to everyone. */
  readonly authorization?: Authorization;
  readonly name: (locale: SupportedLocale) => string;
  readonly description: (locale: SupportedLocale) => string;
}

/**
 * A placeholder category page: it appears in the select like any other page,
 * but its body is only the shared "coming soon" line. Swap it for a real
 * `HelpPage` once the category is implemented.
 */
export function createComingSoonPage(options: ComingSoonPageOptions): HelpPage {
  return {
    id: options.id,
    authorization: options.authorization ?? 'normal',
    icon: options.icon,
    name: options.name,
    description: options.description,
    render: (_state, context) =>
      createContainer('brand').add(
        new Text(`${options.icon} ${options.name(context.locale)}`).title(),
        new Text(helpMessages(context.locale).comingSoon),
      ),
    reduce: (state) => state,
  };
}
