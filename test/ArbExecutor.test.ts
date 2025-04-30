import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployContractFixture } from './utils/deployContractFixture';

enum Dex {
  V2 = 0,
  V3 = 1,
}

interface RouteStep {
  dex: Dex;
  path: string[];
  fee: number;
}

describe('ArbExecutor', function () {
  let arbContract: any, owner: any;

  const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const WETH = '0x4200000000000000000000000000000000000006';
  const OM = '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98';

  before(async () => {
    const fixture = await loadFixture(deployContractFixture);
    arbContract = fixture.arbContract;
    owner = fixture.owner;
  });

  it('should have a non-zero ETH balance for the owner', async () => {
    const balance = await ethers.provider.getBalance(owner.address);
    console.log('Owner ETH balance:', ethers.formatEther(balance));
    expect(balance).to.be.gt(0);
  });

  it('should execute arbitrage via flash loan', async () => {
    const usdcToken = await ethers.getContractAt('IERC20', USDC, owner);
    const beforeBalance = await usdcToken.balanceOf(owner.address);
    const steps: RouteStep[] = [
      {
        dex: Dex.V3,
        path: [USDC, WETH],
        fee: 500,
      },
      {
        dex: Dex.V3,
        path: [WETH, OM],
        fee: 3000,
      },
      {
        dex: Dex.V3,
        path: [OM, USDC],
        fee: 100,
      },
    ];

    const amountIn = ethers.parseUnits('1000', 6);
    const tx = await arbContract
      .connect(owner)
      .initFlashLoan(USDC, amountIn, steps);
    await tx.wait();
    const afterBalance = await usdcToken.balanceOf(owner.address);
    console.log('USDC before:', ethers.formatUnits(beforeBalance, 6));
    console.log('USDC  after:', ethers.formatUnits(afterBalance, 6));

    expect(afterBalance).to.be.gt(
      beforeBalance,
      'Владелец должен получить прибыль по USDC',
    );
  });
});
