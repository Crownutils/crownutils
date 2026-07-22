import type { MessageComponentInteraction } from 'discord.js';
import {
  MATERIAL_TYPES,
  type CrowniclesMaterial,
} from '@/core/crownicles/index.js';
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
import {
  loadMaterialsData,
  type CrowniclesMaterialsData,
  type MaterialExpeditionSource,
} from '../data.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import { helpMessages, truncate } from '../crownicles-help.ui.js';

/** Router id of the materials page. */
export const MATERIALS_PAGE_ID = 'materials';

const MATERIALS_ICON = '⛏️';
/** Materials per picker page (Discord's select-menu ceiling); a type holds ~9. */
const MATERIALS_PER_PAGE = 25;

const TYPE_SELECT_ID = 'chelp-mat-type';
const MATERIAL_SELECT_ID = 'chelp-material';
const MATERIALS_PREV_ID = 'chelp-mat-prev';
const MATERIALS_NEXT_ID = 'chelp-mat-next';
const BACK_TO_TYPES_ID = 'chelp-mat-back-types';
const BACK_TO_MATERIALS_ID = 'chelp-mat-back-materials';

/** Emote per material type, for the type picker (glyphs live in code, not lang). */
const TYPE_ICONS: Record<string, string> = {
  metal: '⚙️',
  alloy: '🔩',
  nature: '🌿',
  spiritual: '🔮',
  magic: '✨',
  leather: '🟫',
  rope: '🪢',
  poison: '☠️',
  explosive: '🧨',
  wood: '🪵',
};

/** Emote per rarity level (`1`..`3`); index `0` is unused. */
const RARITY_ICONS = ['', '🟢', '🔵', '🟣'];

/** Emote per material source line in the "how to obtain" section. */
const SOURCE_ICONS = {
  smallEvent: '🔎',
  expedition: '🧭',
  boss: '👹',
  compost: '♻️',
  cooking: '🍳',
};

/** Emote per expedition terrain, from the game's `expedition.locations` icon set. */
const EXPEDITION_ICONS: Record<string, string> = {
  forest: '🌲',
  mountain: '⛰️',
  desert: '🏜️',
  swamp: '🌿',
  ruins: '🏛️',
  cave: '🕳️',
  plains: '🌾',
  coast: '🌊',
};

/** A `0..1` probability as a trimmed percentage (e.g. `0.167` → `16.7%`, `0.2` → `20%`). */
function formatPercent(chance: number): string {
  return `${+(chance * 100).toFixed(1)}%`;
}

function messages(locale: SupportedLocale) {
  return helpMessages(locale).materials;
}

/** Localized label of a material type, falling back to the raw type code. */
function typeLabel(locale: SupportedLocale, type: string): string {
  return (messages(locale).types as Record<string, string>)[type] ?? type;
}

/** Localized label of an expedition terrain, falling back to the raw terrain code. */
function terrainLabel(locale: SupportedLocale, terrain: string): string {
  return (
    (messages(locale).terrains as Record<string, string>)[terrain] ?? terrain
  );
}

/** Renders terrain-based sources as `icon label chance` parts, comma-joined. */
function terrainParts(
  locale: SupportedLocale,
  entries: readonly MaterialExpeditionSource[],
): string {
  return entries
    .map((entry) =>
      `${EXPEDITION_ICONS[entry.terrain] ?? ''} ${terrainLabel(locale, entry.terrain)} ${formatPercent(entry.chance)}`.trim(),
    )
    .join(', ');
}

function rarityIcon(rarity: number): string {
  return RARITY_ICONS[rarity] ?? '';
}

function materialPageCount(materials: readonly CrowniclesMaterial[]): number {
  return Math.max(1, Math.ceil(materials.length / MATERIALS_PER_PAGE));
}

