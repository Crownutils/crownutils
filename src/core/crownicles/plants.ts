import type { SupportedLocale } from '@/core/types.js';
import { cachePerLocale, cacheShared } from './cache.js';
import { getPlantNames } from './models.js';
import { fetchCrowniclesText, parseIconIdBlock } from './source.js';

/** One cooking plant, merging its localized name with its emote. */
export interface CrowniclesPlant {
  readonly id: number;
  readonly name: string;
  /** Unicode emote of the plant, or `undefined` if the source has none. */
  readonly icon: string | undefined;
}

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/** Plant emotes by id string, parsed from the game's icon source and cached. */
const getPlantIcons = cacheShared(async () =>
  parseIconIdBlock(await fetchCrowniclesText(ICONS_SOURCE_PATH), 'plants'),
);

/**
 * Every cooking plant for `locale`, cached per locale. Plants have no resource
 * directory of their own, so the id set is the one `models.json` names -- also
 * the only place their wording lives.
 */
export const getPlants = cachePerLocale(
  async (locale: SupportedLocale): Promise<readonly CrowniclesPlant[]> => {
    const [names, icons] = await Promise.all([
      getPlantNames(locale),
      getPlantIcons(),
    ]);
    return Object.entries(names)
      .map(([id, name]) => ({ id: Number(id), name, icon: icons[id] }))
      .filter((plant) => Number.isInteger(plant.id))
      .sort((a, b) => a.id - b.id);
  },
);
