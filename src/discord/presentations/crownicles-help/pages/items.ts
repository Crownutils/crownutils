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
  getItems,
  ITEM_CATEGORIES,
  type CrowniclesItem,
  type ItemCategory,
} from '@/core/crownicles/index.js';
import { safeDiscord } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import {
  CATEGORY_ICONS,
  crowniclesIcons,
  NATURE_ICONS,
  RARITY_ICONS,
} from '../icons.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';

export const ITEMS_PAGE_ID = 'items';

const ITEMS_ICON = '🎒';
const CATEGORY_SELECT_ID = 'crownicles-help-items-category';
const RARITY_SELECT_ID = 'crownicles-help-items-rarity';
const PREV_BUTTON_ID = 'crownicles-help-items-prev';
const NEXT_BUTTON_ID = 'crownicles-help-items-next';

const ITEMS_PER_PAGE = 8;

const { name, description, messages } =
  lang.commands.crowniclesHelp.pages.items;

/** Items of the open category matching the selected rarity. */
function filteredItems(state: HelpState): readonly CrowniclesItem[] {
  return (state.items ?? []).filter((item) => item.rarity === state.itemRarity);
}

/** Number of pagination pages for the current category/rarity selection. */
function totalPagesFor(state: HelpState): number {
  return Math.max(1, Math.ceil(filteredItems(state).length / ITEMS_PER_PAGE));
}

/** One-line stat summary of an item, by category. */
function statSummary(item: CrowniclesItem): string {
  if (item.category === 'objects' || item.category === 'potions') {
    const nature = item.nature ?? 0;
    return `${NATURE_ICONS[nature] ?? ''} ${messages.natureEffect({
      category: item.category,
      nature,
      power: item.power ?? 0,
    })}`;
  }

  const parts: string[] = [];
  if (item.attack) {
    parts.push(
      messages.statValue({ icon: crowniclesIcons.attack, value: item.attack }),
    );
  }
  if (item.defense) {
    parts.push(
      messages.statValue({
        icon: crowniclesIcons.defense,
        value: item.defense,
      }),
    );
  }
  if (item.speed) {
    parts.push(
      messages.statValue({ icon: crowniclesIcons.speed, value: item.speed }),
    );
  }
  return parts.length > 0 ? parts.join(' | ') : '-';
}

/** Adds the rarity select and, once a rarity is picked, the paginated list. */
function appendItemList(
  container: Container,
  state: HelpState,
  ctx: HelpRenderContext,
): void {
  const items = state.items ?? [];
  const rarities = [...new Set(items.map((item) => item.rarity))].sort(
    (a, b) => a - b,
  );

  // Breadcrumb so the user keeps track of their picks: the selects only show
  // their placeholder again once a value is chosen.
  const category = state.itemCategory;
  if (category) {
    const rarity = state.itemRarity;
    container.add(
      new Separator(),
      new Text(
        messages.selection({
          category: `${CATEGORY_ICONS[category]} ${messages.categoryLabels[category]}`,
          rarity:
            rarity !== undefined
              ? `${RARITY_ICONS[rarity] ?? ''} ${messages.rarityLabels[rarity] ?? String(rarity)}`
              : undefined,
        }),
      ).size('subtle'),
    );
  }

  const raritySelect = new Select(RARITY_SELECT_ID).placeholder(
    messages.rarityPlaceholder,
  );
  for (const rarity of rarities) {
    raritySelect.option(
      messages.rarityLabels[rarity] ?? String(rarity),
      String(rarity),
      undefined,
      RARITY_ICONS[rarity],
    );
  }
  if (ctx.disabled) raritySelect.disabled();
  container.add(new Separator(), raritySelect);

  if (state.itemRarity === undefined) {
    container.add(new Text(messages.chooseRarity).size('subtle'));
    return;
  }

  const filtered = filteredItems(state);
  if (filtered.length === 0) {
    container.add(new Text(messages.empty).size('subtle'));
    return;
  }

  const totalPages = totalPagesFor(state);
  const page = Math.min(Math.max(state.itemPage ?? 0, 0), totalPages - 1);
  const slice = filtered.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  const list = new Text('');
  for (const item of slice) {
    list.newLine(
      messages.itemLine({
        icon: item.icon ?? '',
        name: item.name,
        stats: statSummary(item),
      }),
    );
  }
  container.add(
    new Separator(),
    list,
    new Text(
      messages.pageIndicator({ current: page + 1, total: totalPages }),
    ).size('subtle'),
  );

  const previous = new Button(PREV_BUTTON_ID)
    .label(messages.previous)
    .color('secondary');
  const next = new Button(NEXT_BUTTON_ID)
    .label(messages.next)
    .color('secondary');
  if (ctx.disabled || page <= 0) previous.disabled();
  if (ctx.disabled || page >= totalPages - 1) next.disabled();
  container.add(new ActionRow(previous, next));
}

