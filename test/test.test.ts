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

  it('get owner console check', async () => {
    const tx = await arbContract.initFlashLoan();
    expect(tx).to.equal(20);
  });
});
