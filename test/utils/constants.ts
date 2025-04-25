export interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

export const TOKENS: Token[] = [
  {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },
  {
    symbol: 'DAI',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
  },
  {
    symbol: 'USDe',
    address: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
    decimals: 18,
  },
  {
    symbol: 'WBTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    decimals: 8,
  },
  {
    symbol: 'TRUMP',
    address: '0xc27468b12ffA6d714B1b5fBC87eF403F38b82AD4',
    decimals: 18,
  },
  {
    symbol: 'AAVE',
    address: '0x63706e401c06ac8513145b7687A14804d17f814b',
    decimals: 18,
  },
  {
    symbol: 'PYTH',
    address: '0x4c5d8A75F3762c1561D96f177694f67378705E98',
    decimals: 6,
  },
  {
    symbol: 'PENDLE',
    address: '0xA99F6e6785Da0F5d6fB42495Fe424BCE029Eeb3E',
    decimals: 18,
  },
  {
    symbol: 'OM',
    address: '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98',
    decimals: 18,
  },
];
