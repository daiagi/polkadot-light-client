import { Hash } from "../utils/hash";

export enum Sibling {
  LEFT = "left",
  RIGHT = "right",
}

export type SiblingNode =
  | { type: Sibling.LEFT; value: Hash }
  | { type: Sibling.RIGHT; value: Hash };

export type MerkleProof = SiblingNode[];
