import type { GdprExport } from '@/core/repositories/index.js';
import { isGdprExportEmpty } from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../../components/index.js';
import {
  createContainer,
  FileDisplay,
  Separator,
  Text,
  UserSelectActionRow,
  UserSelectMenu,
} from '../../components/index.js';
import { icons } from '../../theme/icons.js';
import { lang } from '../../lang/index.js';

const DATA_LOOKUP_SELECT_ID = 'data-lookup-select';

function formatDate(language: SupportedLocale, date: Date): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Renders the `data` command's answer: a short notice pointing at the attached
 * export, or a single line if nothing is stored at all - reachable since `data`
 * is exempt from the legal gate, so a never-registered user can run it. The
 * data itself lives in the files, which is what a GDPR access request owes.
 */
export function buildDataContainer(
  language: SupportedLocale,
  gdprExport: GdprExport,
  fileNames: readonly string[],
): Container {
  const messages = lang[language].commandData.messages;

  if (isGdprExportEmpty(gdprExport)) {
    return createContainer('brand').add(
      new Text(messages.title).icon(icons.shield).title(),
      new Separator(),
      new Text(messages.noDataStored),
    );
  }

  const container = createContainer('brand').add(
    new Text(messages.title).icon(icons.shield).title(),
    new Text(messages.attachedIntro),
    new Text(messages.attachedReadable)
      .size('subtle')
      .newLine(new Text(messages.attachedPortable).size('subtle')),
    new Separator(),
  );

  for (const name of fileNames) container.add(new FileDisplay(name));
  return container;
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
