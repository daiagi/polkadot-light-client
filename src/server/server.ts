import express from "express";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { LightClient } from "../client/LightClient";
import { validateClient } from "./middlewares/validateClient";
import { validateHeader } from "./middlewares/validateHeader";
import { Header } from "@polkadot/types/interfaces";
import { ValidateProofRequest } from "./requestTypes.ts/validateProof";
import setupSwagger from "./swaggerConfig";

const app = express();
const port = 3000;
const BATCH_SIZE = 16;
const BLOCK_TIME = {
  unit: "seconds",
  value: 6,
};

const wsProvider = new WsProvider("wss://rpc.polkadot.io");
const api = new ApiPromise({ provider: wsProvider });

let lightClient: LightClient;

const startServer = async () => {
  await api.isReady;

  lightClient = new LightClient(api, BATCH_SIZE);
  await lightClient.init();

  const headerValidator = validateHeader(lightClient);

  app.use(express.json());
  app.use(validateClient(lightClient));

  setupSwagger(app); // Setup Swagger

  app.get("/headers", (req, res) => {
    const limit = req.query.limit as string;
    try {
      const int_limit = limit !== undefined ? parseInt(limit) : undefined;
      res.json(lightClient.getLatestHeaders(int_limit));
    } catch (error) {
      res.status(500).send("Error fetching headers");
    }
  });

  app.get("/headers/hash/:hash", headerValidator, (req, res) => {
    const header = res.locals.header as Header;
    res.json({ header, headerHash: header.hash.toHex() });
  });

  app.get("/headers/blockNumber/:blockNumber", headerValidator, (req, res) => {
    const header = res.locals.header as Header;
    return res.json({ header, headerHash: header.hash.toHex() });
  });

  app.get("/headers/hash/:hash/proof", headerValidator, (req, res) => {
    const header = res.locals.header as Header;

    try {
      const proof = lightClient.getProof(header);
      res.json({ proof });
    } catch (error) {
      const estimatedTime = lightClient.getEstimatedTimeForProof(
        header.hash.toHex(),
        BLOCK_TIME.value
      );
      res.status(500).json({
        error: "Proof for the given header not yet available",
        time_until_ready: `${estimatedTime} ${BLOCK_TIME.unit}`,
      });
    }
  });

  app.get(
    "/headers/blockNumber/:blockNumber/proof",
    headerValidator,
    (req, res) => {
      const header = res.locals.header as Header;

      try {
        const proof = lightClient.getProof(header);
        res.json({ proof });
      } catch (error) {
        const estimatedTime = lightClient.getEstimatedTimeForProof(
          header.hash.toHex(),
          BLOCK_TIME.value
        );
        res.status(500).json({
          error: "Proof for the given header not yet available",
          time_until_ready: `${estimatedTime} ${BLOCK_TIME.unit}`,
        });
      }
    }
  );

  app.post("/validateProof", (req: ValidateProofRequest, res) => {
    const { proof, headerHash, blockNumber } = req.body;

    let header;
    if (headerHash) {
      header = lightClient.getHeaderByHash(headerHash);
    } else if (blockNumber) {
      header = lightClient.getHeaderByBlockNumber(blockNumber);
    }

    if (!header) {
      return res.status(404).send("Header not found");
    }
    if (!proof) {
      return res.status(400).send("Proof is required");
    }

    const isValid = lightClient.validateProof(header, proof);
    res.json({ isValid });
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

// Start the server
startServer().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
