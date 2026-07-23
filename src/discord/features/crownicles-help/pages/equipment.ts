import type { MessageComponentInteraction } from 'discord.js';
import {
  ITEM_CATEGORIES,
  itemCategoryIcons,
  itemNatureIcons,
  itemRarityIcons,
  itemStatIcons,
  outcomeIcons,
  type ItemCategory,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  type Container,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { md } from '@/discord/theme/markdown.js';
import {
  loadEquipmentData,
  type CrowniclesEquipmentData,
  type EquipmentItem,
  type EquipmentStats,
} from '../data/equipment.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import {
  appendBackButton,
  appendLoadFallback,
  appendPaginationControls,
  clampPage,
  createHelpPageContainer,
  helpMessages,
  pickerPage,
  pickerPageCount,
  SELECT_DESCRIPTION_MAX,
  SELECT_LABEL_MAX,
  truncate,
} from '../crownicles-help.ui.js';

/** Router id of the equipment page. */
export const EQUIPMENT_PAGE_ID = 'equipment';

const EQUIPMENT_ICON = '⚔️';
/** Emote of the fight-potion usage count line. */
const USAGES_ICON = '🔁';

const CATEGORY_SELECT_ID = 'chelp-eq-category';
const RARITY_SELECT_ID = 'chelp-eq-rarity';
const ITEM_SELECT_ID = 'chelp-eq-item';
const ITEMS_PREV_ID = 'chelp-eq-prev';
const ITEMS_NEXT_ID = 'chelp-eq-next';
const BACK_TO_CATEGORIES_ID = 'chelp-eq-back-categories';
const BACK_TO_RARITIES_ID = 'chelp-eq-back-rarities';
const BACK_TO_ITEMS_ID = 'chelp-eq-back-items';
const SHOW_UPGRADES_ID = 'chelp-eq-upgrades';
const UPGRADES_PREV_ID = 'chelp-eq-up-prev';
const UPGRADES_NEXT_ID = 'chelp-eq-up-next';
const BACK_TO_DETAIL_ID = 'chelp-eq-back-detail';

function messages(locale: SupportedLocale) {
  return helpMessages(locale).equipment;
}

/** Localized label of an item category. */
function categoryLabel(
  locale: SupportedLocale,
  category: ItemCategory,
): string {
  return messages(locale).categories[category];
}

/** The items of one category and rarity, already sorted by name. */
function itemsOf(
  data: CrowniclesEquipmentData,
  category: ItemCategory,
  rarity: number,
): readonly EquipmentItem[] {
  return data.itemsByCategory.get(category)?.get(rarity) ?? [];
}

/** Rarities of `category` that hold at least one item, ascending, with counts. */
function raritiesOf(
  data: CrowniclesEquipmentData,
  category: ItemCategory,
): { rarity: number; count: number }[] {
  const byRarity = data.itemsByCategory.get(category);
  if (!byRarity) return [];
  return [...byRarity.entries()]
    .filter(([, items]) => items.length > 0)
    .map(([rarity, items]) => ({ rarity, count: items.length }))
    .sort((a, b) => a.rarity - b.rarity);
}

/** Official rarity name, falling back to the numeric level. */
function rarityName(data: CrowniclesEquipmentData, rarity: number): string {
  return data.rarityNames[rarity] ?? String(rarity);
}

function rarityIcon(rarity: number): string {
  return itemRarityIcons[rarity] ?? '';
}

/** Nonzero stats as `emote value` parts (e.g. `🗡️ 42 | 🚀 15`). */
function statParts(stats: EquipmentStats): string[] {
  const parts: string[] = [];
  if (stats.attack !== 0) parts.push(`${itemStatIcons.attack} ${stats.attack}`);
  if (stats.defense !== 0) {
    parts.push(`${itemStatIcons.defense} ${stats.defense}`);
  }
  if (stats.speed !== 0) parts.push(`${itemStatIcons.speed} ${stats.speed}`);
  return parts;
}

