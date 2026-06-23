import type { UserDataSnapshot } from '@/core/legal/data-rights.js';
import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { relativeTimestamp } from '@/discord/timestamps.js';

const MESSAGE_PREVIEW_LENGTH = 120;

const d = lang.commands.data.messages;

/** One-line, length-capped preview of a reminder message. */
function preview(message: string): string {
  const flat = message.replace(/\s+/g, ' ').trim();
  return flat.length > MESSAGE_PREVIEW_LENGTH
    ? `${flat.slice(0, MESSAGE_PREVIEW_LENGTH)}…`
    : flat;
}

/** Refusal shown when the user requested their data within the cooldown window. */
export function buildDataCooldownContainer(nextEligibleAt: Date): Container {
  return new Container()
    .color('warning')
    .add(new Text(d.cooldown({ when: relativeTimestamp(nextEligibleAt) })));
}

/** Renders the data-access export: every stored item grouped by category. */
export function buildDataContainer(snapshot: UserDataSnapshot): Container {
  const container = new Container()
    .color('info')
    .add(new Title(d.title), new Text(d.intro).size('subtle'), new Separator());

  const hasData =
    snapshot.reminders.length > 0 ||
    snapshot.pathfinderUsage !== null ||
    snapshot.readMailIds.length > 0 ||
    snapshot.mailNotice !== null ||
    snapshot.legalAcceptance !== null;

  if (!hasData) {
    return container.add(new Text(d.empty));
  }

  container.add(
    new Title(d.legal.title, 'small'),
    new Text(
      snapshot.legalAcceptance
        ? d.legal.accepted({
            version: snapshot.legalAcceptance.acceptedVersion,
            when: relativeTimestamp(snapshot.legalAcceptance.acceptedAt),
          })
        : d.legal.none,
    ),
  );

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

  return container.add(new Separator(), new Text(d.footer).size('subtle'));
}
