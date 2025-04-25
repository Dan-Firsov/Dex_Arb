import { createClientV2 } from '@0x/swap-ts-sdk';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { USDC, WETH } from './utils/constants';

dotenv.config();

const client = createClientV2({ apiKey: process.env.ZEROX_API_KEY! });
const CHAIN_ID = 8453; // Base Mainnet
const ONE_WEI = ethers.parseUnits('1', 18).toString();

describe('0x Price Quotes on Base', () => {
  it('should log forward & reverse quotes and detect arbitrage window', async () => {
    // Forward quote: 1 WETH -> USDC
    const forward = await client.swap.permit2.getPrice.query({
      sellToken: WETH,
      buyToken: USDC,
      sellAmount: ONE_WEI,
      chainId: CHAIN_ID,
    });

    if (!('buyAmount' in forward && 'route' in forward)) {
      console.log('⛔ No liquidity for WETH -> USDC');
      return;
    }

    // Format amounts
    const fwdAmount = ethers.formatUnits(forward.buyAmount, 6); // USDC has 6 decimals
    // Determine the pool with highest share
    const bestFwdFill = forward.route.fills.reduce((prev, cur) =>
      Number(cur.proportionBps) > Number(prev.proportionBps) ? cur : prev,
    ).source;

    console.log(
      `\n📈 Forward: 1 WETH → ${fwdAmount} USDC (via ${bestFwdFill})`,
    );

    // Reverse quote: USDC -> WETH
    const reverse = await client.swap.permit2.getPrice.query({
      sellToken: USDC,
      buyToken: WETH,
      sellAmount: forward.buyAmount,
      chainId: CHAIN_ID,
    });

    if (!('buyAmount' in reverse && 'route' in reverse)) {
      console.log('⛔ No liquidity for USDC -> WETH');
      return;
    }

    const revAmount = ethers.formatUnits(reverse.buyAmount, 18); // WETH has 18 decimals
    const bestRevFill = reverse.route.fills.reduce((prev, cur) =>
      Number(cur.proportionBps) > Number(prev.proportionBps) ? cur : prev,
    ).source;

    console.log(
      `📉 Reverse: ${fwdAmount} USDC → ${revAmount} WETH (via ${bestRevFill})`,
    );

    // Check arbitrage profit
    const profit =
      ethers.toBigInt(reverse.buyAmount) - ethers.toBigInt(ONE_WEI);
    if (profit > 0n) {
      console.log(
        '🤑 Arbitrage window detected: Profit =',
        `${ethers.formatUnits(profit, 18)} WETH`,
      );
    } else {
      console.log(
        '💔 No arbitrage: Loss =',
        `${ethers.formatUnits(profit < 0n ? -profit : profit, 18)} WETH`,
      );
    }

    // Assertions
    expect(forward.buyAmount).to.be.a('string');
    expect(reverse.buyAmount).to.be.a('string');
  });
});
