export interface V2Pair {
  reserve0: string;
  reserve1: string;
}

export interface V3Pool {
  sqrtPriceX96: bigint;
  token0: { decimals: number };
  token1: { decimals: number };
  feeTier: number;
}

export function calcV2(pair: V2Pair, amountIn = 1) {
  const r0 = Number(pair.reserve0);
  const r1 = Number(pair.reserve1);
  const fee = 0.003;

  const price0to1 = r1 / r0;
  const price1to0 = r0 / r1;

  const netIn = amountIn * (1 - fee);
  const out0to1 = (netIn * r1) / (r0 + netIn);
  const out1to0 = (netIn * r0) / (r1 + netIn);

  return { price0to1, price1to0, out0to1, out1to0, fee };
}

export function calcV3(pool: V3Pool, amountIn = 1) {
  const sqrtX96 = BigInt(pool.sqrtPriceX96);
  const sqrtP = Number(sqrtX96) / 2 ** 96;
  const rawPrice = sqrtP * sqrtP;

  const scale0 = 10 ** pool.token0.decimals;
  const scale1 = 10 ** pool.token1.decimals;
  const price0to1 = (rawPrice * scale0) / scale1;
  const price1to0 = 1 / price0to1;

  const fee = pool.feeTier / 1e6;

  const netIn = amountIn * (1 - fee);
  const out0to1 = price0to1 * netIn;
  const out1to0 = price1to0 * netIn;

  return { price0to1, price1to0, out0to1, out1to0, fee };
}
