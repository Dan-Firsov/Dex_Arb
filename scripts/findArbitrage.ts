import { findArbitrageCycle } from './utils/algo/bellmanFord';
import { buildGraph } from './utils/algo/graphBundler';
import { multiFetchAllPoolsQuote } from './utils/multiPools';
import { multiFetchAllQuotes } from './utils/multiQuotes';

const runArbitrageSearch = async () => {
  const poolsData = await multiFetchAllPoolsQuote();

  console.log('🔍 Building graph and searching for arbitrage cycle...');
  const graph = buildGraph(poolsData);
  const result = findArbitrageCycle(graph);

  if (!result) return;

  const cycleIdx = result.cycle;
  const cycle = cycleIdx.map((i) => graph.vertices[i]);

  const baseToken = cycle[0];

  if (cycle[0] !== cycle[cycle.length - 1]) {
    console.log('⚠️ Cycle not closed:', cycle.join(' -> '));
    process.exit(1);
  }

  console.log(`✅ Arbitrage cycle detected: ${cycle.join(' -> ')}\n`);

  const initialAmount = 1;
  let amount = initialAmount;
  console.log(`💰 Starting simulation with ${initialAmount} ${baseToken}`);

  for (let i = 0; i < cycle.length - 1; i++) {
    const from = cycle[i];
    const to = cycle[i + 1];

    const poolData = poolsData.find(
      (data) =>
        (data.token0.symbol === from && data.token1.symbol === to) ||
        (data.token0.symbol === to && data.token1.symbol === from),
    )!;
    if (!poolData) {
      console.log(`⚠️ Pool data not found for pair ${from}→${to}`);
      continue;
    }
    let amountOut: number;
    if (poolData.token0.symbol === from && poolData.token1.symbol === to) {
      amountOut = amount * poolData.out0to1;
    } else {
      amountOut = amount * poolData.out1to0;
    }

    console.log(
      `🔄 Pool ${from}→${to}, ${poolData.version}, ${poolData.feeTier}: ${amount.toFixed(6)} → ${amountOut.toFixed(6)}`,
    );

    amount = amountOut;
  }

  const profit = amount - initialAmount;
  const profitPct = (profit / initialAmount) * 100;
  console.log(
    `\n📊 Simulation result (${baseToken}):\n` +
      `   Start:  ${initialAmount.toFixed(6)} ${baseToken}\n` +
      `   End:    ${amount.toFixed(6)} ${baseToken}\n` +
      `   Profit: ${profit.toFixed(6)} ${baseToken} (${profitPct.toFixed(2)}%)\n`,
  );
};

runArbitrageSearch();
