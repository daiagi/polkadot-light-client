import { chunkArray, pad } from "../src/utils/arrays";
import { concatenateHashes, hash } from "../src/utils/hash";

describe("utils test", () => {
  it("hash sanity check", () => {
    const data = "some string";
    const data2 = "some string ";
    expect(hash(data)).not.toBe(hash(data2));
  });


  it("concatenates hashes correctly", () => {
    const leftHash = "00ff0a1b";
    const rightHash = "01020304";

    const expectedConcatenatedHash = hash(
      Buffer.concat([Buffer.from([0, 255, 10, 27]), Buffer.from([1, 2, 3, 4])])
    );
    const revereExpectedConcatenatedHash = hash(
      Buffer.concat([Buffer.from([1, 2, 3, 4]), Buffer.from([0, 255, 10, 27])])
    );

    expect(concatenateHashes(leftHash, rightHash)).toBe(
      expectedConcatenatedHash
    );
    expect(concatenateHashes(rightHash, leftHash)).toBe(
      revereExpectedConcatenatedHash
    );
  });
  it("concatenates hashes correctly2", () => {
    const leftHash = "0x00ff0a1b";
    const rightHash = "0x01020304";

    const expectedConcatenatedHash = hash(
      Buffer.concat([Buffer.from([0, 255, 10, 27]), Buffer.from([1, 2, 3, 4])])
    );

    expect(concatenateHashes(leftHash, rightHash)).toBe(
      expectedConcatenatedHash
    );
  });

  it("pads to the power of 2 correctly", () => {
    const hashes = ["1", "2", "3", "4"];
    const hashes2 = ["1", "2", "3", "4", "5"];
    const hashes3 = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    expect(pad(hashes)).toEqual(["1", "2", "3", "4"]);

    expect(pad(hashes2)).toEqual(["1", "2", "3", "4", "5", "0", "0", "0"]);

    // should pad unitl 16
    expect(pad(hashes3)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
    ]);
  });

  it("chunks array correctly", () => {
    const hashes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const chunks = chunkArray(hashes, 2);
    expect(chunks).toEqual([
      ["1", "2"],
      ["3", "4"],
      ["5", "6"],
      ["7", "8"],
      ["9"],
    ]);

  });
});
