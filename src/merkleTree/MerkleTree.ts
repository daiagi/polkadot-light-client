import { Hash, concatenateHashes } from "../utils/hash";

import { chunkArray, pad } from "../utils/arrays";
import { MerkleProof, Sibling } from "./SiblingNode";

export class MerkleTree {
  private tree: Hash[];
  private numLeaves: number;

  constructor(Headerhashes: Hash[]) {
    // pad to nearest power of 2

    const paddedHashes = pad(Headerhashes);
    this.numLeaves = paddedHashes.length;

    // then build the tree

    this.tree = this.buildTree(paddedHashes);
  }

  private buildTree(paddedHashes: Hash[]): Hash[] {
    const tree = paddedHashes;

    let start = 0;
    let end = paddedHashes.length;
    let nextlevelSize = paddedHashes.length / 2;

    while (nextlevelSize >= 1) {
      const nextlevel = chunkArray(tree.slice(start, end), 2).map(
        ([left, right]) => {
          console.log(left, right);
          return concatenateHashes(left, right);
        }
      );

      tree.push(...nextlevel);
      start = end;
      end = end + nextlevelSize;
      nextlevelSize = nextlevel.length / 2;
    }

    return tree;
  }

  public getRoot(): Hash {
    return this.tree[this.tree.length - 1];
  }

  public getTree(): Hash[] {
    return this.tree;
  }

  public leftChild(index: number): Hash | undefined {
    if (index * 2 >= this.tree.length) {
      return undefined;
    }
    return this.tree[index * 2];
  }

  public rightChild(index: number): Hash | undefined {
    if (index * 2 + 1 >= this.tree.length) {
      return undefined;
    }
    return this.tree[index * 2 + 1];
  }

  private getParentIndex(index: number): number {
    return Math.floor(index / 2);
  }

  public getParent(index: number): Hash | undefined {
    if (index === 0) {
      return undefined;
    }

    return this.tree[Math.floor(index / 2)];
  }

  public leftSibling(index: number): Hash {
    return this.tree[index - 1];
  }

  public rightSibling(index: number): Hash {
    return this.tree[index + 1];
  }

  private isLeftChild(index: number): boolean {
    return index % 2 === 0;
  }

  private isRightChild(index: number): boolean {
    return !this.isLeftChild(index);
  }

  public getProof(hash: Hash): MerkleProof {
    const leaves = this.tree.slice(0, this.numLeaves);
    const index = leaves.indexOf(hash);
    if (index === -1) {
      throw new Error("Hash not found in tree");
    }
    return this.getProofByLeafIndex(index);
  }

  public getProofByLeafIndex(index: number): MerkleProof {
    if (index >= this.numLeaves || index < 0) {
      throw new Error("Index out of bounds");
    }
    if (index === 0) {
      return [];
    }
    let currentIndex = index;
    const proof: MerkleProof = [];

    while (currentIndex > 0) {
      const sibling = this.isLeftChild(index)
        ? this.rightSibling(index)
        : this.leftSibling(index);
      proof.push({
        type: this.isLeftChild(index) ? Sibling.RIGHT : Sibling.LEFT,
        value: sibling,
      });
      currentIndex = this.getParentIndex(index);
    }
    return proof;
  }
}
