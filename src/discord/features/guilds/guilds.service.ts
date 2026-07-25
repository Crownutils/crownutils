import type { Client, Guild } from 'discord.js';
import type { SupportedLocale } from '@/core/types.js';
import type { InteractiveMessage } from '@/discord/interactions/index.js';
import { clampPage, countPages } from '@/discord/utils/pagination.js';
import {
  buildGuildListContainer,
  GUILD_PAGE_SIZE,
  GUILDS_NEXT_ID,
  GUILDS_PREV_ID,
} from './guilds.ui.js';

/** One guild the bot is in, as the owner-facing listing shows it. */
export interface GuildEntry {
  readonly id: string;
  readonly name: string;
  readonly memberCount: number;
  /** When the bot joined; absent while a guild is unavailable and carries no join date. */
  readonly joinedAt: Date | undefined;
}

/** Everything the `guilds` listing shows: the totals, then every guild. */
export interface GuildOverview {
  readonly total: number;
  readonly totalMembers: number;
  readonly entries: readonly GuildEntry[];
}

function toEntry(guild: Guild): GuildEntry {
  return {
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    // An outage leaves a guild cached without a join timestamp; don't render an invalid date.
    joinedAt: Number.isFinite(guild.joinedTimestamp)
      ? guild.joinedAt
      : undefined,
  };
}

/**
 * Snapshots the client's guild cache, biggest guild first. With the `Guilds`
 * intent that cache holds every guild the bot is in, so no API call is needed;
 * member counts are the ones Discord sent with each guild.
 */
export function collectGuildOverview(client: Client): GuildOverview {
  const entries = client.guilds.cache
    .map(toEntry)
    .sort(
      (a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name),
    );

  return {
    total: entries.length,
    totalMembers: entries.reduce((sum, entry) => sum + entry.memberCount, 0),
    entries,
  };
}

/**
 * Builds the `guilds` listing controller: the overview is snapshotted by the
 * front, so the state is just the page shown and prev/next only move within it.
 */
export function createGuildListController(
  overview: GuildOverview,
  viewerId: string,
  locale: SupportedLocale,
): InteractiveMessage<number> {
  const pageCount = countPages(overview.entries.length, GUILD_PAGE_SIZE);

  return {
    initialState: 0,
    allowedIds: [viewerId],

    render(page, { disabled }) {
      return buildGuildListContainer(overview, page, locale, { disabled });
    },

    reduce(page, interaction) {
      if (!interaction.isButton()) return page;
      if (interaction.customId === GUILDS_PREV_ID) {
        return clampPage(page - 1, pageCount);
      }
      if (interaction.customId === GUILDS_NEXT_ID) {
        return clampPage(page + 1, pageCount);
      }
      return page;
    },
  };
}
