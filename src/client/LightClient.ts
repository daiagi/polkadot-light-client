import { ApiPromise } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";
import { MerkleTree } from "../merkleTree/MerkleTree";
import { Hash } from "../utils/hash";
import { MerkleProof } from "../merkleTree/SiblingNode";

export class LightClient {
  private api: ApiPromise;
  private batchSize: number;
  private buffer: Hash[];
  private merkleTrees: MerkleTree[];
  private headers: Record<Hash, Header>;
  private blockNumberToHash: Record<number, Hash>;
  private hashToMerkleTreeIndex: Record<Hash, number>;

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

  private async listenToNewHeaders() {
    this.api.rpc.chain.subscribeNewHeads(async (lastHeader: Header) => {
      console.log("current header:", lastHeader.toJSON());

      const headerHash = lastHeader.hash.toHex();

      this.headers = { ...this.headers, [headerHash]: lastHeader };
      this.blockNumberToHash = {
        ...this.blockNumberToHash,
        [lastHeader.number.toNumber()]: headerHash,
      };

      this.hashToMerkleTreeIndex = {
        ...this.hashToMerkleTreeIndex,
        [headerHash]: this.merkleTrees.length,
      };

      this.buffer.push(headerHash);

      if (this.buffer.length === this.batchSize) {
        const tree: MerkleTree = new MerkleTree(this.buffer);
        this.merkleTrees.push(tree);
        this.buffer = [];
      }
    });
  }

  public getHeaderByHash(hash: Hash): Header {
    return this.headers[hash];
  }

  public getHeaderByBlockNumber(blockNumber: number): Header {
    const hash = this.blockNumberToHash[blockNumber];
    return this.headers[hash];
  }

  public getProof(header: Header): MerkleProof {
    const hash = header.hash.toHex();
    const treeIndex = this.hashToMerkleTreeIndex[hash];
    const tree = this.merkleTrees[treeIndex];

    return tree.getProof(hash);
  }
}
