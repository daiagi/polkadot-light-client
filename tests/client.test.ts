import { ApiPromise } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";
import { LightClient } from "../src/client/LightClient";
import { MerkleTree } from "../src/merkleTree/MerkleTree";
import { Hash } from "../src/utils/hash";
import { MerkleProof, Sibling } from "../src/merkleTree/SiblingNode";

jest.mock("@polkadot/api");
// jest.mock("../src/merkleTree/MerkleTree");

describe("LightClient", () => {
  let mockApi: ApiPromise;
  let lightClient: LightClient;
  let mockHeader1: Header;
  let mockHeader2: Header;
  let mockHeader3: Header;
  let mockHeader4: Header;

  beforeAll(() => {
    const sharedMockHeader = {
      parentHash: {},
      stateRoot: {},
      extrinsicsRoot: {},
    };
    mockHeader1 = {
      hash: {
        toHex: jest.fn().mockReturnValue("0x123"),
      },
      number: {
        toNumber: jest.fn().mockReturnValue(1),
      },
      ...sharedMockHeader,
    } as unknown as Header;

    mockHeader2 = {
      hash: {
        toHex: jest.fn().mockReturnValue("0x456"),
      },
      number: {
        toNumber: jest.fn().mockReturnValue(2),
      },
      ...sharedMockHeader,
    } as unknown as Header;

    mockHeader3 = {
      hash: {
        toHex: jest.fn().mockReturnValue("0x789"),
      },
      number: {
        toNumber: jest.fn().mockReturnValue(3),
      },
      ...sharedMockHeader,
    } as unknown as Header;

    mockHeader4 = {
      hash: {
        toHex: jest.fn().mockReturnValue("0xabc"),
      },
      number: {
        toNumber: jest.fn().mockReturnValue(4),
      },
      ...sharedMockHeader,
    } as unknown as Header;
  });

  beforeEach(() => {
    const rpcMock = {
      chain: {
        subscribeNewHeads: jest.fn(),
      },
    };

    mockApi = new (jest.fn(() => ({
      isReady: Promise.resolve(mockApi),
    })))() as jest.Mocked<ApiPromise>;

    Object.defineProperty(mockApi, "rpc", {
      value: rpcMock,
      writable: true,
    });
    lightClient = new LightClient(mockApi, 4);
  });

  it("should initialize and listen to new headers", async () => {
    const mockCallback = jest.fn();

    // Mock subscribeNewHeads to call the callback with a mock header and return an unsubscribe function
    (
      mockApi.rpc.chain.subscribeNewHeads as unknown as jest.Mock
    ).mockImplementationOnce((callback) => {
      mockCallback.mockImplementation(() => {
        callback(mockHeader1);
      });
      return Promise.resolve(() => {});
    });

    await lightClient.init();

    // Trigger the callback
    mockCallback();

    // Verify that the LightClient processes the header
    expect(lightClient.getHeaderByHash("0x123")).toEqual(mockHeader1);
    expect(lightClient.getHeaderByBlockNumber(1)).toEqual(mockHeader1);
    expect(mockCallback).toHaveBeenCalled();
  });

  it("should store headers and create a Merkle tree", async () => {
    (
      mockApi.rpc.chain.subscribeNewHeads as unknown as jest.Mock
    ).mockImplementationOnce((callback) => {
      callback(mockHeader1);
      callback(mockHeader2);
      callback(mockHeader3);
      callback(mockHeader4);
      return Promise.resolve(() => {});
    });

    await lightClient.init();

    const merkleTrees = lightClient["merkleTrees"];
    expect(merkleTrees.length).toBe(1);
    const tree = merkleTrees[0];

    expect(tree).toBeInstanceOf(MerkleTree);
    expect(tree.getRoot()).toBe(
      "2dba5dbc339e7316aea2683faf839c1b7b1ee2313db792112588118df066aa35"
    );
    expect(tree.getTree().length).toEqual(3);
    expect(tree.getTree()[2]).toEqual(["0x123", "0x456", "0x789", "0xabc"]);

    expect(lightClient.getHeaderByHash("0x123")).toEqual(mockHeader1);
    expect(lightClient.getHeaderByBlockNumber(1)).toEqual(mockHeader1);
    expect(lightClient.getHeaderByHash("0x456")).toEqual(mockHeader2);
    expect(lightClient.getHeaderByBlockNumber(2)).toEqual(mockHeader2);
  });

  it("should throw if no Merkle tree exists", async () => {
    (
      mockApi.rpc.chain.subscribeNewHeads as unknown as jest.Mock
    ).mockImplementationOnce((callback) => {
      callback(mockHeader1);

      return Promise.resolve(() => {});
    });

    await lightClient.init();
    expect(() => lightClient.getProof(mockHeader1)).toThrow(
      "Merkle tree not found"
    );
  });

  it("should generate a Merkle proof for a header", async () => {
    (
      mockApi.rpc.chain.subscribeNewHeads as unknown as jest.Mock
    ).mockImplementationOnce((callback) => {
      callback(mockHeader1);
      callback(mockHeader2);
      callback(mockHeader3);
      callback(mockHeader4);
      return Promise.resolve(() => {});
    });

    await lightClient.init();

    // Expected proof for header "0x123"
    const expectedProof = [
      { type: Sibling.RIGHT, value: "0x456" },
      {
        type: Sibling.RIGHT,
        value:
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      }, // Mocked concatenated hash
    ];

    const proof = lightClient.getProof(mockHeader1);
    expect(proof).toEqual(expectedProof);

    // Expected proof for header "0x456"
    const expectedProof2 = [
      { type: Sibling.LEFT, value: "0x123" },
      {
        type: Sibling.RIGHT,
        value:
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      }, // Mocked concatenated hash
    ];

    const proof2 = lightClient.getProof(mockHeader2);
    expect(proof2).toEqual(expectedProof2);
  });

  it("should return recent headers", async () => {
    (
      mockApi.rpc.chain.subscribeNewHeads as unknown as jest.Mock
    ).mockImplementationOnce((callback) => {
      callback(mockHeader1);
      callback(mockHeader2);
      callback(mockHeader3);
      callback(mockHeader4);
      return Promise.resolve(() => {});
    });

    await lightClient.init();

    const recentHeaders = lightClient.getLatestHeaders(2);
    expect(recentHeaders).toEqual([
      { blockNumber: 4, hash: "0xabc" },
      { blockNumber: 3, hash: "0x789" },
    ]);
  });
  it("should estimate time for proof", async () => {
    (
      mockApi.rpc.chain.subscribeNewHeads as unknown as jest.Mock
    ).mockImplementationOnce((callback) => {
      callback(mockHeader1);
      callback(mockHeader2);
      return Promise.resolve(() => {});
    });

    await lightClient.init();

    const estimatedTime = lightClient.getEstimatedTimeForProof("0x123", 6);
    expect(estimatedTime).toBe(12); // 2 remaining headers with 6 seconds block time

    const estimatedTime2 = lightClient.getEstimatedTimeForProof("0x456", 6);
    expect(estimatedTime2).toBe(12); // 2 remaining headers with 6 seconds block time

    const nonExistentHeader = lightClient.getEstimatedTimeForProof("0x999", 6);
    expect(nonExistentHeader).toBeUndefined();
  });
});
