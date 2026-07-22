import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  type Container,
  createContainer,
  Text,
} from '@/discord/components/index.js';
import { icons } from '@/discord/theme/icons.js';
import { lang } from '@/discord/lang/index.js';

/** Custom ids of the confirmation buttons, matched in the delete-data controller's `reduce`. */
export const DELETE_DATA_CONFIRM_ID = 'delete-data-confirm';
export const DELETE_DATA_CANCEL_ID = 'delete-data-cancel';

function messages(locale: SupportedLocale) {
  return lang[locale].commandDeleteData.messages;
}

/** Confirmation card: what erasure removes and keeps, with confirm/cancel buttons. */
export function buildDeleteDataConfirmContainer(
  locale: SupportedLocale,
  options?: { disabled?: boolean },
): Container {
  const t = messages(locale);
  const confirm = new Button(DELETE_DATA_CONFIRM_ID)
    .color('danger')
    .label(t.confirmButton)
    .emoji(icons.trash);
  const cancel = new Button(DELETE_DATA_CANCEL_ID)
    .color('secondary')
    .label(t.cancelButton);
  if (options?.disabled === true) {
    confirm.disabled();
    cancel.disabled();
  }

  return createContainer('warn').add(
    new Text(`${icons.warning} ${t.title}`).title(),
    new Text(t.warning),
    new Text(t.willDelete).newLine(t.willKeep).size('subtle'),
    new ButtonActionRow().add(confirm, cancel),
  );
}

/** Success card shown after the data is erased. */
export function buildDeleteDataDoneContainer(
  locale: SupportedLocale,
): Container {
  const t = messages(locale);
  return createContainer('success').add(
    new Text(`${icons.success} ${t.doneTitle}`).title(),
    new Text(t.doneDescription),
  );
}

/** Card shown when the user cancels the deletion. */
export function buildDeleteDataCancelledContainer(
  locale: SupportedLocale,
): Container {
  const t = messages(locale);
  return createContainer('cancel').add(
    new Text(t.cancelledTitle).title(),
    new Text(t.cancelledDescription),
  );
}

/** Card shown when the bot holds no erasable data for the user. */
export function buildDeleteDataEmptyContainer(
  locale: SupportedLocale,
): Container {
  const t = messages(locale);
  return createContainer('brand').add(
    new Text(t.emptyTitle).title(),
    new Text(t.emptyDescription),
  );
}
