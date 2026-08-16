import { hasRank } from '@/core/permissions/index.js';
import { reminderLimitForRank } from '@/core/repositories/index.js';
import type { NotBannedRank, SupportedLocale } from '@/core/types.js';
import type { Container } from '../../components/index.js';
import { createContainer, Separator, Text } from '../../components/index.js';
import { lang } from '../../lang/index.js';
import { md } from '../../theme/markdown.js';
import { rankIcons } from '../../theme/icons.js';

/**
 * Renders the `rank` command's answer: the caller's rank, its icon and level,
 * then every rank-gated perk, struck through when the rank does not grant it.
 */
export function buildRankContainer(
  language: SupportedLocale,
  userRank: NotBannedRank,
  userRankLevel: number,
): Container {
  const messages = lang[language].commandRank.messages;

  /** The rank-gated perks in display order, labels resolved from the lang. */
  const perkEntries: { rank: NotBannedRank; label: string }[] = [
    { rank: 'privileged', label: messages.perks.materials },
    { rank: 'privileged', label: messages.perks.upgrades },
    { rank: 'privileged', label: messages.perks.recipeDiscovery },
    {
      rank: 'privileged',
      label: messages.perks.reminders(
        reminderLimitForRank('privileged'),
        reminderLimitForRank('normal'),
      ),
    },
    { rank: 'owner', label: messages.perks.remindersUnlimited },
    { rank: 'owner', label: messages.perks.maintenanceAccess },
    { rank: 'owner', label: messages.perks.administration },
  ];

  const perks = new Text('');
  for (const { rank, label } of perkEntries) {
    perks.newLine(
      new Text(hasRank(userRank, rank) ? label : md.strikethrough(label)).icon(
        rankIcons[rank],
      ),
    );
  }

  return createContainer('brand').add(
    new Text(messages.explanation),
    new Separator(),
    new Text(messages.userRank(userRank, rankIcons[userRank])).newLine(
      messages.rankLevel(userRankLevel),
    ),
    new Separator(),
    new Text(messages.perks.title).size('small'),
    perks,
  );
}
