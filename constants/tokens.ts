export interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

export const TOKENS: Token[] = [
  {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', //1
    decimals: 6,
  },
  {
    symbol: 'WBTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', //2
    decimals: 8,
  },
  {
    symbol: 'wstETH',
    address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', //3
    decimals: 18,
  },
  {
    symbol: 'USDS',
    address: '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc', //4
    decimals: 18,
  },
  {
    symbol: 'DAI',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', //5
    decimals: 18,
  },
  {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006', //6
    decimals: 18,
  },

  {
    symbol: 'USDe',
    address: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34', //7
    decimals: 18,
  },

  {
    symbol: 'TRUMP',
    address: '0xc27468b12ffA6d714B1b5fBC87eF403F38b82AD4', //8
    decimals: 18,
  },
  {
    symbol: 'AAVE',
    address: '0x63706e401c06ac8513145b7687A14804d17f814b', //9
    decimals: 18,
  },
  {
    symbol: 'PYTH',
    address: '0x4c5d8A75F3762c1561D96f177694f67378705E98', //10
    decimals: 6,
  },
  {
    symbol: 'PENDLE',
    address: '0xA99F6e6785Da0F5d6fB42495Fe424BCE029Eeb3E', //11
    decimals: 18,
  },
  {
    symbol: 'OM',
    address: '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98', //12
    decimals: 18,
  },
  {
    symbol: 'ENA',
    address: '0x58538e6A46E07434d7E7375Bc268D3cb839C0133', //13
    decimals: 18,
  },
  {
    symbol: 'VIRTUAL',
    address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', //14
    decimals: 18,
  },
  {
    symbol: 'CRV',
    address: '0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415', //15
    decimals: 18,
  },
  {
    symbol: 'AERO',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', //16
    decimals: 18,
  },
  {
    symbol: 'TEL',
    address: '0x09bE1692ca16e06f536F0038fF11D1dA8524aDB1', //17
    decimals: 2,
  },
  {
    symbol: 'W',
    address: '0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91', //18
    decimals: 18,
  },
  {
    symbol: 'SUPER',
    address: '0x391359ab0CCef572DcaC78F74E47D7C06Db0b982', //19
    decimals: 18,
  },
  {
    symbol: 'ZRO',
    address: '0x6985884C4392D348587B19cb9eAAf157F13271cd', //20
    decimals: 18,
  },
  {
    symbol: '1INCH',
    address: '0xc5fecC3a29Fb57B5024eEc8a2239d4621e111CBE', //21
    decimals: 18,
  },
  {
    symbol: 'MORPHO',
    address: '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842', //22
    decimals: 18,
  },
  {
    symbol: 'MOCA',
    address: '0x2B11834Ed1FeAEd4b4b3a86A6F571315E25A884D', //23
    decimals: 18,
  },
  {
    symbol: 'SNX',
    address: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66', //24
    decimals: 18,
  },
  {
    symbol: 'KAITO',
    address: '0x98d0baa52b2D063E780DE12F615f963Fe8537553', //25
    decimals: 18,
  },
  {
    symbol: 'YFI',
    address: '0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239', //26
    decimals: 18,
  },
  {
    symbol: 'MELANIA',
    address: '0x813f392d21a55819Be5E78157BFCdBD25530f4E8', //27
    decimals: 18,
  },
  {
    symbol: 'PRIME',
    address: '0xfA980cEd6895AC314E7dE34Ef1bFAE90a5AdD21b', //28
    decimals: 18,
  },
  {
    symbol: 'EUL',
    address: '0xa153Ad732F831a79b5575Fa02e793EC4E99181b0', //29
    decimals: 18,
  },
  {
    symbol: 'FAI',
    address: '0xb33Ff54b9F7242EF1593d2C9Bcd8f9df46c77935', //30
    decimals: 18,
  },
  {
    symbol: 'WMTX',
    address: '0x3e31966d4f81C72D2a55310A6365A56A4393E98D', //31
    decimals: 6,
  },
  {
    symbol: 'ETHFI',
    address: '0x6C240DDA6b5c336DF09A4D011139beAAa1eA2Aa2', //32
    decimals: 18,
  },
  {
    symbol: 'SIGN',
    address: '0x868FCEd65edBF0056c4163515dD840e9f287A4c3', //33
    decimals: 18,
  },
  {
    symbol: 'VVV',
    address: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf', //34
    decimals: 18,
  },
  {
    symbol: 'USUAL',
    address: '0x4ACD4D03af6F9cc0fB7C5f0868B7b6287D7969c5', //35
    decimals: 18,
  },
  {
    symbol: 'PHA',
    address: '0x336C9297AFB7798c292E9f80d8e566b947f291f0', //36
    decimals: 18,
  },
  {
    symbol: 'COOKIE',
    address: '0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F', //37
    decimals: 18,
  },
  {
    symbol: 'DEGEN',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', //38
    decimals: 18,
  },
  {
    symbol: 'KNC',
    address: '0x28fe69Ff6864C1C218878BDCA01482D36B9D57b1', //39
    decimals: 18,
  },
  {
    symbol: 'PARTI',
    address: '0x59264f02D301281f3393e1385c0aEFd446Eb0F00', //40
    decimals: 18,
  },
  {
    symbol: 'ZORA',
    address: '0x1111111111166b7FE7bd91427724B487980aFc69', //41
    decimals: 18,
  },
  {
    symbol: 'SPEC',
    address: '0x96419929d7949D6A801A6909c145C8EEf6A40431', //42
    decimals: 18,
  },
  {
    symbol: 'REZ',
    address: '0xf757c9804cF2EE8d8Ed64e0A8936293Fe43a7252', //43
    decimals: 18,
  },
  {
    symbol: 'HYPER',
    address: '0xC9d23ED2ADB0f551369946BD377f8644cE1ca5c4', //44
    decimals: 18,
  },
  {
    symbol: 'RDNT',
    address: '0xd722E55C1d9D9fA0021A5215Cbb904b92B3dC5d4', //45
    decimals: 18,
  },
  {
    symbol: 'MCADE',
    address: '0xc48823EC67720a04A9DFD8c7d109b2C3D6622094', //46
    decimals: 18,
  },
  {
    symbol: 'MASA',
    address: '0xaB1E131c6984CC149ef45931073D11Ae35497191', //47
    decimals: 18,
  },
  {
    symbol: 'CTX',
    address: '0xBB22Ff867F8Ca3D5F2251B4084F6Ec86D4666E14', //48
    decimals: 18,
  },
  {
    symbol: 'MAVIA',
    address: '0x24fcFC492C1393274B6bcd568ac9e225BEc93584', //49
    decimals: 18,
  },
  {
    symbol: 'uSUI',
    address: '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4', //49
    decimals: 18,
  },
];
