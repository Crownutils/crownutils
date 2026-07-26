import { time, TimestampStyles } from 'discord.js';
import { RANK } from '@/core/types.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  type Container,
  createContainer,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { icons, rankIcons, withIcon } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import { commandMessages } from '@/discord/lang/index.js';
import { formatNumber } from '@/discord/lang/number.js';
import {
  appendPaginationControls,
  paginate,
} from '@/discord/utils/pagination.js';
import type { UserCensus, UserEntry, UsersState } from './users.service.js';

/** Users listed per page; keeps the card well inside Discord's text limits. */
export const USER_PAGE_SIZE = 10;

/** Custom ids of the listing's pagination buttons, matched in its controller. */
export const USERS_PREV_ID = 'users-prev';
export const USERS_NEXT_ID = 'users-next';

/** Per-rank tallies, highest rank first, skipping the ranks nobody holds. */
function rankBreakdown(census: UserCensus, locale: SupportedLocale): string {
  return [...RANK]
    .reverse()
    .filter((rank) => census.byRank[rank] > 0)
    .map((rank) =>
      withIcon(rankIcons[rank], formatNumber(locale, census.byRank[rank])),
    )
    .join(' | ');
}

/**
 * One user as a single line: rank emote, id, username, language and
 * registration date. The username is dropped when Discord could not resolve the
 * account, leaving the id as the only handle on that user.
 */
function formatEntry(
  entry: UserEntry,
  username: string | undefined,
  locale: SupportedLocale,
): string {
  const t = commandMessages(locale, 'commandUsers');
  const parts = [withIcon(rankIcons[entry.rank], md.code(entry.userId))];
  if (username !== undefined) parts.push(md.bold(username));
  parts.push(entry.language);
  parts.push(
    entry.registeredAt
      ? time(entry.registeredAt, TimestampStyles.ShortDate)
      : t.notRegistered,
  );
  return parts.join(' - ');
}

/** The `users` listing: totals, one page of users, then the pagination controls. */
export function buildUserListContainer(
  census: UserCensus,
  state: UsersState,
  locale: SupportedLocale,
  options: { readonly disabled: boolean },
): Container {
  const t = commandMessages(locale, 'commandUsers');
  const container = createContainer('brand').add(
    new Text(t.title).icon(icons.users).title(),
  );

  if (census.entries.length === 0) {
    return container.add(new Text(t.empty));
  }

  container.add(
    new Text(
      `${t.total(formatNumber(locale, census.total))} | ${rankBreakdown(census, locale)}`,
    ).size('subtle'),
    new Separator(),
  );

  const { page, pageCount, slice } = paginate(
    census.entries,
    state.page,
    USER_PAGE_SIZE,
  );
  const list = new Text('');
  for (const entry of slice) {
    list.newLine(formatEntry(entry, state.usernames.get(entry.userId), locale));
  }
  container.add(list);

  if (census.truncated) {
    container
      .add(new Separator())
      .add(
        new Text(t.truncated(formatNumber(locale, census.entries.length))).size(
          'subtle',
        ),
      );
  }

  appendPaginationControls(container, {
    page,
    pageCount,
    prevId: USERS_PREV_ID,
    nextId: USERS_NEXT_ID,
    indicator: t.pageIndicator,
    previousLabel: t.previous,
    nextLabel: t.next,
    disabled: options.disabled,
  });

  return container;
}
