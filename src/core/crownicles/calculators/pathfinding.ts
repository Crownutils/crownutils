import type { CrowniclesMapLink } from '../data/map.js';

/** A route: ordered location ids from start to end, with its total duration. */
export interface ShortestPath {
  steps: number[];
  totalDurationMin: number;
}

/**
 * Shortest route between `start` and `end` via Dijkstra over `edges`, each
 * treated as bidirectional. Returns `undefined` if `end` is unreachable.
 */
export function findShortestPath(
  edges: readonly CrowniclesMapLink[],
  start: number,
  end: number,
): ShortestPath | undefined {
  const adjacency = new Map<number, { to: number; weight: number }[]>();
  const link = (from: number, to: number, weight: number): void => {
    const neighbours = adjacency.get(from) ?? [];
    neighbours.push({ to, weight });
    adjacency.set(from, neighbours);
  };
  for (const edge of edges) {
    link(edge.startMap, edge.endMap, edge.tripDurationMin);
    link(edge.endMap, edge.startMap, edge.tripDurationMin);
  }

  const distance = new Map<number, number>([[start, 0]]);
  const previous = new Map<number, number>();
  const visited = new Set<number>();

  for (;;) {
    let current: number | undefined;
    let best = Infinity;
    for (const [node, dist] of distance) {
      if (!visited.has(node) && dist < best) {
        best = dist;
        current = node;
      }
    }
    if (current === undefined || current === end) break;
    visited.add(current);

    for (const { to, weight } of adjacency.get(current) ?? []) {
      if (visited.has(to)) continue;
      const candidate = best + weight;
      if (candidate < (distance.get(to) ?? Infinity)) {
        distance.set(to, candidate);
        previous.set(to, current);
      }
    }
  }

  const total = distance.get(end);
  if (total === undefined) return undefined;

  const steps: number[] = [];
  let node: number | undefined = end;
  while (node !== undefined) {
    steps.unshift(node);
    node = previous.get(node);
  }
  if (steps[0] !== start) return undefined;
  return { steps, totalDurationMin: total };
}
