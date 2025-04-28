// types.ts

import { Token } from '../../../constants/tokens';

export interface V2Data {
  amount?: string;
  reverse?: string;
}

export interface V3Entry {
  fee: number;
  amount?: string;
  reverse?: string;
}

export interface PairData {
  pair: {
    token0: Token;
    token1: Token;
  };
  v2: V2Data;
  v3: V3Entry[];
  error?: string;
}

export interface PoolData {
  version: 'v2' | 'v3';
  poolAddress: string;
  token0: {
    symbol: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    decimals: number;
  };
  reserves?: {
    reserve0: string;
    reserve1: string;
  };
  sqrtPriceX96?: bigint;
  feeTier?: number;
  price0to1: number;
  price1to0: number;
  out0to1: number;
  out1to0: number;
  fee: number;
}

/** Ориентированное ребро с весом */
export interface Edge {
  from: number;
  to: number;
  weight: number; // -ln(rate)
}

/** Граф арбитража */
export interface Graph {
  vertices: string[];
  edges: Edge[];
}
