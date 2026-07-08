import type { GdprExport } from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../../components/index.js';
import {
  createContainer,
  Separator,
  Text,
  UserSelectActionRow,
  UserSelectMenu,
} from '../../components/index.js';
import { lang } from '../../lang/index.js';

const DATA_LOOKUP_SELECT_ID = 'data-lookup-select';

function formatDate(language: SupportedLocale, date: Date): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

/** Whether nothing at all is stored: no `User` row, no legal acceptance, no ban hash. */
function hasNoStoredData(gdprExport: GdprExport): boolean {
  return (
    gdprExport.language === null &&
    gdprExport.rank === null &&
    gdprExport.legalAcceptance === null &&
    !gdprExport.hasBanHash
  );
}

/**
 * Renders the `data` command's answer: everything the bot holds about the
 * requester, or a single notice if nothing is stored at all - reachable since
 * `data` is exempt from the legal gate, so a never-registered user can run it.
 */
export function buildDataContainer(
  language: SupportedLocale,
  gdprExport: GdprExport,
): Container {
  const messages = lang[language].commandData.messages;

  if (hasNoStoredData(gdprExport)) {
    return createContainer('brand').add(
      new Text(messages.title).title(),
      new Separator(),
      new Text(messages.noDataStored),
    );
  }

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
      .newLine(messages.language(gdprExport.language ?? messages.notStored))
      .newLine(messages.rank(gdprExport.rank ?? messages.notStored))
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

/** Owner-only picker shown by the prefix front when `data` is run with no target. */
export function buildDataLookupPickerContainer(
  language: SupportedLocale,
  disabled: boolean,
): Container {
  const messages = lang[language].commandData.messages;
  return createContainer('brand').add(
    new Text(messages.lookupPrompt),
    new UserSelectActionRow().set(
      new UserSelectMenu(DATA_LOOKUP_SELECT_ID)
        .placeholder(messages.lookupPlaceholder)
        .disabled(disabled),
    ),
  );
}
