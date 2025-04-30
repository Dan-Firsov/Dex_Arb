import { Graph, Edge } from './types';

export interface ArbitrageResult {
  cycle: number[];
  profit: number;
  source: number;
}

export function findArbitrageCycle(graph: Graph) {
  const V = graph.vertices.length;
  const EPS = 1e-8; // tolerance for relaxation

  // Хранение всех найденных циклов
  const results: ArbitrageResult[] = [];

  // Переменные для лучшего результата
  let bestResult: ArbitrageResult | null = null;
  let bestDist: number[] = [];
  let bestPred: number[] = [];

  // Перебор каждого источника
  for (let src = 0; src < V; src++) {
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
      if (!updated) break;
    }

    // Поиск отрицательных циклов
    for (const { from, to, weight } of graph.edges) {
      if (dist[from] + weight < dist[to] - EPS) {
        // Восстановление цикла из вершины to
        let cur = to;
        for (let i = 0; i < V; i++) {
          cur = pred[cur];
        }
        // теперь cur точно в цикле
        const start = cur;
        const cycle = [start];
        cur = pred[start];
        while (cur !== start) {
          cycle.push(cur);
          cur = pred[cur];
        }
        cycle.push(start);
        cycle.reverse();
        // Фильтрация тривиальных циклов A->B->A
        if (cycle.length <= 3) continue;

        // Дедупликация по множеству вершин
        if (
          results.some(
            (r) =>
              r.cycle.length === cycle.length &&
              new Set(r.cycle).size === new Set(cycle).size &&
              cycle.every((v) => r.cycle.includes(v)),
          )
        )
          continue;

        // Расчёт прибыли: exp(-sum(weights))
        let totalW = 0;
        for (let i = 0; i < cycle.length - 1; i++) {
          const e = graph.edges.find(
            (e) => e.from === cycle[i] && e.to === cycle[i + 1],
          )!;
          totalW += e.weight;
        }
        const profit = Math.exp(-totalW);

        // Логирование каждого найденного цикла
        console.log(
          `🚀 Arbitrage cycle found: ${cycle.map((i) => graph.vertices[i]).join(' -> ')} | profit: ${(profit - 1).toFixed(6)}`,
        );

        // Сохранение результата
        const result: ArbitrageResult = { cycle, profit, source: cycle[0] };
        results.push(result);

        // Обновление лучшего
        if (!bestResult || profit > bestResult.profit) {
          bestResult = result;
          bestDist = dist.slice();
          bestPred = pred.slice();
        }
      }
    }
  }

  // Вывод всех найденных циклов
  if (results.length > 0) {
    console.log('📋 All arbitrage cycles:');
    console.table(
      results.map((r) => ({
        source: graph.vertices[r.source],
        cycle: r.cycle.map((i) => graph.vertices[i]).join(' -> '),
        profit: (r.profit - 1).toFixed(6),
      })),
    );
  } else {
    console.log('❌ No arbitrage cycles detected.');
  }

  // Возврат только лучшего
  if (bestResult) {
    return {
      cycle: bestResult.cycle,
      distances: bestDist,
      predecessors: bestPred,
    };
  }

  return null;
}
