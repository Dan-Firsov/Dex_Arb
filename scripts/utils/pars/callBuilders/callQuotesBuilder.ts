import { parseUnits } from 'ethers';
import { V2_ROUTER, V3_QUOTERV2 } from '../../../../constants/contracts';
import { Token } from '../../../../constants/tokens';
import { ContractCallContext } from 'ethereum-multicall';
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import IQuoterV2 from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';

export interface CallContext extends ContractCallContext {
  reference: string;
  pair: TokenPairs;
  type: 'v2' | 'v3';
  fee?: number;
}

export interface TokenPairs {
  token0: Token;
  token1: Token;
}

export const V3_FEES = [100, 500, 3000, 10000];

export function buildQuotesCallContexts(
  pairs: TokenPairs[],
  amountInValue: string,
): CallContext[] {
  const contexts: CallContext[] = [];
  for (const { token0, token1 } of pairs) {
    const amountIn = parseUnits(amountInValue, token0.decimals).toString();
    // V2
    contexts.push({
      reference: `${token0.symbol}-${token1.symbol}-v2`,
      contractAddress: V2_ROUTER,
      abi: IUniswapV2Router02.abi,
      calls: [
        {
          reference: 'getAmountsOut',
          methodName: 'getAmountsOut',
          methodParameters: [amountIn, [token0.address, token1.address]],
        },
      ],
      pair: { token0, token1 },
      type: 'v2',
    });

    // V3
    for (const fee of V3_FEES) {
      const params = {
        tokenIn: token0.address,
        tokenOut: token1.address,
        amountIn: amountIn,
        fee: fee,
        sqrtPriceLimitX96: 0,
      };
      contexts.push({
        reference: `${token0.symbol}-${token1.symbol}-v3-${fee}`,
        contractAddress: V3_QUOTERV2,
        abi: IQuoterV2.abi,
        calls: [
          {
            reference: `quoteExactInputSingle-${fee}`,
            methodName: 'quoteExactInputSingle',
            methodParameters: [params],
          },
        ],
        pair: { token0, token1 },
        type: 'v3',
        fee: fee,
      });
    }
  }
  return contexts;
}
