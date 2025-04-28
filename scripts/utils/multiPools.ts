import * as dotenv from 'dotenv';
dotenv.config();
import { MULTICALLV3 } from '../../constants/contracts';
import { Multicall } from 'ethereum-multicall';
import { PoolData } from './algo/types';
import {
  buildPoolsCallContexts,
  PoolInfo,
} from './pars/callBuilders/callPoolsBuilder';
import poolsInfo from '../data/poolsInfo.json';
import { formatUnits } from 'ethers';
import { calcV2, calcV3 } from '../../calculators/calcV2V3';
import { writePoolsData } from './pars/dataCreator/poolsDataCreator';

export const multiFetchAllPoolsQuote = async (): Promise<PoolData[]> => {
  console.log('⏳ Starting fetch quotes...');
  const startTime = Date.now();

  const multicall = new Multicall({
    nodeUrl: process.env.BASE_RPC_URL!,
    tryAggregate: true,
    multicallCustomContractAddress: MULTICALLV3,
  });

  const { contexts, poolByRef } = buildPoolsCallContexts(
    poolsInfo as PoolInfo[],
  );

  const { results } = await multicall.call(contexts);

  const allData: Array<{
    version: 'v2' | 'v3';
    poolAddress: string;
    token0: { symbol: string; decimals: number };
    token1: { symbol: string; decimals: number };
    reserves?: { reserve0: string; reserve1: string };
    sqrtPriceX96?: bigint;
    feeTier?: number;
    price0to1: number;
    price1to0: number;
    out0to1: number;
    out1to0: number;
    fee: number;
  }> = [];
  for (const [ref, context] of Object.entries(results)) {
    const pool = poolByRef[ref];
    const ret = context.callsReturnContext[0];
    if (!ret.success) {
      console.warn(`❌ call ${ref} failed`);
      continue;
    }

    if (pool.version === 'v2') {
      const [h0, h1] = ret.returnValues.map((r) => r.hex);
      const reserve0 = formatUnits(BigInt(h0), pool.token0.decimals);
      const reserve1 = formatUnits(BigInt(h1), pool.token1.decimals);

      allData.push({
        version: 'v2',
        poolAddress: pool.poolAddress,
        token0: { symbol: pool.token0.symbol, decimals: pool.token0.decimals },
        token1: { symbol: pool.token1.symbol, decimals: pool.token1.decimals },
        reserves: { reserve0, reserve1 },
        ...calcV2({ reserve0, reserve1 }, 1),
      });
    } else {
      const sqrtPriceX96 = BigInt(ret.returnValues[0].hex);
      const feeTier = pool.fee!;

      allData.push({
        version: 'v3',
        poolAddress: pool.poolAddress,
        token0: { symbol: pool.token0.symbol, decimals: pool.token0.decimals },
        token1: { symbol: pool.token1.symbol, decimals: pool.token1.decimals },
        sqrtPriceX96,
        feeTier,
        ...calcV3(
          { sqrtPriceX96, token0: pool.token0, token1: pool.token1, feeTier },
          1,
        ),
      });
    }
  }

  const poolsData = await writePoolsData(allData);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Finished fetch quotes in ${duration}s,`);

  return poolsData;
};
