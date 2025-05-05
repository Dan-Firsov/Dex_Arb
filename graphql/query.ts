const MIN_TVL_ETH = 1;
export const MIN_LIQUIDITY_RAW = BigInt('1000000000000000000'); //1e18
const UniswapV3 = `
      query Pools($tokens: [String!]!) {
        pools(
          first: 500,
          orderBy: liquidity,
          orderDirection: desc,
          where: {
            token0_in: $tokens,
            token1_in: $tokens,
             liquidity_gt: ${MIN_LIQUIDITY_RAW}
          }
        ) {
          id
          token0 { symbol decimals }
          token1 { symbol decimals }
          feeTier
        }
      }`;

const UniswapV2 = `
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
          token0 { id symbol decimals }
          token1 { id symbol decimals }
        }
      }`;

export const QUERIES = {
  UniswapV3,
  UniswapV2,
};
