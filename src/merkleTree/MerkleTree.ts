import { Hash, concatenateHashes } from "../utils/hash";

import { chunkArray, pad } from "../utils/arrays";
import { MerkleProof, Sibling } from "./SiblingNode";

export class MerkleTree {
  // The Merkle tree is stored as a 2D array of hashes

  /*
  Level 0 (Root):             [RootHash]
  Level 1:                  [Hash1, Hash2]
  Level 2 (Leaves):  [HashA, HashB, HashC, HashD]

  [[RootHash],[Hash1, Hash2],[HashA, HashB, HashC, HashD]
  */

  private tree: Hash[][];

  constructor(Headerhashes: Hash[]) {
    // pad to nearest power of 2
    const paddedHashes = pad(Headerhashes);

    // then build the tree
    this.tree = this.buildTree(paddedHashes);
  }

  // buildTree constructs the Merkle tree from the leaf hashes upwards
  private buildTree(paddedHashes: Hash[]): Hash[][] {
    let currentLevel = paddedHashes;
    const tree: Hash[][] = [currentLevel];

    // Build the tree level by level until we reach the root
    while (currentLevel.length > 1) {
      // Build the tree level by level until we reach the root
      const nextLevel = chunkArray(currentLevel, 2).map(([left, right]) =>
        concatenateHashes(left, right)
      );
      // Prepend the next level to the tree
      tree.unshift(nextLevel);
      currentLevel = nextLevel;
    }

    return tree;
  }

  public getRoot(): Hash {
    return this.tree[0][0];
  }

  public getTree(): Hash[][] {
    return this.tree;
  }

  private getLevel(level: number): Hash[] {
    if (level >= this.tree.length || level < 0) {
      throw new Error("Invalid level");
    }
    return this.tree[level];
  }

  public leftSibling(level: number, index: number): Hash {
    if (index < 0 || this.isLeftNode(index)) {
      throw new Error("Invalid index");
    }
    const treeLevel = this.getLevel(level);

    if (index >= treeLevel.length) {
      throw new Error("Invalid index");
    }
    return treeLevel[index - 1];
  }

  public rightSibling(level: number, index: number): Hash {
    if (index < 0 || this.isRightNode(index)) {
      throw new Error("Invalid index");
    }
    const treeLevel = this.getLevel(level);

    if (index >= treeLevel.length) {
      throw new Error("Invalid index");
    }
    return treeLevel[index + 1];
  }

  private isLeftNode(index: number): boolean {
    return index % 2 === 0;
  }

  private isRightNode(index: number): boolean {
    return !this.isLeftNode(index);
  }

  // get an inclusion proof for a hash
  public getProof(hash: Hash): MerkleProof {
    const leaves = this.getLevel(this.tree.length - 1);
    const index = leaves.indexOf(hash);
    if (index === -1) {
      throw new Error("Hash not found in tree");
    }
    // heavy lifting done by getProofByLeafIndex
    return this.getProofByLeafIndex(index);
  }

  // getProofByLeafIndex generates a Merkle proof for a leaf at a specific index
  public getProofByLeafIndex(index: number): MerkleProof {
    // make sure index in not out of bounds
    if (index < 0 || index >= this.tree[this.tree.length - 1].length) {
      throw new Error("Invalid index");
    }
    let currentIndex = index;
    const proof: MerkleProof = [];

    // Traverse from the leaf to the root, recording sibling hashes
    for (let level = this.tree.length - 1; level > 0; level--) {
      const sibling = this.isLeftNode(currentIndex)
        ? this.rightSibling(level, currentIndex)
        : this.leftSibling(level, currentIndex);

      proof.push({
        type: this.isLeftNode(currentIndex) ? Sibling.RIGHT : Sibling.LEFT,
        value: sibling,
      });

      // Move to the parent node in the next level
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  // verifies a Merkle inclusion proof for a given leaf and root hash
  public validateProof(root: Hash, leaf: Hash, proof: MerkleProof): boolean {
    let currentHash = leaf;

    // Recompute the hash up to the root using the proof
    for (const sibling of proof) {
      currentHash =
        sibling.type === Sibling.LEFT
          ? concatenateHashes(sibling.value, currentHash)
          : concatenateHashes(currentHash, sibling.value);
    }

    console.log("currentHash", currentHash);
    console.log("root", root);

    return currentHash === root;
  }
}