function clampPage(page: number, count: number): number {
  return Math.min(Math.max(page, 0), count - 1);
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

/** Step 1: the type picker, listing each type and its material count. */
function appendTypePicker(
  container: Container,
  data: CrowniclesMaterialsData,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const list = new Text('');
  for (const type of MATERIAL_TYPES) {
    const count = data.materialsByType.get(type)?.length ?? 0;
    list.newLine(
      `${TYPE_ICONS[type] ?? ''} ${typeLabel(context.locale, type)} (${count})`.trim(),
    );
  }
  container.add(list, new Separator());

  const select = new SelectMenu(TYPE_SELECT_ID)
    .placeholder(t.typePlaceholder)
    .options(
      MATERIAL_TYPES.map((type) => ({
        label: typeLabel(context.locale, type),
        value: type,
        ...(TYPE_ICONS[type] ? { emoji: TYPE_ICONS[type] } : {}),
      })),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));
}

/** Step 2: the materials of the chosen type, paginated, with a picker. */
function appendMaterialPicker(
  container: Container,
  data: CrowniclesMaterialsData,
  type: string,
  state: HelpState,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const materials = data.materialsByType.get(type) ?? [];
  container.add(
    new Text(t.selectedType(typeLabel(context.locale, type))).size('subtle'),
  );

  if (materials.length === 0) {
    container.add(new Text(t.noMaterials));
    appendBackButton(container, BACK_TO_TYPES_ID, t.backToTypes, context);
    return;
  }

  const pageCount = materialPageCount(materials);
  const page = clampPage(state.materialsPage ?? 0, pageCount);
  const slice = materials.slice(
    page * MATERIALS_PER_PAGE,
    page * MATERIALS_PER_PAGE + MATERIALS_PER_PAGE,
  );

  const list = new Text('');
  for (const material of slice) {
    list.newLine(
      `${material.icon ?? ''} ${material.name} ${rarityIcon(material.rarity)}`.trim(),
    );
  }
  container.add(list, new Separator());

  const select = new SelectMenu(MATERIAL_SELECT_ID)
    .placeholder(t.materialPlaceholder)
    .options(
      slice.map((material) => {
        const rarityName = data.rarityNames[String(material.rarity)];
        return {
          label: truncate(material.name, 100),
          value: String(material.id),
          ...(rarityName ? { description: rarityName } : {}),
          ...(material.icon ? { emoji: material.icon } : {}),
        };
      }),
    );
  if (context.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));

  if (pageCount > 1) {
    container.add(
      new Text(t.pageIndicator(page + 1, pageCount)).size('subtle'),
    );
    const previous = new Button(MATERIALS_PREV_ID)
      .color('secondary')
      .label(t.previous);
    const next = new Button(MATERIALS_NEXT_ID).color('secondary').label(t.next);
    if (context.disabled || page <= 0) previous.disabled();
    if (context.disabled || page >= pageCount - 1) next.disabled();
    container.add(new ButtonActionRow().add(previous, next));
  }

  appendBackButton(container, BACK_TO_TYPES_ID, t.backToTypes, context);
}

/** Step 3: one material's details, including how to obtain it. */
function appendMaterialDetail(
  container: Container,
  data: CrowniclesMaterialsData,
  material: CrowniclesMaterial,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const rarityName =
    data.rarityNames[String(material.rarity)] ?? String(material.rarity);

  container.add(
    new Text(`${material.icon ?? ''} ${md.bold(material.name)}`.trim()),
    new Separator(),
  );

  const facts = new Text(
    `${md.bold(t.rarityLabel)} : ${rarityIcon(material.rarity)} ${rarityName}`.trim(),
  );
  facts.newLine(
    `${md.bold(t.typeLabel)} : ${TYPE_ICONS[material.type] ?? ''} ${typeLabel(context.locale, material.type)}`.trim(),
  );
  container.add(facts, new Separator());

  container.add(new Text(t.obtainLabel).size('small'));

  const obtain = data.obtainByMaterial.get(material.id);
  if (obtain) {
    if (obtain.smallEvents.length > 0) {
      container.add(
        new Text(
          `${SOURCE_ICONS.smallEvent} ${md.bold(t.sourceSmallEvent)} : ${terrainParts(context.locale, obtain.smallEvents)}`,
        ).size('subtle'),
      );
    }
    if (obtain.expeditions.length > 0) {
      container.add(
        new Text(
          `${SOURCE_ICONS.expedition} ${md.bold(t.sourceExpeditions)} : ${terrainParts(context.locale, obtain.expeditions)}`,
        ).size('subtle'),
      );
    }
    if (obtain.bosses.length > 0) {
      const parts = obtain.bosses
        .map((boss) =>
          `${boss.icon} ${boss.name} ${formatPercent(boss.chance)}`.trim(),
        )
        .join(', ');
      container.add(
        new Text(
          `${SOURCE_ICONS.boss} ${md.bold(t.sourceBosses)} : ${parts}`,
        ).size('subtle'),
      );
    }
    container.add(
      new Text(
        `${SOURCE_ICONS.compost} ${md.bold(t.sourceCompost)} : ${formatPercent(obtain.compostChance)}`,
      ).size('subtle'),
    );
    if (obtain.cooking) {
      container.add(
        new Text(
          `${SOURCE_ICONS.cooking} ${md.bold(t.sourceCooking)} : ${obtain.cooking.name} ${t.cookingRecipe(obtain.cooking.level, obtain.cooking.quantity)}`,
        ).size('subtle'),
      );
    }
  }

  appendBackButton(container, BACK_TO_MATERIALS_ID, t.backToMaterials, context);
}

