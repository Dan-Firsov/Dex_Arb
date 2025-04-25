import { PoolData, Graph, Edge } from '../types';

export function buildGraph(pools: PoolData[], minLiquidity = 100): Graph {
  // 1) Отфильтровать нерелевантные пулы
  const valid = pools.filter(
    (p) =>
      p.out0to1 > 0 &&
      p.out1to0 > 0 &&
      (!p.liquidity || p.liquidity >= minLiquidity) &&
      Math.abs(p.price0to1 - p.out0to1) < 0.1 * p.price0to1,
  );

  // 2) Собрать все токены
  const tokenSet = new Set<string>();
  valid.forEach((p) => {
    tokenSet.add(p.token0.symbol);
    tokenSet.add(p.token1.symbol);
  });
  const vertices = Array.from(tokenSet);
  const indexOf: Record<string, number> = {};
  vertices.forEach((s, i) => {
    indexOf[s] = i;
  });

  // 3) Сформировать рёбра
  const edges: Edge[] = [];
  valid.forEach((p) => {
    const u = indexOf[p.token0.symbol];
    const v = indexOf[p.token1.symbol];
    edges.push({ from: u, to: v, weight: -Math.log(Number(p.out0to1)) });
    edges.push({ from: v, to: u, weight: -Math.log(Number(p.out1to0)) });
  });

  return { vertices, edges };
}
