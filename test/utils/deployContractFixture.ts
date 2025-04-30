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

export const deployContractFixture = async () => {
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS!;
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.BASE_RPC_URL,
          blockNumber: 29613714,
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

  return {
    arbContract,
    owner,
  };
};
