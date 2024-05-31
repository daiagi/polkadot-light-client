import { BinaryLike, createHash } from "crypto";

export type Hash = string;

export const hash = (data: BinaryLike, algo = "sha256"): Hash => {
  const hasher = createHash(algo);
  hasher.update(data);
  return hasher.digest("hex");
};
const hexToBuffer = (hex: string): Buffer => {
  //clean 0x from start if exists
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }
  return Buffer.from(hex, "hex");
};

export const concatenateHashes = (left: Hash, right: Hash): Hash => {
  return hash(Buffer.concat([hexToBuffer(left), hexToBuffer(right)]));
};


