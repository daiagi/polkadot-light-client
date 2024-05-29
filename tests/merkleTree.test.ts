import { MerkleTree } from "../src/merkleTree/MerkleTree";

describe("merkle tree test", () => {
  it("builds tree correctly", () => {
    const hashes = ["01", "02", "03", "04"];
    const merkleTree = new MerkleTree(hashes);

    expect(merkleTree.getTree().length).toBe(7);

    expect(merkleTree.getTree()).toEqual([
      "01",
      "02",
      "03",
      "04",
      "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
      "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
      "bed3d33a81026f7be93aefad44c5891c27fc8265aa15279a58e287744b7c7753",
    ]);
  });
});
