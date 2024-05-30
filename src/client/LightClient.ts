import { ApiPromise } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";
import { MerkleTree } from "../merkleTree/MerkleTree";
import { Hash } from "../utils/hash";
import { MerkleProof } from "../merkleTree/SiblingNode";

// The LightClient class handles listening to new headers, building Merkle trees, and providing proofs
export class LightClient {
  private api: ApiPromise; // Polkadot API instance
  private batchSize: number; // Number of headers to batch before creating a new Merkle tree
  private buffer: Hash[]; // Buffer to store header hashes until batch size is reached
  private merkleTrees: MerkleTree[]; // Array to store Merkle trees
  private headers: Record<Hash, Header>; // Mapping from hash to header
  private blockNumberToHash: Record<number, Hash>; // Mapping from block number to header hash
  private hashToMerkleTreeIndex: Record<Hash, number>; // Mapping from header hash to Merkle tree index

  constructor(api: ApiPromise, batchSize: number) {
    this.api = api;
    this.batchSize = batchSize;
    this.buffer = [];
    this.merkleTrees = [];
    this.headers = {};
    this.blockNumberToHash = {};
    this.hashToMerkleTreeIndex = {};
  }

  public async init() {
    await this.api.isReady;
    this.listenToNewHeaders();
  }

  // listenToNewHeaders subscribes to new headers and processes them
  private async listenToNewHeaders() {
    this.api.rpc.chain.subscribeNewHeads(async (lastHeader: Header) => {
      console.log("📦 block #:", lastHeader.number.toNumber());
      console.log("🪖 header hash:", lastHeader.hash.toHex());
      console.log("");

      const headerHash = lastHeader.hash.toHex();

      // Store the header and its corresponding hash and block number
      this.headers = { ...this.headers, [headerHash]: lastHeader };
      this.blockNumberToHash = {
        ...this.blockNumberToHash,
        [lastHeader.number.toNumber()]: headerHash,
      };

      // Track which Merkle tree the header belongs to
      this.hashToMerkleTreeIndex = {
        ...this.hashToMerkleTreeIndex,
        [headerHash]: this.merkleTrees.length,
      };

      // Add the header hash to the buffer
      this.buffer.push(headerHash);

      // When buffer is full, create a new Merkle tree and reset the buffer
      if (this.buffer.length === this.batchSize) {
        const tree = new MerkleTree(this.buffer);
        this.merkleTrees.push(tree);
        this.buffer = [];
      }
    });
  }

  public getHeaderByHash(hash: Hash): Header | undefined {
    return this.headers[hash];
  }

  public getHeaderByBlockNumber(blockNumber: number): Header | undefined {
    const hash = this.blockNumberToHash[blockNumber];
    return this.getHeaderByHash(hash);
  }

  public getProof(header: Header): MerkleProof {
    const hash = header.hash.toHex();
    const treeIndex = this.hashToMerkleTreeIndex[hash];
    const tree = this.merkleTrees[treeIndex];

    if (!tree) {
      throw new Error("Merkle tree not found");
    }

    return tree.getProof(hash);
  }

  public validateProof(header: Header, proof: MerkleProof): boolean {
    const headerHash = header.hash.toHex();
    const treeIndex = this.hashToMerkleTreeIndex[headerHash];
    const tree = this.merkleTrees[treeIndex];
    const treeRoot = tree.getRoot();

    return tree.validateProof(treeRoot, headerHash, proof);
  }

  // getLatestHeaders retrieves the latest headers, optionally limited by a specified number
  public getLatestHeaders(
    limit?: number
  ): { hash: Hash; blockNumber: number }[] {
    const headers = Object.entries(this.blockNumberToHash)
      .map(([blockNumber, hash]) => ({
        hash,
        blockNumber: parseInt(blockNumber),
      }))
      .sort((a, b) => b.blockNumber - a.blockNumber);

    return limit ? headers.slice(0, limit) : headers;
  }

  // getEstimatedTimeForProof estimates the time in seconds until the proof will be available for the given hash
  public getEstimatedTimeForProof(
    hash: Hash,
    blockTime: number = 6
  ): number | undefined {
    const index = this.buffer.indexOf(hash);
    if (index === -1) {
      return undefined;
    }
    const remainingBlocks = this.batchSize - this.buffer.length;
    return remainingBlocks * blockTime;
  }
}
