import type { MessageComponentInteraction } from 'discord.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  createContainer,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { md } from '@/discord/theme/markdown.js';
import { loadCrowniclesHelpData } from '../data.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import {
  appendEventDetail,
  BACK_TO_EVENTS_ID,
  EVENT_SELECT_ID,
  eventOptionLabel,
  helpMessages,
  truncate,
} from '../crownicles-help.ui.js';

/** Router id of the special-events page. */
export const SPECIAL_EVENTS_PAGE_ID = 'special-events';

const SPECIAL_ICON = '✨';
/** Max specials listed at once (Discord's select-menu ceiling). */
const SPECIAL_EVENTS_MAX = 25;
const EVENT_PREVIEW_MAX = 80;

function messages(locale: SupportedLocale) {
  return helpMessages(locale).special;
}

/** Location-less seasonal events (Halloween, Christmas, ...): event → outcomes. */
export const specialEventsPage: HelpPage = {
  id: SPECIAL_EVENTS_PAGE_ID,
  authorization: 'normal',
  icon: SPECIAL_ICON,

  loadData: async (locale) => ({ data: await loadCrowniclesHelpData(locale) }),
  hasData: (state) => state.data !== undefined,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    const t = messages(context.locale);
    const container = createContainer('brand').add(
      new Text(`${SPECIAL_ICON} ${t.name}`).title(),
      new Text(t.intro).size('subtle'),
      new Separator(),
    );

    if (!state.data) {
      const shared = helpMessages(context.locale);
      container.add(
        new Text(state.loadError ? shared.loadError : shared.loading).size(
          'subtle',
        ),
      );
      return container;
    }

    const specials = state.data.specialEvents.slice(0, SPECIAL_EVENTS_MAX);

    if (state.selectedEventId !== undefined) {
      const event = specials.find(
        (entry) => entry.id === state.selectedEventId,
      );
      if (event) {
        appendEventDetail(container, event, context.locale, state.data);
      }
      const back = new Button(BACK_TO_EVENTS_ID)
        .color('secondary')
        .label(t.backToEvents);
      if (context.disabled) back.disabled();
      container.add(new ButtonActionRow().add(back));
      return container;
    }

    if (specials.length === 0) {
      container.add(new Text(t.noEvents));
      return container;
    }

    const list = new Text('');
    for (const event of specials) {
      list.newLine(
        `${md.bold(`#${event.id}`)} ${truncate(event.text, EVENT_PREVIEW_MAX)}`,
      );
    }
    container.add(list, new Separator());

    const select = new SelectMenu(EVENT_SELECT_ID)
      .placeholder(t.eventPlaceholder)
      .options(
        specials.map((event) => ({
          label: eventOptionLabel(event.text, `#${event.id}`),
          value: String(event.id),
          description: `#${event.id}`,
        })),
      );
    if (context.disabled) select.disabled();
    container.add(new SelectActionRow().set(select));

    return container;
  },

  reduce(state: HelpState, interaction: MessageComponentInteraction) {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === EVENT_SELECT_ID
    ) {
      const value = Number(interaction.values[0]);
      return Number.isInteger(value)
        ? { ...state, selectedEventId: value }
        : state;
    }
    if (interaction.isButton() && interaction.customId === BACK_TO_EVENTS_ID) {
      return { ...state, selectedEventId: undefined };
    }
    return state;
  },
};
