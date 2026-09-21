import type { MessageComponentInteraction } from 'discord.js';
import {
  MATERIAL_TYPES,
  type CrowniclesMaterial,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { type Container, Separator, Text } from '@/discord/components/index.js';
import { formatPercent } from '@/discord/lang/number.js';
import { withIcon } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import {
  loadMaterialsData,
  type CrowniclesMaterialsData,
  type MaterialExpeditionSource,
} from '../data/materials.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';
import {
  appendBackButton,
  appendLoadFallback,
  appendPaginationControls,
  appendPickerStep,
  clampPage,
  createHelpPageContainer,
  helpMessages,
  pickerPage,
  pickerPageCount,
} from '../crownicles-help.ui.js';
import {
  expeditionIcons,
  materialRarityIcons,
  materialSourceIcons,
  materialTypeIcons,
  pageIcons,
} from '../icons.js';

/** Router id of the materials page. */
export const MATERIALS_PAGE_ID = 'materials';

const MATERIALS_ICON = pageIcons.materials;

const TYPE_SELECT_ID = 'chelp-mat-type';
const MATERIAL_SELECT_ID = 'chelp-material';
const MATERIALS_PREV_ID = 'chelp-mat-prev';
const MATERIALS_NEXT_ID = 'chelp-mat-next';
const BACK_TO_TYPES_ID = 'chelp-mat-back-types';
const BACK_TO_MATERIALS_ID = 'chelp-mat-back-materials';

/**
 * How many recyclable equipments the scrap-dealer line names. A common material
 * is scrapped out of dozens of items, so only the richest recycles are worth a
 * line; the rest are summed up as a count.
 */
const SCRAP_SOURCES_SHOWN = 3;
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
      withIcon(
        expeditionIcons[entry.terrain],
        `${terrainLabel(locale, entry.terrain)} ${formatPercent(locale, entry.chance)}`,
      ),
    )
    .join(', ');
}

function rarityIcon(rarity: number): string {
  return materialRarityIcons[rarity] ?? '';
}

/** Step 1: the type picker, listing each type and its material count. */
function appendTypePicker(
  container: Container,
  data: CrowniclesMaterialsData,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  appendPickerStep(container, {
    selectId: TYPE_SELECT_ID,
    placeholder: t.typePlaceholder,
    disabled: context.disabled,
    entries: MATERIAL_TYPES.map((type) => {
      const count = data.materialsByType.get(type)?.length ?? 0;
      return {
        line: `${typeLabel(context.locale, type)} (${count})`,
        label: typeLabel(context.locale, type),
        value: type,
        icon: materialTypeIcons[type],
      };
    }),
  });
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

  const { page, pageCount, slice } = pickerPage(materials, state.materialsPage);

  appendPickerStep(container, {
    selectId: MATERIAL_SELECT_ID,
    placeholder: t.materialPlaceholder,
    disabled: context.disabled,
    entries: slice.map((material) => ({
      line: `${material.name} ${rarityIcon(material.rarity)}`.trimEnd(),
      label: material.name,
      value: String(material.id),
      description: data.rarityNames[String(material.rarity)],
      icon: material.icon,
    })),
  });

  appendPaginationControls(container, {
    page,
    pageCount,
    prevId: MATERIALS_PREV_ID,
    nextId: MATERIALS_NEXT_ID,
    indicator: t.pageIndicator,
    previousLabel: t.previous,
    nextLabel: t.next,
    disabled: context.disabled,
  });

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
    new Text(material.name).bold().icon(material.icon),
    new Separator(),
  );

  const facts = new Text(
    `${md.bold(t.rarityLabel)} : ${withIcon(rarityIcon(material.rarity), rarityName)}`,
  );
  facts.newLine(
    `${md.bold(t.typeLabel)} : ${withIcon(
      materialTypeIcons[material.type],
      typeLabel(context.locale, material.type),
    )}`,
  );
  container.add(facts, new Separator());

  container.add(new Text(t.obtainLabel).size('small'));

  const obtain = data.obtainByMaterial.get(material.id);
  if (obtain) {
    if (obtain.smallEvents.length > 0) {
      container.add(
        new Text(
          `${md.bold(t.sourceSmallEvent)} : ${terrainParts(context.locale, obtain.smallEvents)}`,
        )
          .icon(materialSourceIcons.smallEvent)
          .size('subtle'),
      );
    }
    if (obtain.expeditions.length > 0) {
      container.add(
        new Text(
          `${md.bold(t.sourceExpeditions)} : ${terrainParts(context.locale, obtain.expeditions)}`,
        )
          .icon(materialSourceIcons.expedition)
          .size('subtle'),
      );
    }
    if (obtain.bosses.length > 0) {
      const parts = obtain.bosses
        .map((boss) =>
          withIcon(
            boss.icon,
            `${boss.name} ${formatPercent(context.locale, boss.chance)}`,
          ),
        )
        .join(', ');
      container.add(
        new Text(`${md.bold(t.sourceBosses)} : ${parts}`)
          .icon(materialSourceIcons.boss)
          .size('subtle'),
      );
    }
    if (obtain.compost.length > 0) {
      const parts = obtain.compost
        .map((plant) =>
          withIcon(
            plant.icon,
            `${plant.name} ${formatPercent(context.locale, plant.chance)}`,
          ),
        )
        .join(', ');
      container.add(
        new Text(`${md.bold(t.sourceCompost)} : ${parts}`)
          .icon(materialSourceIcons.compost)
          .size('subtle'),
      );
    }
    if (obtain.scrapDealer.length > 0) {
      const shown = obtain.scrapDealer.slice(0, SCRAP_SOURCES_SHOWN);
      const parts = shown
        .map((entry) =>
          withIcon(
            entry.icon,
            t.scrapItem(entry.name, entry.quantity, entry.level),
          ),
        )
        .join(', ');
      const hidden = obtain.scrapDealer.length - shown.length;
      container.add(
        new Text(
          `${md.bold(t.sourceScrapDealer)} : ${parts}${hidden > 0 ? ` ${t.scrapMore(hidden)}` : ''}`,
        )
          .icon(materialSourceIcons.scrapDealer)
          .size('subtle'),
      );
    }
    if (obtain.cooking) {
      container.add(
        new Text(
          `${md.bold(t.sourceCooking)} : ${obtain.cooking.name} ${t.cookingRecipe(obtain.cooking.level, obtain.cooking.quantity)}`,
        )
          .icon(materialSourceIcons.cooking)
          .size('subtle'),
      );
    }
  }

  appendBackButton(container, BACK_TO_MATERIALS_ID, t.backToMaterials, context);
}

/** Materials browsable by type: type -> material -> how to obtain it. */
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
    const container = createHelpPageContainer(MATERIALS_ICON, t.name, t.intro);

    if (!state.materialsData) {
      appendLoadFallback(container, state, context.locale);
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
      const pageCount = pickerPageCount(materials.length);
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
