import { MerkleTree } from "../src/merkleTree/MerkleTree";
import { MerkleProof, Sibling } from "../src/merkleTree/SiblingNode";
import { Hash } from "../src/utils/hash";

describe("merkle tree test", () => {
  let merkleTree: MerkleTree;

  beforeEach(() => {
    const hashes = ["01", "02", "03", "04"];
    merkleTree = new MerkleTree(hashes);
  });

  it("gets root correctly", () => {
    expect(merkleTree.getRoot()).toBe(
      "bed3d33a81026f7be93aefad44c5891c27fc8265aa15279a58e287744b7c7753"
    );
  });

  it("builds tree correctly", () => {
    expect(merkleTree.getTree()).toEqual([
      ["bed3d33a81026f7be93aefad44c5891c27fc8265aa15279a58e287744b7c7753"],
      [
        "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
        "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
      ],
      ["01", "02", "03", "04"],
    ]);
  });

  it("throws error when getting invalid level", () => {
    expect(() => merkleTree.leftSibling(3, 1)).toThrow("Invalid level");
    expect(() => merkleTree.leftSibling(-1, 1)).toThrow("Invalid level");
  });

  it("throws error when getting invalid index", () => {
    // left sibling
    expect(() => merkleTree.leftSibling(2, -1)).toThrow("Invalid index");
    expect(() => merkleTree.leftSibling(2, 5)).toThrow("Invalid index");
    expect(() => merkleTree.leftSibling(2, 2)).toThrow("Invalid index");

    // right sibling
    expect(() => merkleTree.rightSibling(2, -1)).toThrow("Invalid index");
    expect(() => merkleTree.rightSibling(1, 1)).toThrow("Invalid index");
    expect(() => merkleTree.rightSibling(2, 1)).toThrow("Invalid index");
    expect(() => merkleTree.rightSibling(1, 2)).toThrow("Invalid index");
  });

  it("gets left sibling correctly", () => {
    expect(merkleTree.leftSibling(2, 1)).toBe("01");
    expect(merkleTree.leftSibling(1, 1)).toBe(
      "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222"
    );
  });

  it("gets right sibling correctly", () => {
    expect(merkleTree.rightSibling(1, 0)).toBe(
      "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947"
    );
    expect(merkleTree.rightSibling(2, 0)).toBe("02");
  });

  // getProofByIndex

  it("throws error when getting proof by invalid index", () => {
    expect(() => merkleTree.getProofByLeafIndex(-1)).toThrow("Invalid index");
    expect(() => merkleTree.getProofByLeafIndex(4)).toThrow("Invalid index");
  });

  it("gets proof by index correctly", () => {
    const expectedProofs: MerkleProof[] = [
      [
        { type: Sibling.RIGHT, value: "02" },
        {
          type: Sibling.RIGHT,
          value:
            "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
        },
      ],
      [
        { type: Sibling.LEFT, value: "01" },
        {
          type: Sibling.RIGHT,
          value:
            "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
        },
      ],
      [
        { type: Sibling.RIGHT, value: "04" },
        {
          type: Sibling.LEFT,
          value:
            "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
        },
      ],
      [
        { type: Sibling.LEFT, value: "03" },
        {
          type: Sibling.LEFT,
          value:
            "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
        },
      ],
    ];

    expect(merkleTree.getProofByLeafIndex(0)).toEqual(expectedProofs[0]);
    expect(merkleTree.getProofByLeafIndex(1)).toEqual(expectedProofs[1]);
    expect(merkleTree.getProofByLeafIndex(2)).toEqual(expectedProofs[2]);
    expect(merkleTree.getProofByLeafIndex(3)).toEqual(expectedProofs[3]);
  });

  it("gets proof correctly", () => {
    expect(merkleTree.getProof("01")).toEqual([
      { type: Sibling.RIGHT, value: "02" },
      {
        type: Sibling.RIGHT,
        value:
          "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
      },
    ]);

    expect(merkleTree.getProof("02")).toEqual([
      { type: Sibling.LEFT, value: "01" },
      {
        type: Sibling.RIGHT,
        value:
          "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
      },
    ]);

    expect(merkleTree.getProof("03")).toEqual([
      { type: Sibling.RIGHT, value: "04" },
      {
        type: Sibling.LEFT,
        value:
          "a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222",
      },
    ]);
  });

  it("validate proof correctly", () => {
    const root = merkleTree.getRoot();
    expect(
      merkleTree.validateProof(root, "01", merkleTree.getProof("01"))
    ).toBe(true);

    //wrong root
    expect(
      merkleTree.validateProof("wrong_root", "01", merkleTree.getProof("01"))
    ).toBe(false);

    //wrong proof
    expect(
      merkleTree.validateProof(root, "01", merkleTree.getProof("02"))
    ).toBe(false);
  });
});

describe("MerkleTree", () => {
  let tree: MerkleTree;
  const hashes = ["01", "02", "03", "04"].map((h) => h as Hash);
  const rootHash =
    "bed3d33a81026f7be93aefad44c5891c27fc8265aa15279a58e287744b7c7753" as Hash;

  beforeAll(() => {
    tree = new MerkleTree(hashes);
  });

  describe("validateProof", () => {
    it("should validate correct proof", () => {
      const proof: MerkleProof = [
        { type: Sibling.RIGHT, value: "02" as Hash },
        {
          type: Sibling.RIGHT,
          value:
            "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947" as Hash,
        },
      ];
      expect(tree.validateProof(rootHash, "01" as Hash, proof)).toBe(true);
    });

    it("should return false for wrong proof (wrong hash)", () => {
      const proof: MerkleProof = [
        { type: Sibling.RIGHT, value: "02" as Hash },
        {
          type: Sibling.RIGHT,
          value:
            "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947" as Hash,
        },
      ];
      expect(tree.validateProof(rootHash, "05" as Hash, proof)).toBe(false);
    });

    it("should return false for wrong proof (wrong side)", () => {
      const proof: MerkleProof = [
        { type: Sibling.LEFT, value: "02" as Hash },
        {
          type: Sibling.RIGHT,
          value:
            "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947" as Hash,
        },
      ];
      expect(tree.validateProof(rootHash, "01" as Hash, proof)).toBe(false);
    });

    it("should return false for too short proof", () => {
      const proof: MerkleProof = [{ type: Sibling.RIGHT, value: "02" as Hash }];
      expect(tree.validateProof(rootHash, "01" as Hash, proof)).toBe(false);
    });

    it("should return false for empty proof", () => {
      const proof: MerkleProof = [];
      expect(tree.validateProof(rootHash, "01" as Hash, proof)).toBe(false);
    });

    it("should return false for wrong root", () => {
      const proof: MerkleProof = [
        { type: Sibling.RIGHT, value: "02" as Hash },
        {
          type: Sibling.RIGHT,
          value:
            "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947" as Hash,
        },
      ];
      const wrongRoot = "1234567890abcdef" as Hash;
      expect(tree.validateProof(wrongRoot, "01" as Hash, proof)).toBe(false);
    });
  });
});
