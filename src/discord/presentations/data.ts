import type { GdprExport } from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../components/index.js';
import { createContainer, Separator, Text } from '../components/index.js';
import { lang } from '../lang/index.js';

function formatDate(language: SupportedLocale, date: Date): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

/** Renders the `data` command's answer: everything the bot holds about the requester. */
export function buildDataContainer(
  language: SupportedLocale,
  gdprExport: GdprExport,
): Container {
  const messages = lang[language].commandData.messages;

  const legalLine = gdprExport.legalAcceptance
    ? messages.legalAccepted(
        gdprExport.legalAcceptance.acceptedVersion,
        formatDate(language, gdprExport.legalAcceptance.acceptedAt),
      )
    : messages.legalNotAccepted;

  return createContainer('brand').add(
    new Text(messages.title).title(),
    new Text(messages.intro).size('subtle'),
    new Separator(),
    new Text(messages.discordId(gdprExport.userId))
      .newLine(messages.language(gdprExport.language))
      .newLine(messages.rank(gdprExport.rank))
      .newLine(legalLine)
      .newLine(
        gdprExport.hasBanHash
          ? messages.banHashPresent
          : messages.banHashAbsent,
      ),
  );
}

/** Shown when a user hits the GDPR access-request cooldown. */
export function buildDataCooldownContainer(
  language: SupportedLocale,
  eligibleAt: Date,
): Container {
  const messages = lang[language].commandData.messages;
  return createContainer('warn').add(
    new Text(messages.cooldownDenied(formatDate(language, eligibleAt))),
  );
}
