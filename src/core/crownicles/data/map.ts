import { loadMapTypeIcons } from './map-icons.js';
import {
  fetchCrowniclesJson,
  listCrowniclesDir,
  mapWithConcurrency,
} from './source.js';

/**
 * Locations of Crownicles
 */
export interface CrowniclesMapLocation {
  id: number;
  name: string;
  type: string;
  attribute: string | undefined;
  /** Unicode emote of the location type; undefined if not found. */
  icon: string | undefined;
}

/**
 * Link between 2 {@link CrowniclesMapLocation}
 */
export interface CrowniclesMapLink {
  startMap: number;
  endMap: number;
  tripDurationMin: number;
}

/**
 * Crownicles map
 */
export interface CrowniclesMap {
  locations: CrowniclesMapLocation[];
  links: CrowniclesMapLink[];
}

interface RawCrowniclesMapLocation {
  type: string;
  attribute?: string;
}

interface RawCrowniclesMapLink {
  startMap: number;
  endMap: number;
  tripDuration: number;
}

type CrowniclesMapLocationNames = Record<string, { name?: string }>;

const HTTP_CONCURRENCY = 10;
let mapPromise: Promise<CrowniclesMap> | undefined;

/** Parses `<id>.json` file names into a sorted list of numeric ids. */
function numericIds(fileNames: readonly string[]): number[] {
  return fileNames
    .map((file) => parseInt(file, 10))
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);
}

/** Assembles the full map: location names, type icons, and links. */
async function loadCrowniclesMap(): Promise<CrowniclesMap> {
  const [models, icons, locationFiles, linkFiles] = await Promise.all([
    fetchCrowniclesJson<{ map_locations?: CrowniclesMapLocationNames }>(
      'Lang/fr/models.json',
    ),
    loadMapTypeIcons(),
    listCrowniclesDir('Core/resources/mapLocations'),
    listCrowniclesDir('Core/resources/mapLinks'),
  ]);

  const names = models.map_locations ?? {};
  const locationIds = numericIds(locationFiles);
  const linkIds = numericIds(linkFiles);

  const [rawLocations, rawLinks] = await Promise.all([
    mapWithConcurrency(locationIds, HTTP_CONCURRENCY, (id) =>
      fetchCrowniclesJson<RawCrowniclesMapLocation>(
        `Core/resources/mapLocations/${id}.json`,
      ),
    ),
    mapWithConcurrency(linkIds, HTTP_CONCURRENCY, (id) =>
      fetchCrowniclesJson<RawCrowniclesMapLink>(
        `Core/resources/mapLinks/${id}.json`,
      ),
    ),
  ]);

  // The repo stores the trip duration (in minutes) under `tripDuration`.
  const links: CrowniclesMapLink[] = rawLinks.map(
    ({ startMap, endMap, tripDuration }) => ({
      startMap,
      endMap,
      tripDurationMin: tripDuration,
    }),
  );

  const locations: CrowniclesMapLocation[] = locationIds.map((id, index) => {
    const { type, attribute } = rawLocations[index]!;
    return {
      id,
      name: names[String(id)]?.name ?? '???',
      type,
      attribute,
      icon: icons[type],
    };
  });

  return {
    locations,
    links,
  };
}

/**
 * Returns the full map graph, fetched from the Crownicles repo on first access
 * and cached for the process lifetime. A failed load is not cached, so the next
 * call retries.
 */
export function getCrowniclesMapGraph(): Promise<CrowniclesMap> {
  mapPromise ??= loadCrowniclesMap().catch((error: unknown) => {
    mapPromise = undefined;
    throw error;
  });

  return mapPromise;
}

const CONTINENT_ATTRIBUTE = 'continent1';
let continentPromise: Promise<CrowniclesMap> | undefined;

/** Returns the largest connected component among `nodeIds`, found by BFS. */
function largestComponent(
  nodeIds: ReadonlySet<number>,
  edges: readonly CrowniclesMapLink[],
): Set<number> {
  const adjacency = new Map<number, number[]>();
  const connect = (from: number, to: number): void => {
    const neighbours = adjacency.get(from) ?? [];
    neighbours.push(to);
    adjacency.set(from, neighbours);
  };
  for (const edge of edges) {
    connect(edge.startMap, edge.endMap);
    connect(edge.endMap, edge.startMap);
  }

  const visited = new Set<number>();
  let largest = new Set<number>();
  for (const node of nodeIds) {
    if (visited.has(node)) continue;
    const component = new Set<number>([node]);
    const queue = [node];
    visited.add(node);
    while (queue.length > 0) {
      // BFS
      const current = queue.shift()!;
      for (const next of adjacency.get(current) ?? []) {
        if (!nodeIds.has(next) || visited.has(next)) continue;
        visited.add(next);
        component.add(next);
        queue.push(next);
      }
    }
    if (component.size > largest.size) largest = component;
  }
  return largest;
}

/**
 * Returns the main continent (`continent1`) as a graph, keeping only its
 * largest connected component so isolated stray nodes are dropped. Cached like
 * {@link getCrowniclesMapGraph}.
 */
export function getContinentGraph(): Promise<CrowniclesMap> {
  continentPromise ??= getCrowniclesMapGraph()
    .then((map) => {
      const continentIds = new Set(
        map.locations
          .filter((l) => l.attribute === CONTINENT_ATTRIBUTE)
          .map((l) => l.id),
      );

      const continentLinks = map.links.filter(
        (l) => continentIds.has(l.startMap) && continentIds.has(l.endMap),
      );
      const main = largestComponent(continentIds, continentLinks);

      return {
        locations: map.locations.filter((l) => main.has(l.id)),
        links: continentLinks.filter(
          (l) => main.has(l.startMap) && main.has(l.endMap),
        ),
      };
    })
    .catch((error: unknown) => {
      continentPromise = undefined;
      throw error;
    });

  return continentPromise;
}
