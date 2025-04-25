export interface PoolData {
  subgraph: string;
  id: string;
  token0: { symbol: string; decimals: number };
  token1: { symbol: string; decimals: number };
  reserve0: number;
  reserve1: number;
  price0to1: number;
  price1to0: number;
  out0to1: number;
  out1to0: number;
  liquidity?: number;
  feeTier?: number;
  version: 'V2' | 'V3';
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
