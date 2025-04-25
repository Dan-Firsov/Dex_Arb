import { Graph } from '../types';

export function findArbitrageCycle(graph: Graph) {
  const V = graph.vertices.length;
  const EPS = 1e-8; // tolerance for relaxation

  // Try each vertex as the source
  for (let src = 0; src < V; src++) {
    console.log(
      `✨ Starting Bellman-Ford from vertex ${src} (${graph.vertices[src]}) ...`,
    );

    const dist = Array<number>(V).fill(Infinity);
    const pred = Array<number>(V).fill(-1);
    dist[src] = 0;

    // Relax edges V-1 times
    for (let i = 0; i < V - 1; i++) {
      let updated = false;
      for (const { from, to, weight } of graph.edges) {
        if (dist[from] + weight < dist[to] - EPS) {
          dist[to] = dist[from] + weight;
          pred[to] = from;
          updated = true;
        }
      }
      if (!updated) break; // no updates in this iteration → stop early
    }

    // Check for negative cycles
    for (const { from, to, weight } of graph.edges) {
      if (dist[from] + weight < dist[to] - EPS) {
        // Found a cycle, reconstruct it
        const cycle: number[] = [];
        let cur = to;
        const seen = new Set<number>();

        // Walk predecessors until we see a repeat
        while (!seen.has(cur)) {
          seen.add(cur);
          cur = pred[cur];
        }
        const start = cur;
        do {
          cycle.push(cur);
          cur = pred[cur];
        } while (cur !== start);
        cycle.push(start);
        cycle.reverse();

        // Filter out trivial two-edge cycles
        if (cycle.length <= 3) continue;

        console.log(
          `🚀 Arbitrage cycle found: ${cycle.map((i) => graph.vertices[i]).join(' -> ')}`,
        );
        return { cycle, distances: dist, predecessors: pred };
      }
    }
  }

  console.log('❌ No arbitrage cycles detected.');
  return null;
}
