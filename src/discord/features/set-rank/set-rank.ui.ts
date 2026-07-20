import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../../components/index.js';
import { createContainer, Text } from '../../components/index.js';
import { lang } from '../../lang/index.js';

/** Confirmation shown once a user's rank has been changed. */
export function buildSetRankContainer(
  userMention: string,
  rank: string,
  language: SupportedLocale,
): Container {
  return createContainer('success').add(
    new Text(lang[language].commandSetRank.messages.success(userMention, rank)),
  );
}
