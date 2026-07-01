import { buildAdjacency } from '../calculators/graph.js';
import { loadMapTypeIcons } from './map-icons.js';
import {
  HTTP_CONCURRENCY,
  cachedPromise,
  fetchCrowniclesJson,
  listCrowniclesDir,
  mapWithConcurrency,
  numericIds,
} from './source.js';

/** A location on the Crownicles map: a node of the travel graph. */
export interface CrowniclesMapLocation {
  id: number;
  name: string;
  type: string;
  attribute: string | undefined;
  /** Unicode emote of the location type; undefined if not found. */
  icon: string | undefined;
}

/** A travel link between two locations, weighted by its trip duration. */
export interface CrowniclesMapLink {
  startMap: number;
  endMap: number;
  tripDurationMin: number;
}

/** The Crownicles map as a graph: its locations and the links between them. */
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
const getCrowniclesMapGraph = cachedPromise<CrowniclesMap>(loadCrowniclesMap);

const CONTINENT_ATTRIBUTE = 'continent1';

/** Returns the largest connected component among `nodeIds`, found by BFS. */
function largestComponent(
  nodeIds: ReadonlySet<number>,
  edges: readonly CrowniclesMapLink[],
): Set<number> {
  const adjacency = buildAdjacency(edges);

  const visited = new Set<number>();
  let largest = new Set<number>();
  for (const node of nodeIds) {
    if (visited.has(node)) continue;
    const component = new Set<number>([node]);
    const queue = [node];
    visited.add(node);
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const { to: next } of adjacency.get(current) ?? []) {
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
export const getContinentGraph = cachedPromise<CrowniclesMap>(() =>
  getCrowniclesMapGraph().then((map) => {
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
  }),
);
