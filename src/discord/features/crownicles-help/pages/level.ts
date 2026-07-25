import type { MessageComponentInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { computeExperienceNeededToLevelUp } from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  type Container,
  Modal,
  Text,
  TextInput,
} from '@/discord/components/index.js';
import { type ModalApply, safeDiscord } from '@/discord/interactions/index.js';
import { md } from '@/discord/theme/markdown.js';
import {
  createHelpPageContainer,
  helpMessages,
} from '../crownicles-help.ui.js';
import type {
  HelpPage,
  HelpReduceContext,
  HelpRenderContext,
  HelpState,
} from '../page.js';

/** Router id of the level page. */
export const LEVEL_PAGE_ID = 'level';

const LEVEL_ICON = '⭐';

const LEVEL_BUTTON_ID = 'chelp-level-button';
const LEVEL_MODAL_ID = 'chelp-level-modal';
const LEVEL_FROM_INPUT_ID = 'chelp-level-from';
const LEVEL_TO_INPUT_ID = 'chelp-level-to';

/** Highest level accepted, so the XP loop stays bounded on absurd input. */
const MAX_LEVEL = 1000;

function messages(locale: SupportedLocale) {
  return helpMessages(locale).level;
}

/** The two-field modal that asks for the starting and target levels. */
function buildLevelModal(locale: SupportedLocale): Modal {
  const t = messages(locale).modal;
  return new Modal(LEVEL_MODAL_ID)
    .title(t.title)
    .add(
      new TextInput(LEVEL_FROM_INPUT_ID, t.fromLevelLabel)
        .placeholder(t.fromLevelPlaceholder)
        .minLength(1),
      new TextInput(LEVEL_TO_INPUT_ID, t.toLevelLabel)
        .placeholder(t.toLevelPlaceholder)
        .minLength(1),
    );
}

/** A level typed in the modal: a non-negative whole number within range, else `undefined`. */
function parseLevel(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) && value <= MAX_LEVEL ? value : undefined;
}

/**
 * Folds the modal submission into the state: a valid `from < to` pair is stored
 * (the runtime then re-renders the result), while malformed or out-of-range
 * input gets an ephemeral notice and leaves the state untouched.
 */
function levelModalApply(locale: SupportedLocale): ModalApply<HelpState> {
  return async (state, submit, context) => {
    const fromLevel = parseLevel(
      submit.fields.getTextInputValue(LEVEL_FROM_INPUT_ID),
    );
    const toLevel = parseLevel(
      submit.fields.getTextInputValue(LEVEL_TO_INPUT_ID),
    );
    if (
      fromLevel === undefined ||
      toLevel === undefined ||
      fromLevel >= toLevel
    ) {
      context.markHandled();
      await safeDiscord(
        submit.reply({
          content: messages(locale).invalidInput(MAX_LEVEL),
          flags: MessageFlags.Ephemeral,
        }),
        { action: 'crowniclesHelp.levelInvalid' },
      );
      return state;
    }
    return { ...state, fromLevel, toLevel };
  };
}

function buildLevelContainer(
  state: HelpState,
  context: HelpRenderContext,
): Container {
  const t = messages(context.locale);
  const container = createHelpPageContainer(LEVEL_ICON, t.name, t.intro);

  const { fromLevel, toLevel } = state;
  const hasResult = fromLevel !== undefined && toLevel !== undefined;
  if (fromLevel !== undefined && toLevel !== undefined) {
    const xp = computeExperienceNeededToLevelUp(fromLevel, toLevel);
    container.add(
      new Text(
        t.result(
          fromLevel,
          toLevel,
          md.bold(xp.toLocaleString(context.locale)),
          LEVEL_ICON,
        ),
      ),
    );
  }

  const button = new Button(LEVEL_BUTTON_ID)
    .color('secondary')
    .label(hasResult ? t.recomputeXpButton : t.computeXpButton)
    .disabled(context.disabled);
  container.add(new ButtonActionRow().add(button));

  return container;
}

export const levelPage = {
  id: LEVEL_PAGE_ID,
  authorization: 'normal',
  icon: LEVEL_ICON,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    return buildLevelContainer(state, context);
  },

  reduce(
    state: HelpState,
    interaction: MessageComponentInteraction,
    context: HelpReduceContext,
  ) {
    if (interaction.isButton() && interaction.customId === LEVEL_BUTTON_ID) {
      context.showModal(
        buildLevelModal(context.locale).build(),
        levelModalApply(context.locale),
      );
    }
    return state;
  },
} satisfies HelpPage;
