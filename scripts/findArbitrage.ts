// scripts/searchArbitrage.ts
import path from 'path';
import fs from 'fs';
import { findArbitrageCycle } from './utils/bellmanFord';
import { buildGraph } from './utils/graphBundler';
import { PoolData } from './types';
import { fetchPools } from './utils/fetchPools';

const runArbitrageSearch = async () => {
  await fetchPools();

  // Resolve path to pools.json in the same directory
  const poolsFile = path.resolve(__dirname, 'data', 'pools.json');
  const rawData = fs.readFileSync(poolsFile, 'utf-8');
  const raw = JSON.parse(rawData) as any[];

  // 1) Map JSON to PoolData, convert strings to numbers
  const pools: PoolData[] = raw.map((p) => ({
    ...p,
    reserve0: Number(p.reserve0),
    reserve1: Number(p.reserve1),
    price0to1: Number(p.price0to1),
    price1to0: Number(p.price1to0),
    out0to1: Number(p.out0to1),
    out1to0: Number(p.out1to0),
    liquidity: p.liquidity != null ? Number(p.liquidity) : undefined,
    fee: p.feeTier != null ? Number(p.feeTier) : undefined,
    version: p.subgraph.includes('V3') ? 'V3' : 'V2',
  }));

  // 2) Build graph and search for arbitrage cycle
  console.log('🔍 Building graph and searching for arbitrage cycle...');
  const graph = buildGraph(pools);
  const result = findArbitrageCycle(graph);

  if (!result) {
    console.log('❌ No arbitrage found.');
    return;
  }

  // Convert cycle indices to token symbols
  const cycleIdx = result.cycle;
  const cycle = cycleIdx.map((i) => graph.vertices[i]);

  // Determine base token for profit calculation
  const baseToken = cycle[0];

  // Ensure cycle is closed
  if (cycle[0] !== cycle[cycle.length - 1]) {
    console.log('⚠️ Cycle not closed:', cycle.join(' -> '));
    process.exit(1);
  }

  console.log(`✅ Arbitrage cycle detected: ${cycle.join(' -> ')}\n`);

  // 3) Simulate swaps along the cycle
  const initialAmount = 1;
  let amount = initialAmount;
  console.log(`💰 Starting simulation with ${initialAmount} ${baseToken}`);

  for (let i = 0; i < cycle.length - 1; i++) {
    const from = cycle[i];
    const to = cycle[i + 1];

    // Find the pool for this token pair
    const pool = pools.find(
      (p) =>
        (p.token0.symbol === from && p.token1.symbol === to) ||
        (p.token0.symbol === to && p.token1.symbol === from),
    )!;

    const { subgraph, id, version, feeTier } = pool;
    let amountOut: number;

    if (version === 'V2') {
      const inReserve =
        pool.token0.symbol === from ? pool.reserve0! : pool.reserve1!;
      const outReserve =
        pool.token0.symbol === from ? pool.reserve1! : pool.reserve0!;
      amountOut = getAmountOutV2(amount, inReserve, outReserve, 0.003);
    } else {
      const rate = pool.token0.symbol === from ? pool.out0to1 : pool.out1to0;
      amountOut = getAmountOutV3(amount, rate);
    }

    console.log(
      `🔄 [${subgraph}] Pool ${id} (${version}${
        version === 'V3' ? `, fee ${(feeTier! / 1e4).toFixed(2)}%` : ''
      }) ${from}→${to}: ${amount.toFixed(6)} → ${amountOut.toFixed(6)}`,
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

  // ---------- Swap functions ----------

  // Uniswap V2 constant-product AMM with 0.3% fee
};

function getAmountOutV2(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  fee: number,
): number {
  const inWithFee = amountIn * (1 - fee);
  return (inWithFee * reserveOut) / (reserveIn + inWithFee);
}

// Uniswap V3 approximate: amountIn * rate (rate includes fee)
function getAmountOutV3(amountIn: number, rate: number): number {
  return amountIn * rate;
}
runArbitrageSearch();
