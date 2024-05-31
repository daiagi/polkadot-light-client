# Project Name

Polkadot Block Header Light Client

## Description

A light client for the Polkadot network, specifically designed to manage and verify block headers. The client listens for new headers from the Polkadot main network, batches them, and stores them in a Merkle tree to ensure efficient and secure data management. Key functionalities include querying headers by block number or hash, generating Merkle inclusion proofs for each header, and validating these proofs to confirm the integrity and authenticity of data. This system is tailored for environments that demand high security and accurate data validation without the need for full blockchain node resources.

## How to Start

To get started with this project, run the following commands in your terminal:

```bash
npm install
npm run start
```

the local server will start at http://localhost:3000

## How to Use

swgger documentation is available at http://localhost:3000/api-docs

The client provides a simple REST API to interact with the Polkadot network. The following endpoints are available:

- GET /headers/?limit: Get latest block header, optionally with a limit
- GET /headers/blockNumber/:blockNumber: Get block header by block number
- GET /headers/hash/:hash Get block header by header hash
- GET /headers/blockNumber/:blockNumber/proof Get Merkle inclusion proof for block header by block number
- GET /headers/hash/:hash/proof: Get Merkle inclusion proof for block header by block hash
- POST /validateProof: Verify Merkle inclusion proof for block header

* POST request body example:
```json
{
  "identifierType": "headerHash | blockNumber",
  // either headerHash or blockNumber
  "headerHash": "abc123",
  "blockNumber": 123,
  "proof": [
    {
      "type": "left" | "right",
      "value": "hashValue" // hash value of the sibling node
    }
  ]
}
```
