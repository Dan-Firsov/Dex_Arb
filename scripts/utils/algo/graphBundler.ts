import { Edge, Graph, PoolData } from './types';

export function buildGraph(pools: PoolData[]): Graph {
  // 2) Собрать все токены
  const tokenSet = new Set<string>();
  for (const p of pools) {
    tokenSet.add(p.token0.symbol);
    tokenSet.add(p.token1.symbol);
  }
  const vertices = Array.from(tokenSet);

  const indexOf: Record<string, number> = {};
  vertices.forEach((symbol, index) => {
    indexOf[symbol] = index;
  });

  // 3) Сформировать рёбра
  const edges: Edge[] = [];

  for (const p of pools) {
    const u = indexOf[p.token0.symbol];
    const v = indexOf[p.token1.symbol];

    if (p.price0to1 > 0) {
      edges.push({ from: u, to: v, weight: -Math.log(p.out0to1) });
    }
    if (p.price1to0 > 0) {
      edges.push({ from: v, to: u, weight: -Math.log(p.out1to0) });
    }
  }
  return { vertices, edges };
}
