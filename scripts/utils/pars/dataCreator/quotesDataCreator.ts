import fs from 'fs/promises';
import path from 'path';
import { ethers } from 'ethers';
import { PairData } from '../../algo/types';
import { QuoteResult } from '../../multiQuotes';

export const writeQuotesData = async (
  results: Record<string, QuoteResult>,
): Promise<PairData[]> => {
  const serializable = Object.values(results).map((result) => ({
    pair: result.pair,
    v2: result.v2
      ? ethers.formatUnits(result.v2, result.pair.token1.decimals)
      : undefined,
    v3: result.v3?.map((e) => ({
      fee: e.fee,
      amount: ethers.formatUnits(e.amount, result.pair.token1.decimals),
    })),
    error: result.error,
  }));

  const map = new Map<
    string,
    {
      pair: (typeof serializable)[0]['pair'];
      v2: { amount?: string; reverse?: string };
      v3: Array<{ fee: number; amount?: string; reverse?: string }>;
      error: any;
    }
  >();

  for (const item of serializable) {
    const { token0, token1 } = item.pair;
    const key = [token0.address, token1.address].sort().join('_');
    const isReversed = token0.address > token1.address;

    if (!item.v2 && !item.v3?.length) continue;

    if (!map.has(key)) {
      map.set(key, {
        pair: !isReversed
          ? { token0, token1 }
          : { token0: token1, token1: token0 },
        v2: { amount: undefined, reverse: undefined },
        v3: [],
        error: null,
      });
    }

    const entry = map.get(key)!;

    entry.v2.amount = item.v2;
    entry.v2.reverse = item.v2 ? String(1 / Number(item.v2)) : undefined;

    entry.error = item.error;

    entry.v3 =
      item.v3?.map((e) => ({
        fee: e.fee,
        amount: e.amount,
        reverse: String(1 / Number(e.amount)),
      })) ?? [];
  }

  const pairQuotesData: PairData[] = Array.from(map.values());

  fs.writeFile(
    path.resolve(__dirname, '../../../data/pairQuotesData.json'),
    JSON.stringify(pairQuotesData, null, 2),
  );
  return pairQuotesData;
};
