import * as dotenv from 'dotenv';
import { createClientV2 } from '@0x/swap-ts-sdk';
import { ethers } from 'ethers';
import Bottleneck from 'bottleneck';
import { TOKENS } from '../test/utils/constants';

dotenv.config();

const client = createClientV2({ apiKey: process.env.ZEROX_API_KEY! });
const CHAIN_ID = 8453;

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100,
});

(async () => {
  console.log('🔍 Fetching rates for token pairs with rate limit 10 req/s...');
  const tasks: Promise<void>[] = [];

  for (const sell of TOKENS) {
    for (const buy of TOKENS) {
      if (sell.address === buy.address) continue;

      tasks.push(
        limiter.schedule(async () => {
          const sellAmount = ethers.parseUnits('1', sell.decimals).toString();
          try {
            const quote = await client.swap.permit2.getPrice.query({
              sellToken: sell.address,
              buyToken: buy.address,
              sellAmount,
              chainId: CHAIN_ID,
            });
            if ('buyAmount' in quote) {
              const amountOut = ethers.formatUnits(
                quote.buyAmount,
                buy.decimals,
              );
              console.log(`1 ${sell.symbol} -> ${amountOut} ${buy.symbol}`);
            } else {
              console.log(`⛔ No liquidity: ${sell.symbol} -> ${buy.symbol}`);
            }
          } catch (err) {
            console.error(`Error ${sell.symbol}->${buy.symbol}:`, err);
          }
        }),
      );
    }
  }

  await Promise.all(tasks);
  console.log('✅ All rate fetches completed.');
})();