/** Compact one-line summary of an item, for the picker option description. */
function itemSummary(item: EquipmentItem): string {
  if (item.detail.kind === 'main') {
    return statParts(item.detail.stats).join(' | ');
  }
  return item.detail.effect;
}

/** Step 1: the category picker, listing each category and its item count. */
function appendCategoryPicker(
  container: Container,
  data: CrowniclesEquipmentData,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const counts = new Map<ItemCategory, number>();
  for (const category of ITEM_CATEGORIES) {
    const byRarity = data.itemsByCategory.get(category);
    let total = 0;
    for (const items of byRarity?.values() ?? []) total += items.length;
    counts.set(category, total);
  }

  const list = new Text('');
  for (const category of ITEM_CATEGORIES) {
    list.newLine(
      `${itemCategoryIcons[category]} ${categoryLabel(context.locale, category)} (${counts.get(category) ?? 0})`,
    );
  }
  container.add(list, new Separator());

  const select = new SelectMenu(CATEGORY_SELECT_ID)
    .placeholder(t.categoryPlaceholder)
    .options(
      ITEM_CATEGORIES.map((category) => ({
        label: categoryLabel(context.locale, category),
        value: category,
        emoji: itemCategoryIcons[category],
      })),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));
}

/** Step 2: the rarity picker of the chosen category, with item counts. */
function appendRarityPicker(
  container: Container,
  data: CrowniclesEquipmentData,
  category: ItemCategory,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  container.add(
    new Text(t.selectedCategory(categoryLabel(context.locale, category))).size(
      'subtle',
    ),
  );

  const rarities = raritiesOf(data, category);
  const list = new Text('');
  for (const { rarity, count } of rarities) {
    list.newLine(
      `${rarityIcon(rarity)} ${rarityName(data, rarity)} (${count})`.trim(),
    );
  }
  container.add(list, new Separator());

  const select = new SelectMenu(RARITY_SELECT_ID)
    .placeholder(t.rarityPlaceholder)
    .options(
      rarities.map(({ rarity, count }) => ({
        label: truncate(rarityName(data, rarity), SELECT_LABEL_MAX),
        value: String(rarity),
        description: t.itemCount(count),
        ...(itemRarityIcons[rarity] ? { emoji: itemRarityIcons[rarity] } : {}),
      })),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));

  appendBackButton(
    container,
    BACK_TO_CATEGORIES_ID,
    t.backToCategories,
    context,
  );
}

/** Step 3: the items of the chosen category and rarity, paginated, with a picker. */
function appendItemPicker(
  container: Container,
  data: CrowniclesEquipmentData,
  category: ItemCategory,
  rarity: number,
  state: HelpState,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const items = itemsOf(data, category, rarity);
  container.add(
    new Text(
      `${t.selectedCategory(categoryLabel(context.locale, category))} | ${t.selectedRarity(rarityName(data, rarity))}`,
    ).size('subtle'),
  );

  if (items.length === 0) {
    container.add(new Text(t.noItems));
    appendBackButton(container, BACK_TO_RARITIES_ID, t.backToRarities, context);
    return;
  }

  const { page, pageCount, slice } = pickerPage(items, state.itemsPage);

  const list = new Text('');
  for (const item of slice) {
    list.newLine(`${item.icon ?? ''} ${item.name}`.trim());
  }
  container.add(list, new Separator());

  const select = new SelectMenu(ITEM_SELECT_ID)
    .placeholder(t.itemPlaceholder)
    .options(
      slice.map((item) => {
        const summary = itemSummary(item);
        return {
          label: truncate(item.name, SELECT_LABEL_MAX),
          value: String(item.id),
          ...(summary
            ? { description: truncate(summary, SELECT_DESCRIPTION_MAX) }
            : {}),
          ...(item.icon ? { emoji: item.icon } : {}),
        };
      }),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));

  appendPaginationControls(container, {
    page,
    pageCount,
    prevId: ITEMS_PREV_ID,
    nextId: ITEMS_NEXT_ID,
    indicator: t.pageIndicator,
    previousLabel: t.previous,
    nextLabel: t.next,
    disabled: context.disabled,
  });

  appendBackButton(container, BACK_TO_RARITIES_ID, t.backToRarities, context);
}

