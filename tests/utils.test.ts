import { pad } from "../src/utils/arrays";
import { concatenateHashes, hash } from "../src/utils/hash";

describe("utils test", () => {
  it("hash sanity check", () => {
    const data = "some string";
    expect(hash(data)).toBe(
      "61d034473102d7dac305902770471fd50f4c5b26f6831a56dd90b5184b3c30fc"
    );
  });

  it("hash empty string", () => {
    const data = "";
    expect(hash(data)).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });


  it("concatenates hashes correctly", () => {
    const leftHash = "00ff0a1b";
    const rightHash = "01020304";

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
    expect(pad(hashes3)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "0", "0", "0", "0", "0", "0"]);
});
});
