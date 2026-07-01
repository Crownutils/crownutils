import type { Message } from 'discord.js';
import type { Mail } from '@/core/persistence/prisma/client.js';
import { markMailRead } from '@/core/mails/mail-repository.js';
import {
  ActionRow,
  Button,
  Container,
  Modal,
  Select,
  Separator,
  Text,
  TextInput,
  Title,
} from '@/discord/components/index.js';
import { icons } from '@/discord/icons.js';
import {
  COLLECTOR_IDLE_MS,
  InteractiveMessage,
} from '@/discord/interactions/collector.js';
import { lang } from '@/discord/lang/index.js';
import { md } from '@/discord/markdown.js';
import { relativeTimestamp } from '@/discord/timestamps.js';

const MAILS_PER_PAGE = 5;
const PREVIEW_LENGTH = 140;

/** Custom ids of the `/mail` modal and its fields, shared with the command handler. */
export const MAIL_MODAL_ID = 'mail-modal';
export const MAIL_TITLE_INPUT_ID = 'mail-title';
export const MAIL_BODY_INPUT_ID = 'mail-body';

const MAIL_SELECT_ID = 'mails-select';
const PREV_BUTTON_ID = 'mails-prev';
const NEXT_BUTTON_ID = 'mails-next';
const BACK_BUTTON_ID = 'mails-back';

const mailLang = lang.commands.mail.messages;
const mailsLang = lang.commands.mails.messages;

/** Navigation state of the `/mails` inbox viewer. */
export interface MailsViewState {
  page: number;
  openMailId?: string;
  readIds: Set<string>;
}

/** Modal used by `/mail` to compose a rich announcement. */
export function buildMailModal(): Modal {
  return new Modal(MAIL_MODAL_ID, mailLang.modalTitle).add(
    new TextInput(MAIL_TITLE_INPUT_ID, mailLang.titleLabel)
      .required(false)
      .placeholder(mailLang.titlePlaceholder)
      .maxLength(100),
    new TextInput(MAIL_BODY_INPUT_ID, mailLang.bodyLabel)
      .paragraph()
      .required(true)
      .placeholder(mailLang.bodyPlaceholder)
      .maxLength(4000),
  );
}

/** Confirmation shown after a mail is published. */
export function buildMailSentContainer(): Container {
  return new Container().color('success').add(new Text(mailLang.sent));
}

/** In-channel reminder that `count` unread mails await the user. */
export function buildUnreadNoticeContainer(count: number): Container {
  return new Container()
    .color('info')
    .add(new Text(mailsLang.unreadNotice({ count })));
}

