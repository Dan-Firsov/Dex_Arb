import * as dotenv from 'dotenv';
dotenv.config();
import { MULTICALLV3 } from '../../constants/contracts';
import {
  TokenPairs,
  buildQuotesCallContexts,
} from './pars/callBuilders/callQuotesBuilder';
import tokenPairs from '../data/tokenPairs.json';
import { Multicall } from 'ethereum-multicall';
import { PairData } from './algo/types';
import { writeQuotesData } from './pars/dataCreator/quotesDataCreator';
import { provider } from './pars/providers';

export const V3_FEES = [100, 500, 3000, 10000];

export interface QuoteResult {
  pair: TokenPairs;
  v2?: bigint;
  v3?: { fee: number; amount: bigint }[];
  error?: string;
}

const amountInValue = '1';
export const multiFetchAllQuotes = async (): Promise<PairData[]> => {
  console.log('⏳ Starting fetch quotes...');
  const startTime = Date.now();

  const multicall = new Multicall({
    nodeUrl: process.env.BASE_RPC_URL!,
    tryAggregate: true,
    multicallCustomContractAddress: MULTICALLV3,
  });

  const contexts = buildQuotesCallContexts(tokenPairs, amountInValue);
  const multicallResults = await multicall.call(contexts);

  const results: Record<string, QuoteResult> = {};

  for (const context of contexts) {
    const callReference = context.reference;
    const pairKey = `${context.pair.token0.symbol}-${context.pair.token1.symbol}`;

    if (!results[pairKey]) {
      results[pairKey] = { pair: context.pair, v3: [] };
    }
    const quoteResult = results[pairKey];
    const callReturnContext =
      multicallResults.results[callReference].callsReturnContext[0];

    if (!callReturnContext.success) {
      quoteResult.error =
        (quoteResult.error ? quoteResult.error + '; ' : '') +
        callReference +
        ' failed';
      continue;
    }

    if (context.type === 'v2') {
      quoteResult.v2 = BigInt(callReturnContext.returnValues[1].hex);
    } else {
      quoteResult.v3!.push({
        fee: context.fee!,
        amount: BigInt(callReturnContext.returnValues[0].hex),
      });
    }
  }

  console.log(results);

  const pairQuotesData = await writeQuotesData(results);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Finished fetch quotes in ${duration}s,`);

  return pairQuotesData;
};
