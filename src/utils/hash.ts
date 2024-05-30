import { BinaryLike, createHash } from "crypto";

export type Hash = string;

export const hash = (data: BinaryLike, algo = "sha256"): Hash => {
  const hasher = createHash(algo);
  hasher.update(data);
  return hasher.digest("hex");
};

export const concatenateHashes = (left: Hash, right: Hash): Hash =>
  hash(Buffer.concat([Buffer.from(left, "hex"), Buffer.from(right, 'hex')]));
