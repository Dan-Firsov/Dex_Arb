export interface SubgraphConfig {
  name: string;
  url: string;
  version: 'v2' | 'v3';
}

export const SUBGRAPHS: SubgraphConfig[] = [
  { name: 'UniswapV3', url: process.env.SUBGRAPH_UNISWAP_V3!, version: 'v3' },
  { name: 'UniswapV2', url: process.env.SUBGRAPH_UNISWAP_V2!, version: 'v2' },
];
