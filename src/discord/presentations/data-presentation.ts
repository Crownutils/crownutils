import type { UserDataSnapshot } from '@/core/legal/data-rights.js';
import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { relativeTimestamp } from '@/discord/timestamps.js';
import { truncate } from '@/discord/truncate.js';

const MESSAGE_PREVIEW_LENGTH = 120;

const d = lang.commands.data.messages;

/** One-line, length-capped preview of a reminder message. */
function preview(message: string): string {
  return truncate(message.replace(/\s+/g, ' ').trim(), MESSAGE_PREVIEW_LENGTH);
}

/** Refusal shown when the user requested their data within the cooldown window. */
export function buildDataCooldownContainer(nextEligibleAt: Date): Container {
  return new Container()
    .color('warning')
    .add(new Text(d.cooldown({ when: relativeTimestamp(nextEligibleAt) })));
}

/** Options controlling whose data is shown and how. */
export interface DataViewOptions {
  /** Mention of the target user when an owner inspects someone else's data. */
  mention?: string;
  /** Whether the target is exempt from accepting the legal documents (owner). */
  exempt?: boolean;
}

/** Renders the data-access export: every stored item grouped by category. */
export function buildDataContainer(
  snapshot: UserDataSnapshot,
  options: DataViewOptions = {},
): Container {
  const { mention, exempt = false } = options;

  const container = new Container()
    .color('info')
    .add(
      new Title(
        mention === undefined ? d.title : d.titleOther({ user: mention }),
      ),
      new Text(mention === undefined ? d.intro : d.introOther).size('subtle'),
      new Separator(),
    );

  const hasData =
    exempt ||
    snapshot.reminders.length > 0 ||
    snapshot.pathfinderUsage !== null ||
    snapshot.readMailIds.length > 0 ||
    snapshot.mailNotice !== null ||
    snapshot.legalAcceptance !== null;

  if (!hasData) {
    return container.add(
      new Text(mention === undefined ? d.empty : d.emptyOther),
    );
  }

  const legalText = exempt
    ? d.legal.exempt
    : snapshot.legalAcceptance
      ? d.legal.accepted({
          version: snapshot.legalAcceptance.acceptedVersion,
          when: relativeTimestamp(snapshot.legalAcceptance.acceptedAt),
        })
      : d.legal.none;
  container.add(new Title(d.legal.title, 'small'), new Text(legalText));

  container.add(new Separator(), new Title(d.reminders.title, 'small'));
  if (snapshot.reminders.length === 0) {
    container.add(new Text(d.reminders.none));
  } else {
    const reminders = new Text(
      d.reminders.summary({ count: snapshot.reminders.length }),
    );
    for (const reminder of snapshot.reminders) {
      reminders.newLine(
        d.reminders.item({
          when: relativeTimestamp(reminder.triggerAt),
          message: preview(reminder.message),
        }),
      );
    }
    container.add(reminders);
  }

  container.add(
    new Separator(),
    new Title(d.pathfinder.title, 'small'),
    new Text(
      snapshot.pathfinderUsage
        ? d.pathfinder.last({
            when: relativeTimestamp(snapshot.pathfinderUsage.lastUsedAt),
          })
        : d.pathfinder.none,
    ),
  );

  container.add(new Separator(), new Title(d.mails.title, 'small'));
  if (snapshot.readMailIds.length === 0 && snapshot.mailNotice === null) {
    container.add(new Text(d.mails.none));
  } else {
    const mails = new Text(
      d.mails.read({ count: snapshot.readMailIds.length }),
    );
    if (snapshot.mailNotice) {
      mails.newLine(
        d.mails.notice({
          when: relativeTimestamp(snapshot.mailNotice.lastNotifiedAt),
        }),
      );
    }
    container.add(mails);
  }

  if (snapshot.dataAccessUsage) {
    container.add(
      new Separator(),
      new Title(d.dataAccess.title, 'small'),
      new Text(
        d.dataAccess.last({
          when: relativeTimestamp(snapshot.dataAccessUsage.lastRequestedAt),
        }),
      ),
    );
  }

  if (mention === undefined) {
    container.add(new Separator(), new Text(d.footer).size('subtle'));
  }
  return container;
}
