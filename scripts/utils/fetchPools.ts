import * as dotenv from 'dotenv';
dotenv.config();
import pLimit from 'p-limit';
import path from 'path';
import { writeFile } from 'fs/promises';
import { TOKENS } from '../../constants/tokens';
import { SUBGRAPHS } from '../../constants/subgraphs';
import { graphqlRequest } from '../../graphql/client';
import { QUERIES } from '../../graphql/query';

const limit = pLimit(100);

export const fetchPools = async () => {
  const tokenAddrs = TOKENS.map((t) => t.address.toLowerCase());
  const allResults: any[] = [];

  console.log('⏳ Starting fetchPools...');
  const startTime = Date.now();

  const jobs = SUBGRAPHS.map(async (sub) => {
    const query = QUERIES[sub.name as keyof typeof QUERIES];
    console.log(`📡 Fetching ${sub.name}...`);

    const data = await limit(() =>
      graphqlRequest<{ pools?: any[]; pairs?: any[] }>(sub.url, query, {
        tokens: tokenAddrs,
      }),
    );

    if (!data) {
      console.warn(`❌ No data for ${sub.name}`);
      return;
    }

    const items = sub.name.includes('V3') ? data.pools || [] : data.pairs || [];
    if (!Array.isArray(items)) {
      console.warn(`⚠️ Unexpected data format for ${sub.name}`);
      return;
    }
    items.forEach((item) => {
      const poolObj: any = {
        version: sub.name.includes('V3') ? 'v3' : 'v2',
        poolAddress: item.id,
        token0: {
          address: item.token0.id,
          symbol: item.token0.symbol,
          decimals: Number(item.token0.decimals),
        },
        token1: {
          address: item.token1.id,
          symbol: item.token1.symbol,
          decimals: Number(item.token1.decimals),
        },
      };
      if (sub.name.includes('V3')) {
        poolObj.fee = Number(item.feeTier);
      }
      allResults.push(poolObj);
    });
  });

  await Promise.all(jobs);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(
    `✅ Finished fetchPools in ${duration}s, found ${allResults.length} pools.`,
  );

  const outPath = path.join(__dirname, '../data/poolsInfo.json');
  await writeFile(outPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`💾 Saved ${allResults.length} entries to pools.json`);
};
fetchPools();
