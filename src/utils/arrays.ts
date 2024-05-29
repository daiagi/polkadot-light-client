import { Hash } from "./hash";

export const chunkArray = <T>(array: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  export const pad = (hashes: Hash[]): Hash[] => {
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(hashes.length)));
    return hashes.concat(Array(nextPowerOfTwo - hashes.length).fill("0"));
  }