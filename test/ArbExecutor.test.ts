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
  this.timeout(120_000);
  let arbContract: any, owner: any;

  const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const WETH = '0x4200000000000000000000000000000000000006';
  const OM = '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98';
  const DEGEN = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';
  const VIRTUAL = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';
  const MORPHO = '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842';
  const AERO = '0x940181a94A35A4569E4529A3CDfB74e38FD98631';
  const DAI = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';

  before(async () => {
    const fixture = await loadFixture(deployContractFixture);
    arbContract = fixture.arbContract;
    owner = fixture.owner;
  });

  it('should have a non-zero ETH balance for the owner', async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('Текущий номер блока:', blockNumber);

    const balance = await ethers.provider.getBalance(owner.address);
    console.log('Owner ETH balance:', ethers.formatEther(balance));
    const degenToken = await ethers.getContractAt('IERC20', DEGEN, owner);
    const degenBalance = await degenToken.balanceOf(owner.address);
    console.log('Owner DEGEN balance:', ethers.formatEther(degenBalance));
    const daiToken = await ethers.getContractAt('IERC20', DAI, owner);
    const daiBalance = await daiToken.balanceOf(owner.address);
    console.log('Owner DAI balance:', ethers.formatEther(daiBalance));
    const usdcToken = await ethers.getContractAt('IERC20', DEGEN, owner);
    const usdcBalance = await usdcToken.balanceOf(owner.address);
    console.log('Owner USDC balance:', ethers.formatEther(usdcBalance));
    const wethToken = await ethers.getContractAt('IERC20', WETH, owner);
    const wethBalance = await wethToken.balanceOf(owner.address);
    console.log('Owner WETH balance:', ethers.formatEther(wethBalance));
    expect(balance).to.be.gt(0);
  });

  it('should execute arbitrage', async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const degenToken = await ethers.getContractAt('IERC20', DEGEN, owner);
    await degenToken.approve(arbContract.target, ethers.MaxUint256);

    const beforeBalance = await degenToken.balanceOf(owner.address);
    const steps: RouteStep[] = [
      {
        dex: Dex.V3,
        path: [DEGEN, DAI],
        fee: 10000,
      },
      {
        dex: Dex.V3,
        path: [DAI, USDC],
        fee: 100,
      },
      {
        dex: Dex.V2,
        path: [USDC, WETH],
        fee: 0,
      },
      {
        dex: Dex.V3,
        path: [WETH, DEGEN],
        fee: 3000,
      },
    ];

    const amountIn = ethers.parseUnits('1000', 18);
    console.log('start');

    const tx = await arbContract.pathSwap(amountIn, steps);
    const reciept = await tx.wait();
    const afterBalance = await degenToken.balanceOf(owner.address);
    console.log('DEGEN before:', ethers.formatUnits(beforeBalance, 18));
    console.log('DEGEN  after:', ethers.formatUnits(afterBalance, 18));

    expect(afterBalance).to.be.gt(
      beforeBalance,
      'Владелец должен получить прибыль по degen',
    );
  });
});
