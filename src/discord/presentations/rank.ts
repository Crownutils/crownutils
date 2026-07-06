import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../components/index.js';
import { createContainer, Separator, Text } from '../components/index.js';
import { lang } from '../lang/index.js';
import type { NotBannedRank, Rank } from '@/core/permissions/index.js';

const RANK_ICON = {
  normal: '👤',
  privileged: '🎟️',
  owner: '👑',
} satisfies Record<NotBannedRank, string>;

export function buildRankContainer(
  language: SupportedLocale,
  userRank: NotBannedRank,
  userRankLevel: number,
): Container {
  const messages = lang[language].commandRank.messages;
  return createContainer('brand').add(
    new Text(messages.explanation),
    new Separator(),
    new Text(messages.userRank(userRank, RANK_ICON[userRank])).newLine(
      messages.rankLevel(userRankLevel),
    ),
  );
}
