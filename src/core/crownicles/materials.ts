import type { SupportedLocale } from '@/core/types.js';
import { cachePerLocale, cacheShared } from './cache.js';
import { getMaterialNames } from './models.js';
import {
  extractIconBlock,
  fetchCrowniclesJson,
  fetchCrowniclesText,
  HTTP_CONCURRENCY,
  listCrowniclesDir,
  mapWithConcurrency,
  numericIds,
} from './source.js';

/** The ten thematic material types, in display order. */
export const MATERIAL_TYPES = [
  'metal',
  'alloy',
  'nature',
  'spiritual',
  'magic',
  'leather',
  'rope',
  'poison',
  'explosive',
  'wood',
] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];

/** One crafting material, merging its stats with its localized name and emote. */
export interface CrowniclesMaterial {
  readonly id: number;
  readonly name: string;
  /** Rarity level, `1` (common) to `3` (rare). */
  readonly rarity: number;
  /** Thematic type; one of {@link MATERIAL_TYPES}. */
  readonly type: string;
  /** Unicode emote of the material, or `undefined` if the source has none. */
  readonly icon: string | undefined;
}

/** Raw `Core/resources/materials/<id>.json` shape. */
interface RawMaterial {
  readonly rarity: number;
  readonly type: string;
}

const MATERIALS_DIR = 'Core/resources/materials';
const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/** Parses the flat `materials` emote block (`<id>: "<emote>"`) of the icon source. */
function parseMaterialIcons(source: string): Record<string, string> {
  const block = extractIconBlock(source, 'materials');
  const icons: Record<string, string> = {};
  if (block === undefined) return icons;
  for (const pair of block.matchAll(/(\d+):\s*"([^"\\]*)"/g)) {
    icons[pair[1]!] = pair[2]!;
  }
  return icons;
}

/** Material emotes by id string, parsed from the game's icon source and cached. */
const getMaterialIcons = cacheShared(async () =>
  parseMaterialIcons(await fetchCrowniclesText(ICONS_SOURCE_PATH)),
);

/** Fetches every material with its `locale` name, rarity, type and emote. */
async function loadMaterials(
  locale: SupportedLocale,
): Promise<CrowniclesMaterial[]> {
  const [names, files, icons] = await Promise.all([
    getMaterialNames(locale),
    listCrowniclesDir(MATERIALS_DIR),
    getMaterialIcons(),
  ]);
  const ids = numericIds(files);

  const raw = await mapWithConcurrency(ids, HTTP_CONCURRENCY, (id) =>
    fetchCrowniclesJson<RawMaterial>(`${MATERIALS_DIR}/${id}.json`),
  );

  return ids.map((id, index) => ({
    id,
    name: names[String(id)] ?? '???',
    rarity: raw[index]!.rarity,
    type: raw[index]!.type,
    icon: icons[String(id)],
  }));
}

/** Every material for `locale`, cached per locale (see {@link cachePerLocale}). */
export const getMaterials = cachePerLocale(loadMaterials);
