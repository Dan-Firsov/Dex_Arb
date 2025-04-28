import fs from 'fs/promises';
import path from 'path';
import { PoolData } from '../../algo/types';

export const writePoolsData = async (data: PoolData[]): Promise<PoolData[]> => {
  const filePath = path.resolve(__dirname, '../../../data/poolData.json');

  const json = JSON.stringify(
    data,
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  );

  await fs.writeFile(filePath, json);
  return data;
};