/** Step 4: one item's details (stats or effect, value, usages). */
function appendItemDetail(
  container: Container,
  data: CrowniclesEquipmentData,
  item: EquipmentItem,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  container.add(
    new Text(`${item.icon ?? ''} ${md.bold(item.name)}`.trim()),
    new Separator(),
  );

  const facts = new Text(
    `${md.bold(t.rarityLabel)} : ${rarityIcon(item.rarity)} ${rarityName(data, item.rarity)}`.trim(),
  );
  if (item.detail.kind === 'main') {
    const stats = statParts(item.detail.stats);
    if (stats.length > 0) facts.newLine(stats.join(' | '));
    facts.newLine(
      `${outcomeIcons.money} ${md.bold(t.valueLabel)} : ${item.detail.value}`,
    );
  } else {
    facts.newLine(
      `${itemNatureIcons[item.detail.nature] ?? ''} ${item.detail.effect}`.trim(),
    );
    if (item.detail.usages !== undefined) {
      facts.newLine(
        `${USAGES_ICON} ${md.bold(t.usagesLabel)} : ${item.detail.usages}`,
      );
    }
    if (item.detail.value !== undefined) {
      facts.newLine(
        `${outcomeIcons.money} ${md.bold(t.valueLabel)} : ${item.detail.value}`,
      );
    }
  }
  container.add(facts);

  const row = new ButtonActionRow();
  if (item.detail.kind === 'main' && item.detail.upgrades.length > 0) {
    const upgrades = new Button(SHOW_UPGRADES_ID)
      .color('primary')
      .label(t.upgradesButton);
    if (context.disabled) upgrades.disabled();
    row.add(upgrades);
  }
  const back = new Button(BACK_TO_ITEMS_ID)
    .color('secondary')
    .label(t.backToItems);
  if (context.disabled) back.disabled();
  row.add(back);
  container.add(row);
}

/** The upgrade view: one level per page, its resulting stats and materials. */
function appendUpgradeView(
  container: Container,
  item: EquipmentItem,
  state: HelpState,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  container.add(
    new Text(
      `${item.icon ?? ''} ${md.bold(item.name)} - ${t.upgradesTitle}`.trim(),
    ),
    new Separator(),
  );

  if (item.detail.kind === 'main' && item.detail.upgrades.length > 0) {
    const upgrades = item.detail.upgrades;
    const page = clampPage(state.upgradesPage ?? 0, upgrades.length);
    const upgrade = upgrades[page];
    if (upgrade) {
      container.add(
        new Text(
          `${md.bold(t.levelLabel(upgrade.level))} : ${statParts(upgrade.stats).join(' | ')}`,
        ),
      );
      const cost = new Text('');
      for (const material of upgrade.materials) {
        cost.newLine(
          `${material.quantity}x ${material.icon ?? ''} ${material.name}`.trim(),
        );
      }
      container.add(cost, new Separator());
      appendPaginationControls(container, {
        page,
        pageCount: upgrades.length,
        prevId: UPGRADES_PREV_ID,
        nextId: UPGRADES_NEXT_ID,
        indicator: t.levelIndicator,
        previousLabel: t.previous,
        nextLabel: t.next,
        disabled: context.disabled,
      });
    }
  }

  appendBackButton(container, BACK_TO_DETAIL_ID, t.backToDetail, context);
}

