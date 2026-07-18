import { time, TimestampStyles } from 'discord.js';
import type { ActiveReminder } from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  createContainer,
  Section,
  Text,
} from '../../components/index.js';
import type { Container, TopLevelComponent } from '../../components/index.js';
import { icons } from '../../theme/icons.js';
import { lang } from '../../lang/index.js';

const CANCEL_PREFIX = 'reminder-cancel:';
const DELETE_PREFIX = 'reminder-delete:';
const RELAUNCH_ID = 'reminder-relaunch';

/** Whether a clicked button is the triggered card's relaunch button. */
export function isReminderRelaunchButton(customId: string): boolean {
  return customId === RELAUNCH_ID;
}

/** Reminder id from a cancel button's custom id, or `null`. */
export function parseReminderCancelButtonId(customId: string): string | null {
  return customId.startsWith(CANCEL_PREFIX)
    ? customId.slice(CANCEL_PREFIX.length)
    : null;
}

/** Reminder id from a delete button's custom id, or `null`. */
export function parseReminderDeleteButtonId(customId: string): string | null {
  return customId.startsWith(DELETE_PREFIX)
    ? customId.slice(DELETE_PREFIX.length)
    : null;
}

function relative(date: Date): string {
  return time(date, TimestampStyles.RelativeTime);
}

/** Confirmation card with a cancel button; `disabled` once the cancel window closes. */
export function buildReminderCreatedContainer(
  reminder: ActiveReminder,
  locale: SupportedLocale,
  options?: { disabled?: boolean },
): Container {
  const t = lang[locale].commandRemind.messages;
  const cancel = new Button(`${CANCEL_PREFIX}${reminder.id}`)
    .color('danger')
    .label(t.created.cancelButton);
  if (options?.disabled === true) cancel.disabled();

  return createContainer('success').add(
    new Text(t.created.title).title(),
    new Section()
      .add(
        new Text(
          t.created.description(reminder.content, relative(reminder.dueAt)),
        ),
      )
      .button(cancel),
  );
}

/** Card shown after a reminder is cancelled. */
export function buildReminderCancelledContainer(
  content: string,
  locale: SupportedLocale,
): Container {
  const t = lang[locale].commandRemind.messages;
  return createContainer('cancel').add(
    new Text(t.cancelled.title).title(),
    new Text(t.cancelled.description(content)),
  );
}

/**
 * The "DRING!" message when a reminder fires, as an ordered list of top-level
 * components: the author mention, the card, then the relaunch row below it.
 * `disabled` greys the relaunch button once the window closes.
 */
export function buildReminderTriggeredComponents(
  content: string,
  userId: string,
  locale: SupportedLocale,
  options?: { disabled?: boolean },
): TopLevelComponent[] {
  const t = lang[locale].commandRemind.messages;
  const relaunch = new Button(RELAUNCH_ID)
    .color('secondary')
    .label(t.triggered.relaunchButton)
    .emoji(icons.relaunch);
  if (options?.disabled === true) relaunch.disabled();

  return [
    createContainer('brand').add(
      new Text(content),
      new Text(`<@${userId}>`).size('subtle'),
    ),
    new ButtonActionRow().add(relaunch),
  ];
}

/** `reminders` list: a Section + delete button per reminder, or an empty-state notice. */
export function buildReminderListContainer(
  reminders: readonly ActiveReminder[],
  locale: SupportedLocale,
  options?: { disabled?: boolean },
): Container {
  const t = lang[locale].commandReminders.messages;
  if (reminders.length === 0) {
    return createContainer('brand').add(new Text(t.empty));
  }

  const container = createContainer('brand').add(new Text(t.title).title());
  for (const reminder of reminders) {
    const remove = new Button(`${DELETE_PREFIX}${reminder.id}`)
      .color('danger')
      .emoji(icons.trash);
    if (options?.disabled === true) remove.disabled();

    container.add(
      new Section()
        .add(new Text(t.item(reminder.content, relative(reminder.dueAt))))
        .button(remove),
    );
  }
  return container;
}
