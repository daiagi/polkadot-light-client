import { Hash } from "./hash";

export const hexToBinaryArray = (hex: Hash): Buffer => {
    return Buffer.from(hex, 'hex');
  };