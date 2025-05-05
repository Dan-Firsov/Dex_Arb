import * as dotenv from 'dotenv';
dotenv.config();
import hre, { ethers } from 'hardhat';
import ArbExecutor from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import {
  AAVE_POOL_ADDRESS_PROVIDER,
  V2_ROUTER,
  V3_QUOTERV2,
  V3_ROUTER,
} from '../../constants/contracts';
import {
  DAI_WHALE_ADDRESS,
  DEGEN_WHALE_ADDRESS,
  USDC_WHALE_ADDRESS,
  WETH_WHALE_ADDRESS,
} from '../../constants/whaleAddresses';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const WETH = '0x4200000000000000000000000000000000000006';
const OM = '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98';
const DEGEN = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';
const VIRTUAL = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b';
const MORPHO = '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842';
const AERO = '0x940181a94A35A4569E4529A3CDfB74e38FD98631';
const DAI = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';

export const deployContractFixture = async () => {
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS!;
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.BASE_RPC_URL,
          blockNumber: 29806985,
        },
      },
    ],
  });
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [OWNER_ADDRESS],
  });
  await hre.network.provider.request({
    method: 'hardhat_setBalance',
    params: [OWNER_ADDRESS, '0x8ac7230489e800000'],
  });
  const blockNumber1 = await ethers.provider.getBlockNumber();

  const owner = await ethers.getSigner(OWNER_ADDRESS);

  console.log(owner.address);
  console.log(OWNER_ADDRESS);

  const ArbExecutorFactory = await ethers.getContractFactory(
    'ArbExecutor',
    owner,
  );

  const deployedContract = await ArbExecutorFactory.deploy(
    AAVE_POOL_ADDRESS_PROVIDER,
    V2_ROUTER,
    V3_ROUTER,
    V3_QUOTERV2,
  );
  await deployedContract.waitForDeployment();

  const arbContract = new ethers.Contract(
    deployedContract.target,
    ArbExecutor.abi,
    owner,
  );
  const blockNumber2 = await ethers.provider.getBlockNumber();

  const fundToken = async (
    tokenAddress: string,
    whaleAddress: string,
    amount: string,
    decimals: number,
  ) => {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [whaleAddress],
    });

    await hre.network.provider.request({
      method: 'hardhat_setBalance',
      params: [whaleAddress, '0x8ac7230489e800000'],
    });
    const whaleSinger = await ethers.getSigner(whaleAddress);
    const token = await ethers.getContractAt(
      'IERC20',
      tokenAddress,
      whaleSinger,
    );
    const raw = ethers.parseUnits(amount, decimals);
    await token.transfer(OWNER_ADDRESS, raw);
    await hre.network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [whaleAddress],
    });
  };

  await fundToken(DEGEN, DEGEN_WHALE_ADDRESS, '1000', 18);
  await fundToken(DAI, DAI_WHALE_ADDRESS, '1000', 18);
  await fundToken(USDC, USDC_WHALE_ADDRESS, '1000', 6);
  await fundToken(WETH, WETH_WHALE_ADDRESS, '10', 18);
  const blockNumber3 = await ethers.provider.getBlockNumber();

  return {
    arbContract,
    owner,
  };
};
