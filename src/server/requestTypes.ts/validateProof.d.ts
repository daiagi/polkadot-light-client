import { Request } from "express";
import { Sibling } from "../../merkleTree/SiblingNode";

export interface ValidateProofRequest extends Request {
  body: HeaderHashRequestBody | BlockNumberRequestBody;
}

interface ProofItem {
  type: Sibling;
  value: string;
}

interface HeaderHashRequestBody {
  identifierType: "headerHash";
  headerHash: string;
  proof: ProofItem[];
}

interface BlockNumberRequestBody {
  identifierType: "blockNumber";
  blockNumber: number;
  proof: ProofItem[];
}
