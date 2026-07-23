import type { MessageComponentInteraction } from 'discord.js';
import type { CrowniclesEvent } from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  type Container,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { md } from '@/discord/theme/markdown.js';
import {
  loadCrowniclesHelpData,
  type CrowniclesHelpData,
} from '../data/events.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import {
  appendBackButton,
  appendEventDetail,
  appendLoadFallback,
  appendPaginationControls,
  BACK_TO_EVENTS_ID,
  BACK_TO_LOCATIONS_ID,
  clampPage,
  createHelpPageContainer,
  EVENT_SELECT_ID,
  eventOptionLabel,
  helpMessages,
  LOCATION_NEXT_ID,
  LOCATION_PREV_ID,
  LOCATION_SELECT_ID,
  PICKER_PAGE_SIZE,
  pickerPage,
  pickerPageCount,
  SELECT_LABEL_MAX,
  truncate,
} from '../crownicles-help.ui.js';

/** Router id of the events page. */
export const EVENTS_PAGE_ID = 'events';

const EVENTS_ICON = '🎭';
/** Truncation width of an event's intro in the location's event list. */
const EVENT_PREVIEW_MAX = 80;

function messages(locale: SupportedLocale) {
  return helpMessages(locale).events;
}

/** Step 1: the paginated location picker, listing the current page's locations. */
function appendLocationPicker(
  container: Container,
  data: CrowniclesHelpData,
  state: HelpState,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  if (data.locations.length === 0) {
    container.add(new Text(t.noLocations));
    return;
  }

  const { page, pageCount, slice } = pickerPage(
    data.locations,
    state.locationsPage,
  );

  const list = new Text('');
  for (const location of slice) {
    list.newLine(`${location.icon ?? ''} ${location.name}`.trim());
  }
  container.add(list, new Separator());

  const select = new SelectMenu(LOCATION_SELECT_ID)
    .placeholder(t.locationPlaceholder)
    .options(
      slice.map((location) => ({
        label: truncate(location.name, SELECT_LABEL_MAX),
        value: String(location.id),
        ...(location.icon ? { emoji: location.icon } : {}),
      })),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));

  appendPaginationControls(container, {
    page,
    pageCount,
    prevId: LOCATION_PREV_ID,
    nextId: LOCATION_NEXT_ID,
    indicator: t.locationsPageIndicator,
    previousLabel: t.previous,
    nextLabel: t.next,
    disabled: context.disabled,
  });
}

/** Step 2: the events hosted by the chosen location, with a picker. */
function appendEventPicker(
  container: Container,
  data: CrowniclesHelpData,
  locationId: number,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const location = data.locations.find((entry) => entry.id === locationId);
  const events = (data.eventsByLocation.get(locationId) ?? []).slice(
    0,
    PICKER_PAGE_SIZE,
  );

  container.add(
    new Text(t.selectedLocation(location?.name ?? '?')).size('subtle'),
  );

  if (events.length === 0) {
    container.add(new Text(t.noEvents));
    appendBackButton(
      container,
      BACK_TO_LOCATIONS_ID,
      t.backToLocations,
      context,
    );
    return;
  }

  const list = new Text('');
  for (const event of events) {
    list.newLine(
      `${md.bold(`#${event.id}`)} ${truncate(event.text, EVENT_PREVIEW_MAX)}`,
    );
  }
  container.add(list, new Separator());

  const select = new SelectMenu(EVENT_SELECT_ID)
    .placeholder(t.eventPlaceholder)
    .options(
      events.map((event) => ({
        label: eventOptionLabel(event.text, `#${event.id}`),
        value: String(event.id),
        description: `#${event.id}`,
      })),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));

  appendBackButton(container, BACK_TO_LOCATIONS_ID, t.backToLocations, context);
}

/** Step 3: one event's intro, choices and outcomes. */
function appendEventDetailStep(
  container: Container,
  event: CrowniclesEvent,
  data: CrowniclesHelpData,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  appendEventDetail(container, event, context.locale, data);
  appendBackButton(container, BACK_TO_EVENTS_ID, t.backToEvents, context);
}

/** Events browsable by location: location -> event -> outcomes. */
export const eventsPage: HelpPage = {
  id: EVENTS_PAGE_ID,
  authorization: 'normal',
  icon: EVENTS_ICON,

  loadData: async (locale) => ({ data: await loadCrowniclesHelpData(locale) }),
  hasData: (state) => state.data !== undefined,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    const t = messages(context.locale);
    const container = createHelpPageContainer(EVENTS_ICON, t.name, t.intro);

    if (!state.data) {
      appendLoadFallback(container, state, context.locale);
      return container;
    }

    if (state.selectedLocationId === undefined) {
      appendLocationPicker(container, state.data, state, context);
    } else if (state.selectedEventId === undefined) {
      appendEventPicker(
        container,
        state.data,
        state.selectedLocationId,
        context,
      );
    } else {
      const event = (
        state.data.eventsByLocation.get(state.selectedLocationId) ?? []
      ).find((entry) => entry.id === state.selectedEventId);
      if (event) {
        appendEventDetailStep(container, event, state.data, context);
      } else {
        appendBackButton(container, BACK_TO_EVENTS_ID, t.backToEvents, context);
      }
    }

    return container;
  },

  reduce(state: HelpState, interaction: MessageComponentInteraction) {
    if (interaction.isStringSelectMenu()) {
      const value = Number(interaction.values[0]);
      if (!Number.isInteger(value)) return state;
      if (interaction.customId === LOCATION_SELECT_ID) {
        return {
          ...state,
          selectedLocationId: value,
          selectedEventId: undefined,
        };
      }
      if (interaction.customId === EVENT_SELECT_ID) {
        return { ...state, selectedEventId: value };
      }
      return state;
    }

    if (interaction.isButton()) {
      const pageCount = pickerPageCount(state.data?.locations.length ?? 0);
      switch (interaction.customId) {
        case LOCATION_PREV_ID:
          return {
            ...state,
            locationsPage: Math.max(0, (state.locationsPage ?? 0) - 1),
          };
        case LOCATION_NEXT_ID:
          return {
            ...state,
            locationsPage: clampPage((state.locationsPage ?? 0) + 1, pageCount),
          };
        case BACK_TO_LOCATIONS_ID:
          return {
            ...state,
            selectedLocationId: undefined,
            selectedEventId: undefined,
          };
        case BACK_TO_EVENTS_ID:
          return { ...state, selectedEventId: undefined };
        default:
          return state;
      }
    }

    return state;
  },
};
