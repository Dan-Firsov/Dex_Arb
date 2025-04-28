import * as dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';
import { MulticallWrapper } from 'ethers-multicall-provider';

export const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
export const multicallProvider = MulticallWrapper.wrap(provider);
