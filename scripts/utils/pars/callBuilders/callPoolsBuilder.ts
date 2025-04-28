import { ContractCallContext } from 'ethereum-multicall';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';

export interface PoolInfo {
  version: 'v2' | 'v3';
  poolAddress: string;
  token0: { address: string; symbol: string; decimals: number };
  token1: { address: string; symbol: string; decimals: number };
  fee?: number;
}

export function buildPoolsCallContexts(poolsInfo: PoolInfo[]): {
  contexts: ContractCallContext[];
  poolByRef: Record<string, PoolInfo>;
} {
  const contexts: ContractCallContext[] = [];
  const poolByRef: Record<string, PoolInfo> = {};

  for (const pool of poolsInfo) {
    const prefix = pool.version === 'v2' ? 'v2' : 'v3';
    const feePart = pool.version === 'v3' ? `-${pool.fee}` : '';
    const ref = `${prefix}-${pool.token0.symbol}-${pool.token1.symbol}${feePart}-${pool.poolAddress}`;

    poolByRef[ref] = pool;
    contexts.push({
      reference: ref,
      contractAddress: pool.poolAddress,
      abi: pool.version === 'v2' ? IUniswapV2Pair.abi : IUniswapV3Pool.abi,
      calls: [
        {
          reference: pool.version === 'v2' ? 'getReserves' : 'slot0',
          methodName: pool.version === 'v2' ? 'getReserves' : 'slot0',
          methodParameters: [],
        },
      ],
    });
  }
  return { contexts, poolByRef };
}
