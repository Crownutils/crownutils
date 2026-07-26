import { AttachmentBuilder } from 'discord.js';
import { config } from '@/core/config/index.js';
import type { GdprExport, GdprReminder } from '@/core/repositories/index.js';
import { LEGAL_VERSION } from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { commandMessages } from '@/discord/lang/index.js';

/**
 * Schema version of the JSON export. Bump it whenever the shape changes, so a
 * downloaded file always says how it should be read.
 */
const EXPORT_FORMAT_VERSION = '1.0';

/** The attachments a data export ships, with the names their file components must point at. */
export interface GdprExportFiles {
  readonly attachments: readonly AttachmentBuilder[];
  readonly names: readonly string[];
}

/** `YYYY-MM-DD` in UTC, for a filename that sorts and never depends on the reader's locale. */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Long, localized date and time, as the readable document spells dates out. */
function longDate(locale: SupportedLocale, date: Date): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * The portable payload (GDPR art. 20): stored values only, untranslated and
 * with ISO 8601 timestamps, so another service can ingest it as-is. Absent data
 * stays `null` rather than being dropped, so the file states what is *not* held
 * as clearly as what is.
 */
function toJsonPayload(gdprExport: GdprExport, generatedAt: Date): unknown {
  return {
    export: {
      formatVersion: EXPORT_FORMAT_VERSION,
      generatedAt: generatedAt.toISOString(),
      controller: 'Crownutils',
      controllerUrl: config.legalUrl,
      subjectDiscordId: gdprExport.userId,
    },
    data: {
      discordId: gdprExport.userId,
      language: gdprExport.language,
      rank: gdprExport.rank,
      legalAcceptance: gdprExport.legalAcceptance
        ? {
            acceptedVersion: gdprExport.legalAcceptance.acceptedVersion,
            acceptedAt: gdprExport.legalAcceptance.acceptedAt.toISOString(),
          }
        : null,
      banHashStored: gdprExport.hasBanHash,
      reminders: gdprExport.reminders.map((reminder) => ({
        content: reminder.content,
        status: reminder.status,
        dueAt: reminder.dueAt.toISOString(),
        createdAt: reminder.createdAt.toISOString(),
      })),
    },
  };
}

/** One reminder as a readable bullet: its text, state, due date and creation date. */
function markdownReminder(
  reminder: GdprReminder,
  locale: SupportedLocale,
): string {
  const t = commandMessages(locale, 'commandData').document;
  return `- ${t.reminderItem(
    reminder.content,
    t.reminderStatus[reminder.status],
    longDate(locale, reminder.dueAt),
    longDate(locale, reminder.createdAt),
  )}`;
}

/**
 * The readable document (GDPR art. 12 and 15): the same facts in plain,
 * localized language, plus what each field is for and how to exercise the
 * rights that apply to it.
 */
function toMarkdownDocument(
  gdprExport: GdprExport,
  locale: SupportedLocale,
  generatedAt: Date,
): string {
  const t = commandMessages(locale, 'commandData').document;

  const legalValue = gdprExport.legalAcceptance
    ? t.legalAcceptedValue(
        gdprExport.legalAcceptance.acceptedVersion,
        longDate(locale, gdprExport.legalAcceptance.acceptedAt),
      )
    : t.legalNotAcceptedValue;

  const lines = [
    `# ${t.title}`,
    '',
    t.generatedAt(longDate(locale, generatedAt), config.legalUrl),
    '',
    `## ${t.storedSection}`,
    '',
    `- ${t.field(t.discordIdLabel, gdprExport.userId)}`,
    `- ${t.field(t.languageLabel, gdprExport.language ?? t.notStored)}`,
    `- ${t.field(t.rankLabel, gdprExport.rank ?? t.notStored)}`,
    `- ${t.field(t.legalLabel, legalValue)}`,
    `- ${t.field(
      t.banHashLabel,
      gdprExport.hasBanHash ? t.banHashPresentValue : t.banHashAbsentValue,
    )}`,
    '',
    `## ${t.remindersSection}`,
    '',
    ...(gdprExport.reminders.length === 0
      ? [t.remindersNone]
      : gdprExport.reminders.map((reminder) =>
          markdownReminder(reminder, locale),
        )),
    '',
    `## ${t.rightsSection}`,
    '',
    t.rightsIntro,
    '',
    `- ${t.rights.access}`,
    `- ${t.rights.rectification}`,
    `- ${t.rights.erasure}`,
    `- ${t.rights.portability}`,
    '',
    t.rightsContact(config.legalUrl),
    '',
    `## ${t.retentionSection}`,
    '',
    t.retentionBody(LEGAL_VERSION),
    '',
    `---`,
    '',
    t.jsonNote,
  ];

  return `${lines.join('\n')}\n`;
}

/**
 * Builds the two files a data export ships: a JSON copy for portability and a
 * localized Markdown document for reading. Both are named after the subject and
 * the export day, so a user keeping several exports can tell them apart.
 */
export function buildGdprExportFiles(
  gdprExport: GdprExport,
  locale: SupportedLocale,
  generatedAt: Date = new Date(),
): GdprExportFiles {
  const base = `crownutils-data-${gdprExport.userId}-${isoDay(generatedAt)}`;
  const documents = [
    {
      name: `${base}.md`,
      content: toMarkdownDocument(gdprExport, locale, generatedAt),
    },
    {
      name: `${base}.json`,
      content: JSON.stringify(toJsonPayload(gdprExport, generatedAt), null, 2),
    },
  ];

  return {
    names: documents.map((document) => document.name),
    attachments: documents.map(
      (document) =>
        new AttachmentBuilder(Buffer.from(document.content, 'utf8'), {
          name: document.name,
        }),
    ),
  };
}
