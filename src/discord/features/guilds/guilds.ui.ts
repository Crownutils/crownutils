import { time, TimestampStyles } from 'discord.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  type Container,
  createContainer,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import { commandMessages } from '@/discord/lang/index.js';
import { formatNumber } from '@/discord/lang/number.js';
import {
  appendPaginationControls,
  paginate,
} from '@/discord/utils/pagination.js';
import type { GuildEntry, GuildOverview } from './guilds.service.js';

/** Guilds listed per page; each takes two lines, so this stays a readable card. */
export const GUILD_PAGE_SIZE = 10;

/** Custom ids of the listing's pagination buttons, matched in its controller. */
export const GUILDS_PREV_ID = 'guilds-prev';
export const GUILDS_NEXT_ID = 'guilds-next';

/** One guild as its name, then a subtle line of id, member count and join date. */
function appendEntry(
  container: Container,
  entry: GuildEntry,
  locale: SupportedLocale,
): void {
  const t = commandMessages(locale, 'commandGuilds');
  const facts = [
    md.code(entry.id),
    `${icons.users} ${formatNumber(locale, entry.memberCount)}`,
  ];
  if (entry.joinedAt) {
    facts.push(t.joined(time(entry.joinedAt, TimestampStyles.ShortDate)));
  }

  container.add(
    new Text(md.bold(entry.name)).newLine(
      new Text(facts.join(' | ')).size('subtle'),
    ),
  );
}

/** The `guilds` listing: totals, one page of guilds, then the pagination controls. */
export function buildGuildListContainer(
  overview: GuildOverview,
  requestedPage: number,
  locale: SupportedLocale,
  options: { readonly disabled: boolean },
): Container {
  const t = commandMessages(locale, 'commandGuilds');
  const container = createContainer('brand').add(
    new Text(`${icons.guild} ${t.title}`).title(),
  );

  if (overview.entries.length === 0) {
    return container.add(new Text(t.empty));
  }

  container.add(
    new Text(
      t.summary(
        formatNumber(locale, overview.total),
        formatNumber(locale, overview.totalMembers),
      ),
    ).size('subtle'),
    new Separator(),
  );

  const { page, pageCount, slice } = paginate(
    overview.entries,
    requestedPage,
    GUILD_PAGE_SIZE,
  );
  for (const entry of slice) appendEntry(container, entry, locale);

  appendPaginationControls(container, {
    page,
    pageCount,
    prevId: GUILDS_PREV_ID,
    nextId: GUILDS_NEXT_ID,
    indicator: t.pageIndicator,
    previousLabel: t.previous,
    nextLabel: t.next,
    disabled: options.disabled,
  });

  return container;
}
