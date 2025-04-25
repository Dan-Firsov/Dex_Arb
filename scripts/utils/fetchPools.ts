import pLimit from 'p-limit';
import * as dotenv from 'dotenv';
import fs from 'fs';
import { TOKENS } from '../../test/utils/constants';
import { writeFile } from 'fs/promises';
import path from 'path';

dotenv.config();

const limit = pLimit(20);

const SUBGRAPHS = [
  { name: 'UniswapV3', url: process.env.SUBGRAPH_UNISWAP_V3! },
  { name: 'UniswapV2', url: process.env.SUBGRAPH_UNISWAP_V2! },

  { name: 'SushiswapV3', url: process.env.SUBGRAPH_SUSHI_V3! },
  { name: 'BalancerV3', url: process.env.SUBGRAPH_BALANCER_V3! },
  { name: 'PancakeV3', url: process.env.SUBGRAPH_PANCAKE_V3! },
  { name: 'SolidlyV3', url: process.env.SUBGRAPH_SOLIDLY_V3! },
  { name: 'SushiswapV2', url: process.env.SUBGRAPH_SUSHI_V2! },
  { name: 'BalancerV2', url: process.env.SUBGRAPH_BALANCER_V2! },
];

const MIN_TVL_ETH = 0.01;
const MIN_LIQUIDITY_RAW = BigInt('100000000000');
const tokenAddrs = TOKENS.map((t) => t.address.toLowerCase());

const QUERIES = {
  V3: `
    query Pools($tokens: [String!]!) {
      pools(
        first: 500,
        orderBy: totalValueLockedETH,
        orderDirection: desc,
        where: {
          token0_in: $tokens,
          token1_in: $tokens,
          totalValueLockedETH_gt: ${MIN_TVL_ETH}
        }
      ) {
        id
        token0 { symbol decimals }
        token1 { symbol decimals }
        feeTier
        liquidity
        sqrtPrice
        totalValueLockedETH
      }
    }`,
  V3_FALLBACK: `
    query Pools($tokens: [String!]!) {
      pools(
        first: 500,
        orderBy: liquidity,
        orderDirection: desc,
        where: {
          token0_in: $tokens,
          token1_in: $tokens
        }
      ) {
        id
        token0 { symbol decimals }
        token1 { symbol decimals }
        feeTier
        liquidity
        sqrtPrice
      }
    }`,
  V2: `
    query Pairs($tokens: [String!]!) {
      pairs(
        first: 500,
        orderBy: reserveETH,
        orderDirection: desc,
        where: {
          token0_in: $tokens,
          token1_in: $tokens,
          reserveETH_gt: ${MIN_TVL_ETH}
        }
      ) {
        id
        token0 { symbol decimals }
        token1 { symbol decimals }
        reserve0
        reserve1
        reserveETH
      }
    }`,
};

async function queryGraphQL(endpoint: string, query: string, variables: any) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) {
      console.error(`❌ GraphQL errors from ${endpoint}:`, json.errors);
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(`❌ Network error querying ${endpoint}:`, err);
    return null;
  }
}

// 4) Price calculators
function calcV2(pair: any, amountIn = 1) {
  const r0 = Number(pair.reserve0);
  const r1 = Number(pair.reserve1);
  const price0to1 = r1 / r0;
  const price1to0 = r0 / r1;
  const fee = 0.003;
  const out0to1 = (amountIn * (1 - fee) * r1) / (r0 + amountIn * (1 - fee));
  const out1to0 = (amountIn * (1 - fee) * r0) / (r1 + amountIn * (1 - fee));
  return { price0to1, price1to0, out0to1, out1to0 };
}

function calcV3(pool: any, amountIn = 1) {
  const sqrtPriceX96 = BigInt(pool.sqrtPrice);
  const sqrtP = Number(sqrtPriceX96) / 2 ** 96;

  const rawPrice = sqrtP * sqrtP;

  const d0 = pool.token0.decimals,
    d1 = pool.token1.decimals;
  const price0to1 = (rawPrice * 10 ** d0) / 10 ** d1;
  const price1to0 = 1 / price0to1;

  const fee = pool.feeTier / 1e6;

  const out0to1 = price0to1 * amountIn * (1 - fee);
  const out1to0 = price1to0 * amountIn * (1 - fee);

  return { price0to1, price1to0, out0to1, out1to0, fee: pool.feeTier };
}

export const fetchPools = async () => {
  const allResults: any[] = [];

  for (const sub of SUBGRAPHS) {
    const isV3 = sub.name.includes('V3');
    const mainQ = isV3 ? QUERIES.V3 : QUERIES.V2;
    const fallbackQ = isV3 ? QUERIES.V3_FALLBACK : null;

    console.log(`⏳ Fetching ${sub.name} (main)`);
    let data = await limit(() =>
      queryGraphQL(sub.url, mainQ, { tokens: tokenAddrs }),
    );

    if (isV3 && !data && fallbackQ) {
      console.log(`🔄 Fallback to raw-liquidity query for ${sub.name}`);
      data = await limit(() =>
        queryGraphQL(sub.url, fallbackQ, { tokens: tokenAddrs }),
      );
    }
    if (!data) {
      console.warn(`❌ No data for ${sub.name}, skipping`);
      continue;
    }

    const items = isV3 ? data.pools : data.pairs;
    if (!Array.isArray(items)) {
      console.warn(`⚠️ Unexpected items for ${sub.name}`);
      continue;
    }

    for (const item of items) {
      if (
        isV3 &&
        !item.totalValueLockedETH &&
        BigInt(item.liquidity) < MIN_LIQUIDITY_RAW
      ) {
        continue;
      }
      const result = isV3 ? calcV3(item) : calcV2(item);
      if (!result) continue;

      if (isV3) {
        console.log(
          `🔵 [${sub.name}] Pool ${item.id}: fee=${((result as any).fee as number) / 10000}%, ` +
            `${item.token0.symbol}->${item.token1.symbol} price=${(result.price0to1 as number).toFixed(6)}, ` +
            `reverse=${(result.price1to0 as number).toFixed(6)}`,
        );
      } else {
        console.log(
          `🟢 [${sub.name}] Pair ${item.id}: ` +
            `${item.token0.symbol}->${item.token1.symbol} price=${(result.price0to1 as number).toFixed(6)}, ` +
            `reverse=${(result.price1to0 as number).toFixed(6)}`,
        );
      }

      allResults.push({ subgraph: sub.name, ...item, ...result });
    }
  }

  const poolsPath = path.join(__dirname, '../', 'data', 'pools.json');
  await writeFile(poolsPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`✅ Saved pools.json with ${allResults.length} entries`);
};