/** Exact `DD/MM/YYYY HH:MM UTC` timestamp, for plain-text select descriptions. */
function utcDateTime(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()} ${hours}:${minutes} UTC`;
}

function mailTitle(mail: Mail): string {
  return mail.title ?? mailsLang.noTitle;
}

/**
 * Strips Markdown to plain text so a preview never renders as a heading, list,
 * or formatted block. Handles the common syntax (headings, emphasis, code,
 * lists, quotes, links) — good enough for a short excerpt.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // headings
    .replace(/^\s*>\s?/gm, '') // block quotes
    .replace(/^\s*[-*+]\s+/gm, '') // unordered lists
    .replace(/^\s*\d+\.\s+/gm, '') // ordered lists
    .replace(/^\s*[-*_]{3,}\s*$/gm, ' ') // horizontal rules
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> label
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, '$2') // bold/italic/strikethrough
    .replace(/\s+/g, ' ')
    .trim();
}

/** One-line plain-text body excerpt for the inbox preview. */
function mailExcerpt(body: string): string {
  const flat = stripMarkdown(body);
  return flat.length > PREVIEW_LENGTH
    ? `${flat.slice(0, PREVIEW_LENGTH)}…`
    : flat;
}

/** Inbox preview block for one mail: read marker, title, date, excerpt. */
function mailPreview(mail: Mail, read: boolean): string {
  const marker = read ? icons.mailboxRead : icons.mailbox;
  return [
    `${marker} ${md.bold(mailTitle(mail))} - ${relativeTimestamp(mail.createdAt)}`,
    mailExcerpt(mail.body),
  ].join('\n');
}

function renderDetail(mail: Mail, disabled: boolean): Container {
  const back = new Button(BACK_BUTTON_ID)
    .label(mailsLang.back)
    .color('secondary')
    .emoji(icons.forward);
  if (disabled) back.disabled();

  return new Container()
    .color('info')
    .add(
      new Title(mailTitle(mail)),
      new Separator(),
      new Text(mail.body),
      new Separator(),
      new Text(
        mailsLang.sentAt({ when: relativeTimestamp(mail.createdAt) }),
      ).size('subtle'),
      new ActionRow(back),
    );
}

function renderList(
  mails: readonly Mail[],
  state: MailsViewState,
  disabled: boolean,
): Container {
  const container = new Container()
    .color('info')
    .add(new Title(mailsLang.inboxTitle), new Separator());

  if (mails.length === 0) {
    return container.add(new Text(mailsLang.empty).size('subtle'));
  }

  const pageCount = Math.ceil(mails.length / MAILS_PER_PAGE);
  const page = Math.min(Math.max(state.page, 0), pageCount - 1);
  const pageItems = mails.slice(
    page * MAILS_PER_PAGE,
    page * MAILS_PER_PAGE + MAILS_PER_PAGE,
  );

  pageItems.forEach((mail, index) => {
    if (index > 0) container.add(new Separator());
    container.add(new Text(mailPreview(mail, state.readIds.has(mail.id))));
  });
  container.add(new Separator());

  const select = new Select(MAIL_SELECT_ID).placeholder(
    mailsLang.selectPlaceholder,
  );
  for (const mail of pageItems) {
    select.option(
      mailTitle(mail),
      mail.id,
      utcDateTime(mail.createdAt),
      state.readIds.has(mail.id) ? icons.mailboxRead : icons.mailbox,
    );
  }
  if (disabled) select.disabled();
  container.add(select);

  if (pageCount > 1) {
    const prev = new Button(PREV_BUTTON_ID)
      .label(mailsLang.previous)
      .color('secondary');
    const next = new Button(NEXT_BUTTON_ID)
      .label(mailsLang.next)
      .color('secondary');
    if (disabled || page === 0) prev.disabled();
    if (disabled || page === pageCount - 1) next.disabled();
    container.add(
      new Separator(),
      new Text(
        mailsLang.pageIndicator({ current: page + 1, total: pageCount }),
      ).size('subtle'),
      new ActionRow(prev, next),
    );
  }

  return container;
}

/** Renders the inbox list or, when a mail is open, its detail view. */
export function buildMailsContainer(
  mails: readonly Mail[],
  state: MailsViewState,
  ctx: { disabled: boolean },
): Container {
  const open =
    state.openMailId !== undefined
      ? mails.find((mail) => mail.id === state.openMailId)
      : undefined;
  return open
    ? renderDetail(open, ctx.disabled)
    : renderList(mails, state, ctx.disabled);
}

/**
 * Drives the `/mails` inbox: a select opens a mail (marking it read), a back
 * button returns to the list, and prev/next paginate. Restricted to `userId`.
 */
export function attachMailsViewer(
  message: Message,
  userId: string,
  mails: readonly Mail[],
  initial: MailsViewState,
): void {
  const pageCount = Math.max(1, Math.ceil(mails.length / MAILS_PER_PAGE));

  new InteractiveMessage<MailsViewState>(
    message,
    initial,
    (state, ctx) => buildMailsContainer(mails, state, ctx),
    async (interaction, state) => {
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === MAIL_SELECT_ID
      ) {
        const mailId = interaction.values[0];
        if (mailId === undefined) return state;
        await markMailRead(userId, mailId);
        const readIds = new Set(state.readIds).add(mailId);
        return { ...state, openMailId: mailId, readIds };
      }
      if (interaction.isButton() && interaction.customId === BACK_BUTTON_ID) {
        return { ...state, openMailId: undefined };
      }
      if (interaction.isButton() && interaction.customId === PREV_BUTTON_ID) {
        return { ...state, page: Math.max(0, state.page - 1) };
      }
      if (interaction.isButton() && interaction.customId === NEXT_BUTTON_ID) {
        return { ...state, page: Math.min(pageCount - 1, state.page + 1) };
      }
      return state;
    },
    { idle: COLLECTOR_IDLE_MS, allowedIds: [userId] },
  );
}