/** Renders the equipment page from `state`; named so `reduce` can reuse it. */
function renderItems(state: HelpState, ctx: HelpRenderContext): Container {
  const container = new Container()
    .color('info')
    .add(
      new Title(`${ITEMS_ICON} ${name}`),
      new Text(messages.intro).size('subtle'),
      new Separator(),
    );

  const categorySelect = new Select(CATEGORY_SELECT_ID).placeholder(
    messages.categoryPlaceholder,
  );
  for (const category of ITEM_CATEGORIES) {
    categorySelect.option(
      messages.categoryLabels[category],
      category,
      undefined,
      CATEGORY_ICONS[category],
    );
  }
  if (ctx.disabled) categorySelect.disabled();
  container.add(categorySelect);

  if (state.itemCategory) {
    if (state.itemsError) {
      container.add(new Text(messages.loadError).size('subtle'));
    } else if (!state.items) {
      container.add(new Text(messages.loading).size('subtle'));
    } else {
      appendItemList(container, state, ctx);
    }
  }

  return container.add(new Separator(), buildNavSelect(ctx));
}

/** Equipment page: browse the game's items by category and rarity, paginated. */
export const itemsPage = {
  id: ITEMS_PAGE_ID,
  name,
  description,
  icon: ITEMS_ICON,
  requiredAuthorization: 'public',

  render: renderItems,

  reduce: async (interaction, state, { handled }, renderCtx) => {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === CATEGORY_SELECT_ID
    ) {
      const value = interaction.values[0];
      if (value === undefined) return state;
      const category = value as ItemCategory;

      // Loading a category hits the network (~2.4s on first access), so
      // acknowledge the interaction immediately with a "loading" view, then
      // edit the message once the items are in.
      const loadingState: HelpState = {
        ...state,
        itemCategory: category,
        items: undefined,
        itemsError: false,
        itemRarity: undefined,
        itemPage: 0,
      };
      await interaction.update(renderItems(loadingState, renderCtx).build());
      handled();

      try {
        const items = await getItems(category);
        const loaded: HelpState = { ...loadingState, items };
        await safeDiscord(
          interaction.message.edit(renderItems(loaded, renderCtx).build()),
          'items.load',
        );
        return loaded;
      } catch {
        const errored: HelpState = { ...loadingState, itemsError: true };
        await safeDiscord(
          interaction.message.edit(renderItems(errored, renderCtx).build()),
          'items.loadError',
        );
        return errored;
      }
    }

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === RARITY_SELECT_ID
    ) {
      const rarity = Number(interaction.values[0]);
      return Number.isInteger(rarity)
        ? { ...state, itemRarity: rarity, itemPage: 0 }
        : state;
    }

    if (interaction.isButton() && interaction.customId === PREV_BUTTON_ID) {
      return { ...state, itemPage: Math.max(0, (state.itemPage ?? 0) - 1) };
    }

    if (interaction.isButton() && interaction.customId === NEXT_BUTTON_ID) {
      return {
        ...state,
        itemPage: Math.min((state.itemPage ?? 0) + 1, totalPagesFor(state) - 1),
      };
    }

    return state;
  },
} satisfies HelpPage;
