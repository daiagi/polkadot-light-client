import { MerkleTree } from "../src/merkleTree/MerkleTree";
import { MerkleProof, Sibling } from "../src/merkleTree/SiblingNode";
import { concatenateHashes } from "../src/utils/hash";

describe("merkle tree test", () => {
  let merkleTree: MerkleTree;

  beforeEach(() => {
    const hashes = ["0x01", "0x02", "0x03", "04"];
    merkleTree = new MerkleTree(hashes);
  });

  it("gets root correctly", () => {
    expect(merkleTree.getRoot()).toBe(
      "bed3d33a81026f7be93aefad44c5891c27fc8265aa15279a58e287744b7c7753"
    );
  });

  it("builds tree correctly", () => {
    const tree = merkleTree.getTree();
    const leaves = tree[2];
    const level1 = tree[1];
    const rootLevel = tree[0];

    expect(leaves).toEqual(["0x01", "0x02", "0x03", "04"]);
    const expectedLevel1 = [
      concatenateHashes("0x01", "0x02"),
      concatenateHashes("0x03", "04"),
    ];

    expect(level1).toEqual(expectedLevel1);

    const expectedRootLevel = [
      concatenateHashes(expectedLevel1[0], expectedLevel1[1]),
    ];

    expect(rootLevel).toEqual(expectedRootLevel);
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
    expect(merkleTree.leftSibling(2, 1)).toBe("0x01");
    expect(merkleTree.leftSibling(1, 1)).toBe(
      concatenateHashes("0x01", "0x02")
    );
  });

  it("gets right sibling correctly", () => {
    expect(merkleTree.rightSibling(1, 0)).toBe(concatenateHashes("0x03", "04"));
    expect(merkleTree.rightSibling(2, 0)).toBe("0x02");
  });

  // getProofByIndex

  it("throws error when getting proof by invalid index", () => {
    expect(() => merkleTree.getProofByLeafIndex(-1)).toThrow("Invalid index");
    expect(() => merkleTree.getProofByLeafIndex(4)).toThrow("Invalid index");
  });

  it("gets proof by index correctly", () => {
    const middleLevel = [
      concatenateHashes("0x01", "0x02"),
      concatenateHashes("0x03", "04"),
    ];
    const expectedProofs: MerkleProof[] = [
      [
        { type: Sibling.RIGHT, value: "0x02" },
        {
          type: Sibling.RIGHT,
          value: middleLevel[1],
        },
      ],
      [
        { type: Sibling.LEFT, value: "0x01" },
        {
          type: Sibling.RIGHT,
          value: middleLevel[1],
        },
      ],
      [
        { type: Sibling.RIGHT, value: "04" },
        {
          type: Sibling.LEFT,
          value: middleLevel[0],
        },
      ],
      [
        { type: Sibling.LEFT, value: "0x03" },
        {
          type: Sibling.LEFT,
          value: middleLevel[0],
        },
      ],
    ];

    expect(merkleTree.getProofByLeafIndex(0)).toEqual(expectedProofs[0]);
    expect(merkleTree.getProofByLeafIndex(1)).toEqual(expectedProofs[1]);
    expect(merkleTree.getProofByLeafIndex(2)).toEqual(expectedProofs[2]);
    expect(merkleTree.getProofByLeafIndex(3)).toEqual(expectedProofs[3]);
  });

  it("gets proof correctly", () => {
    const middleLevel = [
      concatenateHashes("0x01", "0x02"),
      concatenateHashes("0x03", "04"),
    ];
    expect(merkleTree.getProof("0x01")).toEqual([
      { type: Sibling.RIGHT, value: "0x02" },
      {
        type: Sibling.RIGHT,
        value: middleLevel[1],
      },
    ]);

    expect(merkleTree.getProof("0x02")).toEqual([
      { type: Sibling.LEFT, value: "0x01" },
      {
        type: Sibling.RIGHT,
        value: middleLevel[1],
      },
    ]);

    expect(merkleTree.getProof("0x03")).toEqual([
      { type: Sibling.RIGHT, value: "04" },
      {
        type: Sibling.LEFT,
        value: middleLevel[0],
      },
    ]);
  });
});

describe("Test proof validation", () => {
  let tree: MerkleTree;
  const hashes = ["01", "02", "03", "04"];
  const expecetdMiddleLevel = [
    concatenateHashes(hashes[0], hashes[1]),
    concatenateHashes(hashes[2], hashes[3]),
  ];
  const expetedRoot = concatenateHashes(
    expecetdMiddleLevel[0],
    expecetdMiddleLevel[1]
  );

  beforeAll(() => {
    tree = new MerkleTree(hashes);
  });

  it("should validate correct proof", () => {
    const proof: MerkleProof = [
      { type: Sibling.RIGHT, value: "02" },
      {
        type: Sibling.RIGHT,
        value: expecetdMiddleLevel[1],
      },
    ];
    expect(tree.validateProof(expetedRoot, "01", proof)).toBe(true);
  });

  it("should return false for non existant leaf", () => {
    const proof: MerkleProof = [
      { type: Sibling.RIGHT, value: "02" },
      {
        type: Sibling.RIGHT,
        value: expecetdMiddleLevel[1],
      },
    ];
    expect(tree.validateProof(expetedRoot, "05", proof)).toBe(false);
  });

  it("should return false for wrong leaf", () => {
    const proof: MerkleProof = [
      { type: Sibling.RIGHT, value: "02" },
      {
        type: Sibling.RIGHT,
        value: expecetdMiddleLevel[1],
      },
    ];
    expect(tree.validateProof(expetedRoot, "03", proof)).toBe(false);
  });

  it("should return false for wrong proof (wrong side)", () => {
    const proof: MerkleProof = [
      { type: Sibling.LEFT, value: "02" },
      {
        type: Sibling.RIGHT,
        value: expecetdMiddleLevel[1],
      },
    ];
    expect(tree.validateProof(expetedRoot, "01", proof)).toBe(false);
  });
  it("should return false for wrong proof (corrupted proof hash)", () => {
    const proof: MerkleProof = [
      { type: Sibling.RIGHT, value: "02" },
      {
        type: Sibling.RIGHT,
        value: expecetdMiddleLevel[1] + "x",
      },
    ];
    expect(tree.validateProof(expetedRoot, "01", proof)).toBe(true);
  });

  it("should return false for too short proof", () => {
    const proof: MerkleProof = [{ type: Sibling.RIGHT, value: "02" }];
    expect(tree.validateProof(expetedRoot, "01", proof)).toBe(false);
  });

  it("should return false for empty proof", () => {
    const proof: MerkleProof = [];
    expect(tree.validateProof(expetedRoot, "01", proof)).toBe(false);
  });
  it("should return false for too long proof", () => {
    const proof: MerkleProof = [
      { type: Sibling.RIGHT, value: "02" },
      { type: Sibling.RIGHT, value: expecetdMiddleLevel[1] },
      { type: Sibling.RIGHT, value: "made_up_hash" },
    ];
    expect(tree.validateProof(expetedRoot, "01", proof)).toBe(false);
  });

  it("should return false for wrong root", () => {
    const proof: MerkleProof = [
      { type: Sibling.RIGHT, value: "02" },
      {
        type: Sibling.RIGHT,
        value:
          "0ce3940bebf2b22a5d2108ecf0c368a0541c7e3c45703f8540921b4eafc82947",
      },
    ];
    const wrongRoot = expetedRoot + "x";
    expect(tree.validateProof(wrongRoot, "01", proof)).toBe(false);
  });
});
