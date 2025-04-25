import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    hardhat: {
      forking: {
        url: process.env.BASE_RPC_URL!,
      },
    },
  },
};

export default config;
