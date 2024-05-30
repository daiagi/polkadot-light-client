import { Request } from 'express';
import { Sibling } from '../../merkleTree/SiblingNode';

export interface ValidateProofRequest extends Request {
  body: {
    proof: { type: Sibling; value: string }[];
    headerHash?: string;
    blockNumber?: number;
  };
}