/** Materials browsable by type: type → material → how to obtain it. */
export const materialsPage: HelpPage = {
  id: MATERIALS_PAGE_ID,
  authorization: 'privileged',
  icon: MATERIALS_ICON,

  loadData: async (locale) => ({
    materialsData: await loadMaterialsData(locale),
  }),
  hasData: (state) => state.materialsData !== undefined,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    const t = messages(context.locale);
    const container = createContainer('brand').add(
      new Text(`${MATERIALS_ICON} ${t.name}`).title(),
      new Text(t.intro).size('subtle'),
      new Separator(),
    );

    if (!state.materialsData) {
      const shared = helpMessages(context.locale);
      container.add(
        new Text(state.loadError ? shared.loadError : shared.loading).size(
          'subtle',
        ),
      );
      return container;
    }

    if (state.selectedType === undefined) {
      appendTypePicker(container, state.materialsData, context);
    } else if (state.selectedMaterialId === undefined) {
      appendMaterialPicker(
        container,
        state.materialsData,
        state.selectedType,
        state,
        context,
      );
    } else {
      const material = (
        state.materialsData.materialsByType.get(state.selectedType) ?? []
      ).find((entry) => entry.id === state.selectedMaterialId);
      if (material) {
        appendMaterialDetail(container, state.materialsData, material, context);
      } else {
        appendBackButton(
          container,
          BACK_TO_MATERIALS_ID,
          t.backToMaterials,
          context,
        );
      }
    }

    return container;
  },

  reduce(state: HelpState, interaction: MessageComponentInteraction) {
    if (interaction.isStringSelectMenu()) {
      const value = interaction.values[0];
      if (value === undefined) return state;
      if (interaction.customId === TYPE_SELECT_ID) {
        return {
          ...state,
          selectedType: value,
          selectedMaterialId: undefined,
          materialsPage: 0,
        };
      }
      if (interaction.customId === MATERIAL_SELECT_ID) {
        const id = Number(value);
        return Number.isInteger(id)
          ? { ...state, selectedMaterialId: id }
          : state;
      }
      return state;
    }

    if (interaction.isButton()) {
      const materials = state.selectedType
        ? (state.materialsData?.materialsByType.get(state.selectedType) ?? [])
        : [];
      const pageCount = materialPageCount(materials);
      switch (interaction.customId) {
        case MATERIALS_PREV_ID:
          return {
            ...state,
            materialsPage: Math.max(0, (state.materialsPage ?? 0) - 1),
          };
        case MATERIALS_NEXT_ID:
          return {
            ...state,
            materialsPage: clampPage((state.materialsPage ?? 0) + 1, pageCount),
          };
        case BACK_TO_TYPES_ID:
          return {
            ...state,
            selectedType: undefined,
            selectedMaterialId: undefined,
          };
        case BACK_TO_MATERIALS_ID:
          return { ...state, selectedMaterialId: undefined };
        default:
          return state;
      }
    }

    return state;
  },
};
