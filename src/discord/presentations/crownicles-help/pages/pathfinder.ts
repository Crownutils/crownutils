import {
  ActionRow,
  Button,
  Container,
  Select,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import {
  consumePathfinderUse,
  findShortestPath,
  getContinentGraph,
  type CrowniclesMap,
} from '@/core/crownicles/index.js';
import { safeDiscord } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import { LOCATION_TYPE_ICONS } from '../icons.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';

export const PATHFINDER_PAGE_ID = 'pathfinder';

const PATHFINDER_ICON = '🧭';
const TYPE_SELECT_ID = 'crownicles-help-path-type';
const LOCATION_SELECT_ID = 'crownicles-help-path-location';
const RESTART_BUTTON_ID = 'crownicles-help-path-restart';

const { name, description, messages } =
  lang.commands.crowniclesHelp.pages.pathfinder;

function locationName(map: CrowniclesMap, id: number): string {
  return map.locations.find((l) => l.id === id)?.name ?? '?';
}

function appendResult(
  container: Container,
  state: HelpState,
  map: CrowniclesMap,
): void {
  const result = findShortestPath(
    map.links,
    state.pathFromId!,
    state.pathToId!,
  );
  if (!result) {
    container.add(new Text(messages.noRoute));
    return;
  }
  const steps = result.steps.map((id) => locationName(map, id));
  container.add(
    new Text(messages.route({ steps })),
    new Text(messages.routeTotal({ minutes: result.totalDurationMin })).size(
      'subtle',
    ),
  );
}

function appendPicker(
  container: Container,
  state: HelpState,
  ctx: HelpRenderContext,
): void {
  const typeSelect = new Select(TYPE_SELECT_ID).placeholder(
    messages.typePlaceholder,
  );
  for (const { code, label } of messages.types)
    typeSelect.option(label, code, undefined, LOCATION_TYPE_ICONS[code]);
  if (ctx.disabled) typeSelect.disabled();
  container.add(typeSelect);

  if (state.pathType === undefined) {
    container.add(
      new Text(
        state.pathFromId === undefined
          ? messages.chooseDepartureType
          : messages.chooseDestinationType,
      ).size('subtle'),
    );
    return;
  }
  if (state.pathMapError) {
    container.add(new Text(messages.loadError).size('subtle'));
    return;
  }
  if (!state.pathMap) {
    container.add(new Text(messages.loading).size('subtle'));
    return;
  }

  const locations = state.pathMap.locations
    .filter((l) => l.type === state.pathType)
    .sort((a, b) => a.name.localeCompare(b.name));
  const locationSelect = new Select(LOCATION_SELECT_ID).placeholder(
    messages.locationPlaceholder,
  );
  for (const l of locations)
    locationSelect.option(l.name, String(l.id), undefined, l.icon);
  if (ctx.disabled) locationSelect.disabled();
  container.add(new Separator(), locationSelect);
}

function renderPathfinder(state: HelpState, ctx: HelpRenderContext): Container {
  const container = new Container()
    .color('info')
    .add(
      new Title(`${PATHFINDER_ICON} ${name}`),
      new Text(messages.intro).size('subtle'),
      new Separator(),
    );

  const done =
    state.pathFromId !== undefined &&
    state.pathToId !== undefined &&
    state.pathMap !== undefined;

  if (state.pathLimitReached) {
    container.add(new Text(messages.dailyLimitReached));
  } else if (done && state.pathMap) {
    appendResult(container, state, state.pathMap);
  } else {
    if (state.pathFromId !== undefined && state.pathMap) {
      container.add(
        new Text(
          messages.departure({
            name: locationName(state.pathMap, state.pathFromId),
          }),
        ).size('subtle'),
      );
    }
    appendPicker(container, state, ctx);
  }

  if (state.pathFromId !== undefined) {
    const restart = new Button(RESTART_BUTTON_ID)
      .label(messages.restart)
      .color('secondary');
    if (ctx.disabled) restart.disabled();
    container.add(new ActionRow(restart));
  }

  return container.add(new Separator(), buildNavSelect(ctx));
}

export const pathfinderPage = {
  id: PATHFINDER_PAGE_ID,
  name,
  description,
  icon: PATHFINDER_ICON,
  requiredAuthorization: 'public',
  render: renderPathfinder,

  reduce: async (interaction, state, { handled }, renderCtx) => {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === TYPE_SELECT_ID
    ) {
      const type = interaction.values[0];
      if (type === undefined) return state;
      if (state.pathMap) return { ...state, pathType: type };

      const loadingState: HelpState = {
        ...state,
        pathType: type,
        pathMap: undefined,
        pathMapError: false,
      };
      await interaction.update(
        renderPathfinder(loadingState, renderCtx).build(),
      );
      handled();
      try {
        const map = await getContinentGraph();
        const loaded: HelpState = { ...loadingState, pathMap: map };
        await safeDiscord(
          interaction.message.edit(renderPathfinder(loaded, renderCtx).build()),
          'pathfinder.load',
        );
        return loaded;
      } catch {
        const errored: HelpState = { ...loadingState, pathMapError: true };
        await safeDiscord(
          interaction.message.edit(
            renderPathfinder(errored, renderCtx).build(),
          ),
          'pathfinder.loadError',
        );
        return errored;
      }
    }

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === LOCATION_SELECT_ID
    ) {
      const id = Number(interaction.values[0]);
      if (!Number.isInteger(id)) return state;
      if (state.pathFromId === undefined) {
        return { ...state, pathFromId: id, pathType: undefined };
      }
      if (state.pathToId === undefined) {
        // Computing a route is one daily use; the owner is exempt.
        if (!(await consumePathfinderUse(interaction.user.id))) {
          return { ...state, pathLimitReached: true, pathType: undefined };
        }
        return { ...state, pathToId: id, pathType: undefined };
      }
      return state;
    }

    if (interaction.isButton() && interaction.customId === RESTART_BUTTON_ID) {
      return {
        ...state,
        pathFromId: undefined,
        pathToId: undefined,
        pathType: undefined,
        pathLimitReached: false,
      };
    }

    return state;
  },
} satisfies HelpPage;
