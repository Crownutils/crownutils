import type { MessageComponentInteraction } from 'discord.js';
import type { CrowniclesEvent } from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  type Container,
  createContainer,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { md } from '@/discord/theme/markdown.js';
import type { CrowniclesHelpData } from '../data.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import {
  appendEventDetail,
  BACK_TO_EVENTS_ID,
  BACK_TO_LOCATIONS_ID,
  EVENT_SELECT_ID,
  eventOptionLabel,
  helpMessages,
  LOCATION_NEXT_ID,
  LOCATION_PREV_ID,
  LOCATION_SELECT_ID,
  LOCATIONS_PER_PAGE,
  truncate,
} from '../crownicles-help.ui.js';

export const EVENTS_PAGE_ID = 'events';

const EVENTS_ICON = '🎭';
/** Max events listed for a single location (Discord's select-menu ceiling). */
const EVENTS_PER_LOCATION = 25;
/** Truncation width of an event's intro in the location's event list. */
const EVENT_PREVIEW_MAX = 80;

function messages(locale: SupportedLocale) {
  return helpMessages(locale).events;
}

/** Total location-picker pages for the current data set. */
function locationPageCount(data: CrowniclesHelpData): number {
  return Math.max(1, Math.ceil(data.locations.length / LOCATIONS_PER_PAGE));
}

/** Clamps `page` into `[0, count - 1]`. */
function clampPage(page: number, count: number): number {
  return Math.min(Math.max(page, 0), count - 1);
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

  const pageCount = locationPageCount(data);
  const page = clampPage(state.locationsPage ?? 0, pageCount);
  const slice = data.locations.slice(
    page * LOCATIONS_PER_PAGE,
    page * LOCATIONS_PER_PAGE + LOCATIONS_PER_PAGE,
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
        label: truncate(location.name, 100),
        value: String(location.id),
        ...(location.icon ? { emoji: location.icon } : {}),
      })),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));

  if (pageCount > 1) {
    container.add(
      new Text(t.locationsPageIndicator(page + 1, pageCount)).size('subtle'),
    );
    const previous = new Button(LOCATION_PREV_ID)
      .color('secondary')
      .label(t.previous);
    const next = new Button(LOCATION_NEXT_ID).color('secondary').label(t.next);
    if (context.disabled || page <= 0) previous.disabled();
    if (context.disabled || page >= pageCount - 1) next.disabled();
    container.add(new ButtonActionRow().add(previous, next));
  }
}

/** Adds a single back button below the current step. */
function appendBackButton(
  container: Container,
  customId: string,
  label: string,
  context: HelpRenderContext,
): void {
  const back = new Button(customId).color('secondary').label(label);
  if (context.disabled) back.disabled();
  container.add(new ButtonActionRow().add(back));
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
    EVENTS_PER_LOCATION,
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
  mapTypeNames: Record<string, string>,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  appendEventDetail(container, event, context.locale, mapTypeNames);
  appendBackButton(container, BACK_TO_EVENTS_ID, t.backToEvents, context);
}

/** Events browsable by location: location → event → outcomes. */
export const eventsPage: HelpPage = {
  id: EVENTS_PAGE_ID,
  icon: EVENTS_ICON,
  requiresData: true,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    const t = messages(context.locale);
    const container = createContainer('brand').add(
      new Text(`${EVENTS_ICON} ${t.name}`).title(),
      new Text(t.intro).size('subtle'),
      new Separator(),
    );

    if (!state.data) {
      const shared = helpMessages(context.locale);
      container.add(
        new Text(state.dataError ? shared.loadError : shared.loading).size(
          'subtle',
        ),
      );
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
        appendEventDetailStep(
          container,
          event,
          state.data.mapTypeNames,
          context,
        );
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
      const pageCount = state.data ? locationPageCount(state.data) : 1;
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