/** Items browsable by category and rarity: stats, value and upgrade path. */
export const equipmentPage: HelpPage = {
  id: EQUIPMENT_PAGE_ID,
  authorization: 'normal',
  icon: EQUIPMENT_ICON,

  loadData: async (locale) => ({
    equipmentData: await loadEquipmentData(locale),
  }),
  hasData: (state) => state.equipmentData !== undefined,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    const t = messages(context.locale);
    const container = createHelpPageContainer(EQUIPMENT_ICON, t.name, t.intro);

    if (!state.equipmentData) {
      appendLoadFallback(container, state, context.locale);
      return container;
    }

    const data = state.equipmentData;
    if (state.selectedItemCategory === undefined) {
      appendCategoryPicker(container, data, context);
    } else if (state.selectedItemRarity === undefined) {
      appendRarityPicker(container, data, state.selectedItemCategory, context);
    } else if (state.selectedItemId === undefined) {
      appendItemPicker(
        container,
        data,
        state.selectedItemCategory,
        state.selectedItemRarity,
        state,
        context,
      );
    } else {
      const item = itemsOf(
        data,
        state.selectedItemCategory,
        state.selectedItemRarity,
      ).find((entry) => entry.id === state.selectedItemId);
      if (!item) {
        appendBackButton(container, BACK_TO_ITEMS_ID, t.backToItems, context);
      } else if (state.upgradesPage !== undefined) {
        appendUpgradeView(container, item, state, context);
      } else {
        appendItemDetail(container, data, item, context);
      }
    }

    return container;
  },

  reduce(state: HelpState, interaction: MessageComponentInteraction) {
    if (interaction.isStringSelectMenu()) {
      const value = interaction.values[0];
      if (value === undefined) return state;
      if (interaction.customId === CATEGORY_SELECT_ID) {
        const category = ITEM_CATEGORIES.find((entry) => entry === value);
        return category === undefined
          ? state
          : {
              ...state,
              selectedItemCategory: category,
              selectedItemRarity: undefined,
              selectedItemId: undefined,
              itemsPage: 0,
              upgradesPage: undefined,
            };
      }
      if (interaction.customId === RARITY_SELECT_ID) {
        const rarity = Number(value);
        return Number.isInteger(rarity)
          ? {
              ...state,
              selectedItemRarity: rarity,
              selectedItemId: undefined,
              itemsPage: 0,
            }
          : state;
      }
      if (interaction.customId === ITEM_SELECT_ID) {
        const id = Number(value);
        return Number.isInteger(id)
          ? { ...state, selectedItemId: id, upgradesPage: undefined }
          : state;
      }
      return state;
    }

    if (interaction.isButton()) {
      const items =
        state.selectedItemCategory !== undefined &&
        state.selectedItemRarity !== undefined &&
        state.equipmentData
          ? itemsOf(
              state.equipmentData,
              state.selectedItemCategory,
              state.selectedItemRarity,
            )
          : [];
      const selected = items.find((entry) => entry.id === state.selectedItemId);
      const upgradeCount =
        selected?.detail.kind === 'main' ? selected.detail.upgrades.length : 0;
      switch (interaction.customId) {
        case ITEMS_PREV_ID:
          return {
            ...state,
            itemsPage: Math.max(0, (state.itemsPage ?? 0) - 1),
          };
        case ITEMS_NEXT_ID:
          return {
            ...state,
            itemsPage: clampPage(
              (state.itemsPage ?? 0) + 1,
              pickerPageCount(items.length),
            ),
          };
        case BACK_TO_CATEGORIES_ID:
          return {
            ...state,
            selectedItemCategory: undefined,
            selectedItemRarity: undefined,
            selectedItemId: undefined,
            upgradesPage: undefined,
          };
        case BACK_TO_RARITIES_ID:
          return {
            ...state,
            selectedItemRarity: undefined,
            selectedItemId: undefined,
            upgradesPage: undefined,
          };
        case BACK_TO_ITEMS_ID:
          return {
            ...state,
            selectedItemId: undefined,
            upgradesPage: undefined,
          };
        case SHOW_UPGRADES_ID:
          return { ...state, upgradesPage: 0 };
        case UPGRADES_PREV_ID:
          return {
            ...state,
            upgradesPage: Math.max(0, (state.upgradesPage ?? 0) - 1),
          };
        case UPGRADES_NEXT_ID:
          return {
            ...state,
            upgradesPage: clampPage(
              (state.upgradesPage ?? 0) + 1,
              upgradeCount,
            ),
          };
        case BACK_TO_DETAIL_ID:
          return { ...state, upgradesPage: undefined };
        default:
          return state;
      }
    }

    return state;
  },
};
