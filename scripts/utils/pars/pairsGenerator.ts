import { promises as fs } from 'fs';
import path from 'path';
import { Token, TOKENS } from '../../../constants/tokens';

export const generatePairs = (tokens: Token[]): [Token, Token][] => {
  return tokens.flatMap((t1, i) =>
    tokens.slice(i + 1).map((t2) => [t1, t2] as [Token, Token]),
  );
};

export const writePairsToFile = async () => {
  const pairs = generatePairs(TOKENS);

  const pairsJson = pairs.map(([a, b]) => ({
    token0: { symbol: a.symbol, address: a.address, decimals: a.decimals },
    token1: { symbol: b.symbol, address: b.address, decimals: b.decimals },
  }));

  const filePath = path.resolve(__dirname, '../../data/tokenPairs.json');
  const dir = path.dirname(filePath);

  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(filePath, JSON.stringify(pairsJson, null, 2), 'utf-8');

  console.log(`✅ Пары токенов сохранены в: ${filePath}`);
};

if (require.main === module) {
  writePairsToFile().catch((err) => {
    console.error('❌ Ошибка при сохранении пар токенов:', err);
    process.exit(1);
  });
}
