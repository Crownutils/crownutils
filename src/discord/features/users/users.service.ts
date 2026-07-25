import type { Client } from 'discord.js';
import type { Rank, SupportedLocale } from '@/core/types.js';
import {
  countUsers,
  countUsersByRank,
  listLegalAcceptanceDates,
  listUsers,
} from '@/core/repositories/index.js';
import type { InteractiveMessage } from '@/discord/interactions/index.js';
import { clampPage, countPages, paginate } from '@/discord/utils/pagination.js';
import {
  buildUserListContainer,
  USER_PAGE_SIZE,
  USERS_NEXT_ID,
  USERS_PREV_ID,
} from './users.ui.js';

/** One stored user, as the owner-facing listing shows them. */
export interface UserEntry {
  readonly userId: string;
  readonly rank: Rank;
  readonly language: SupportedLocale;
  /** When they accepted the legal documents; absent for a row created without registering. */
  readonly registeredAt: Date | undefined;
}

/** Everything the `users` listing shows: the totals, then the (possibly capped) rows. */
export interface UserCensus {
  readonly total: number;
  readonly byRank: Readonly<Record<Rank, number>>;
  readonly entries: readonly UserEntry[];
  /** True when more users are stored than the repository's listing cap returns. */
  readonly truncated: boolean;
}

/** The listing's state: the page shown, and every username resolved so far. */
export interface UsersState {
  readonly page: number;
  readonly usernames: ReadonlyMap<string, string>;
}

/** Reads the whole user census in one go: the totals, the listed rows, and each row's registration date. */
export async function loadUserCensus(): Promise<UserCensus> {
  const [total, byRank, users, registrationDates] = await Promise.all([
    countUsers(),
    countUsersByRank(),
    listUsers(),
    listLegalAcceptanceDates(),
  ]);

  return {
    total,
    byRank,
    truncated: total > users.length,
    entries: users.map((user) => ({
      userId: user.userId,
      rank: user.rank,
      language: user.language,
      registeredAt: registrationDates.get(user.userId),
    })),
  };
}

/** The user ids shown on `page` - the only ones a render needs a username for. */
function idsOnPage(census: UserCensus, page: number): string[] {
  return paginate(census.entries, page, USER_PAGE_SIZE).slice.map(
    (entry) => entry.userId,
  );
}

/**
 * Usernames for `ids`, merged into the ones `known` already holds. Only the
 * missing ids are fetched - and only ever one page's worth, since resolving the
 * whole census would cost an API call per stored user. Discord's own cache
 * absorbs the repeats, and an id it can no longer resolve (deleted account) is
 * simply left out, so the listing falls back to showing the raw id.
 */
async function resolveUsernames(
  client: Client,
  ids: readonly string[],
  known: ReadonlyMap<string, string>,
): Promise<ReadonlyMap<string, string>> {
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length === 0) return known;

  const fetched = await Promise.all(
    missing.map(async (id) => {
      const user = await client.users.fetch(id).catch(() => undefined);
      return user === undefined ? undefined : ([id, user.username] as const);
    }),
  );

  const resolved = new Map(known);
  for (const entry of fetched) {
    if (entry !== undefined) resolved.set(entry[0], entry[1]);
  }
  return resolved;
}

/**
 * Builds the `users` listing controller, with the first page's usernames already
 * resolved. The census itself is read once by the front, so paging only moves
 * within that snapshot; a stale page is one re-run away and never blocks the owner.
 */
export async function createUserListController(
  census: UserCensus,
  viewerId: string,
  locale: SupportedLocale,
  client: Client,
): Promise<InteractiveMessage<UsersState>> {
  const pageCount = countPages(census.entries.length, USER_PAGE_SIZE);
  const usernames = await resolveUsernames(
    client,
    idsOnPage(census, 0),
    new Map(),
  );

  /** Moves to `page`, resolving the usernames it introduces before it renders. */
  const goTo = async (
    state: UsersState,
    page: number,
  ): Promise<UsersState> => ({
    page,
    usernames: await resolveUsernames(
      client,
      idsOnPage(census, page),
      state.usernames,
    ),
  });

  return {
    initialState: { page: 0, usernames },
    allowedIds: [viewerId],

    render(state, { disabled }) {
      return buildUserListContainer(census, state, locale, { disabled });
    },

    async reduce(state, interaction) {
      if (!interaction.isButton()) return state;
      if (interaction.customId === USERS_PREV_ID) {
        return goTo(state, clampPage(state.page - 1, pageCount));
      }
      if (interaction.customId === USERS_NEXT_ID) {
        return goTo(state, clampPage(state.page + 1, pageCount));
      }
      return state;
    },
  };
}
